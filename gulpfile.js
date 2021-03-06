var gulp = require('gulp')
    , less = require('gulp-less')
    , path = require('path')
    , inject = require('gulp-inject')
    , browserSync = require('browser-sync').create()
    , wiredep = require('wiredep').stream
    , angularFileSort = require('gulp-angular-filesort')
    , install = require("gulp-install")
    , sync = require('gulp-sync')(gulp)
    , spa = require('browser-sync-spa')
    , plumber = require('gulp-plumber')
    , concat = require('gulp-concat')
    , del = require('del')
    , rev = require('gulp-rev')
    , revReplace = require('gulp-rev-replace')
    , uglify = require('gulp-uglify')
    , saveLicense = require('uglify-save-license')
    , csso = require('gulp-csso')
    , useref = require('gulp-useref')
    , minifyHTML = require('gulp-minify-html')
    , size = require('gulp-size')
    , filter = require('gulp-filter')
    , ghPages = require('gulp-gh-pages-cname');

var paths =
    {
        clientApp: "./client/app/",
        client: "./client/",
        tmp: "./.tmp/",
        assets: "./client/assets/",
        dist: "./dist/",
        publish: "./.publish/",
        images: "./client/assets/img/**/*"
    }

function isOnlyChange(event) {
    return event.type === 'changed';
}

gulp.task('install', function() {
    return gulp.src(['tsd.json', 'bower.json', 'package.json'])
        .pipe(install());
});

/**
 * Push build to gh-pages
 */
gulp.task('deploy', ['build'], function() {
    return gulp.src("./dist/**/*")
        .pipe(ghPages({
            cname: "d3dps.rosso.li"
        }))
});

gulp.task('serve', ['watch'], function() {
    browserSync.init({
        server: {
            baseDir: [paths.tmp, paths.client, "./client/assets/"]
            , index: paths.tmp + 'index.html'
            , routes: {
                '/bower_components': 'bower_components'
            }
        },
        startPath: 'index.html'
    });
});

gulp.task('serve:dist', ['build'], function() {
    browserSync.init({
        server: {
            baseDir: paths.dist
        }
    })
})

gulp.task('build', sync.sync(['clean', ['html', 'images']]));

/**
 * build the minified html, css and js files and place them in the dist folder.
 */
gulp.task('html', ['inject'], function() {
    var htmlFilter = filter('*.html', { restore: true });
    var jsFilter = filter('**/*.js', { restore: true });
    var cssFilter = filter('**/*.css', { restore: true });

    return gulp.src(".tmp/*.html")
        .pipe(useref())
        //.pipe(rev())
        .pipe(jsFilter)
        .pipe(rev())
        .pipe(uglify({ preserveComments: saveLicense }))
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(rev())
        .pipe(csso())
        .pipe(cssFilter.restore)
        .pipe(revReplace())
        .pipe(htmlFilter)
        .pipe(minifyHTML({
            empty: true,
            spare: true,
            quotes: true,
            conditionals: true
        }))
        .pipe(htmlFilter.restore)
        .pipe(size({
            title: paths.dist, showFiles: true
        }))
        .pipe(gulp.dest(paths.dist))
});

gulp.task('watch', ['inject'], function() {
    gulp.watch(path.join(paths.client, '/*.html'), ['inject'], browserSync.reload);

    //watch .css files
    gulp.watch("client/**/*.less", function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        if (isOnlyChange(event)) {
            gulp.start('less');
        } else {
            gulp.start('inject');
        }
    });

    //watch .js files
    gulp.watch("client/**/*.js", function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        if (isOnlyChange(event)) {
            gulp.start('scripts');
        } else {
            gulp.start('inject')
        }
    });

    //watch image files
    gulp.watch('client/app/img/**/*', ['images']);
});

gulp.task('inject', ['less', 'css'], function() {
    var injectStyles = gulp.src(
        paths.tmp + '**/*.css'
        , { read: false });

    var injectScripts = gulp.src([
        paths.client + '**/*.js',
        "!client/assets/libs/tooltip.js"
    ])
        .pipe(angularFileSort());

    var injectOptions = {
        ignorePath: ['.tmp', 'client'],
    };

    return gulp.src(paths.client + '*.html')
        .pipe(inject(injectStyles, injectOptions))
        .pipe(inject(injectScripts, injectOptions))
        .pipe(wiredep())
        .pipe(gulp.dest(paths.tmp))
        .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
    return gulp.src(paths.clientApp + "**/*.js")
        .pipe(browserSync.reload);
});

gulp.task('css', function() {
    return gulp
        .src(paths.assets + '**/*.css')
        .pipe(gulp.dest(paths.tmp));
})

gulp.task('less', function() {
    return gulp
        .src(paths.assets + '/css/less/**/*.less')
        .pipe(plumber())
        .pipe(concat('styles.less'))
        .pipe(less())
        .pipe(gulp.dest(paths.tmp))
        .pipe(browserSync.stream());
});

gulp.task('images', function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest(paths.dist + '/img'));
});

gulp.task('clean', function() {
    return del([paths.tmp, paths.dist, paths.publish]);
});
