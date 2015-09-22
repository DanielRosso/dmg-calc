var gulp = require('gulp')
  , less = require('gulp-less')
  , path = require('path')
  , inject = require('gulp-inject')
  , browserSync = require('browser-sync').create()
  , clean = require('gulp-clean')
  , wiredep = require('wiredep').stream
  , angularFileSort = require('gulp-angular-filesort')
  , install = require("gulp-install")
  , sync = require('gulp-sync')(gulp)
  , htmlInjector = require('bs-html-injector')
  , watch = require('gulp-watch')
  , spa = require('browser-sync-spa');

var paths =
  {
    clientApp: "./client/app/",
    client: "./client/",
    tmp: "./.tmp/",
    assets: "./client/assets/"
  }

gulp.task('install', function () {
  return gulp.src(['tsd.json', 'bower.json'])
    .pipe(install());
});

gulp.task('serve', ['inject'], function () {
  browserSync.use(spa({
    selector: "[ng-app]" // Only needed for angular apps
  }));

  browserSync.init({
    server: {
      // baseDir: [paths.tmp, paths.src]
      baseDir: ["./"]
    }
    , startPath: paths.tmp + "index.html"
    , plugins: [
      {
        module: "bs-html-injector"
        , options: {
          files: [paths.tmp + "**/*.html"]
        }
      }
    ]
  });

  gulp.watch(paths.assets + "css/**/*.less", ['less']);
  gulp.watch(paths.tmp + "*.html", htmlInjector);
  // gulp.watch(paths.client + "/*.html", ['copy:html-tmp']);
  gulp.watch(paths.client + "/*.html", ['html-watch']);
});

gulp.task('html-watch', ['copy-html'], browserSync.reload);

gulp.task('copy-html', function () {
  var target = gulp.src('./client/index.html');
  var injectStyles = gulp
    .src(paths.tmp + '/*.css', { read: false });

  var injectScripts = gulp
    .src(paths.clientApp + '**/*.js')
    .pipe(angularFileSort());

  var injectLibs = gulp.src(paths.assets + "libs/d3.tooltips.js");

  return target
    .pipe(inject(injectStyles))
    .pipe(inject(injectScripts))
    .pipe(inject(injectLibs))
    .pipe(wiredep()) //for bower dep
    .pipe(gulp.dest(paths.tmp));
})

gulp.task('less', function () {
  return gulp
    .src(paths.assets + '/css/less/**/*.less')
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes')]
    }))
    .pipe(gulp.dest(paths.tmp))
    .pipe(browserSync.stream());
});

gulp.task('inject', sync.sync(['clean', 'less']), function () {
  var target = gulp.src('./client/index.html');
  var injectStyles = gulp
    .src(paths.tmp + '/*.css', { read: false });

  var injectScripts = gulp
    .src(paths.clientApp + '**/*.js')
    .pipe(angularFileSort());

  var injectLibs = gulp.src(paths.assets + "libs/d3.tooltips.js");

  return target
    .pipe(inject(injectStyles))
    .pipe(inject(injectScripts))
    .pipe(inject(injectLibs))
    .pipe(wiredep()) //for bower dep
    .pipe(gulp.dest(paths.tmp));
});

gulp.task('clean', function () {
  return gulp.src(paths.tmp, { read: false })
    .pipe(clean());
});
