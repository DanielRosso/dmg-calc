var gulp = require('gulp')
  , less = require('gulp-less')
  , path = require('path')
  , inject = require('gulp-inject')
  , browserSync = require('browser-sync').create()
  , wiredep = require('wiredep').stream
  , angularFileSort = require('gulp-angular-filesort')
  , install = require("gulp-install")
  , sync = require('gulp-sync')(gulp)
  , htmlInjector = require('bs-html-injector')
//  , watch = require('gulp-watch')
  , spa = require('browser-sync-spa')
  , plumber = require('gulp-plumber')
  , concat = require('gulp-concat')
  , del = require('del');

var paths =
  {
    clientApp: "./client/app/",
    client: "./client/",
    tmp: "./.tmp/",
    assets: "./client/assets/"
  }

function isOnlyChange(event) {
  return event.type === 'changed';
}

gulp.task('install', function () {
  return gulp.src(['tsd.json', 'bower.json'])
    .pipe(install());
});

gulp.task('serve', ['watch'], function () {
  browserSync.init({
    server: {
      baseDir: [paths.tmp, paths.client]
      , index: paths.tmp + 'index.html'
      , routes: {
        '/bower_components': 'bower_components'
      }
    },
    startPath: 'index.html'
  });
});

gulp.task('watch', ['inject'], function () {
  gulp.watch(path.join(paths.client, '/*.html'), ['inject'], browserSync.reload);

  gulp.watch(paths.client + "**/*.less", function (event) {
    if (isOnlyChange(event)) {
      gulp.start('less');
    } else {
      gulp.start('inject');
    }
  });

  gulp.watch(paths.clientApp + "**/*.js", function (event) {
    if (isOnlyChange(event)) {
      gulp.start('scripts');
    } else {
      gulp.start('inject')
    }
  });
});

gulp.task('inject', ['less', 'css'], function () {
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

gulp.task('scripts', function () {
  return gulp.src(paths.clientApp + "**/*.js")
    .pipe(browserSync.reload);
});

gulp.task('css', function () {
  return gulp
    .src(paths.assets + '**/*.css')
    .pipe(gulp.dest(paths.tmp));
})

gulp.task('less', function () {
  return gulp
    .src(paths.assets + '/css/less/**/*.less')
    .pipe(plumber())
    .pipe(concat('styles.less'))
    .pipe(less())
    .pipe(gulp.dest(paths.tmp))
    .pipe(browserSync.stream());
});

gulp.task('clean', function () {
  return del(paths.tmp);
});
