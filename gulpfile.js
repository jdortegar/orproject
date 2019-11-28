'use strict';

var gulp = require('gulp'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  sass = require('gulp-sass'),
  maps = require('gulp-sourcemaps'),
  del = require('del'),
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require('browser-sync').create(),
  htmlreplace = require('gulp-html-replace'),
  cssmin = require('gulp-clean-css');

gulp.task('concatScripts', function() {
  return gulp
    .src([
      'assets/js/vendor/jquery-3.3.1.min.js',
      'assets/js/vendor/popper.min.js',
      'assets/js/vendor/bootstrap.min.js',
    ])
    .pipe(maps.init())
    .pipe(concat('main.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('assets/js'))
    .pipe(browserSync.stream());
});

gulp.task(
  'minifyScripts',
  gulp.series('concatScripts', function() {
    return gulp
      .src('assets/js/main.js')
      .pipe(uglify())
      .pipe(rename('main.min.js'))
      .pipe(gulp.dest('docs/assets/js'));
  })
);

gulp.task('compileSass', function() {
  return gulp
    .src('assets/css/main.scss')
    .pipe(maps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(maps.write('./'))
    .pipe(gulp.dest('assets/css'))
    .pipe(browserSync.stream());
});

gulp.task(
  'minifyCss',
  gulp.series('compileSass', function() {
    return gulp
      .src('assets/css/main.css')
      .pipe(cssmin())
      .pipe(rename('main.min.css'))
      .pipe(gulp.dest('docs/assets/css'));
  })
);

gulp.task('watchFiles', function(done) {
  gulp.watch('assets/css/**/*.scss', gulp.series('compileSass'));
  gulp.watch('assets/js/*.js', gulp.series('concatScripts'));
  done();
});

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: './',
    },
  });
});

gulp.task('clean', function() {
  return del(['docs', 'assets/css/main.css*', 'assets/js/main*.js*']);
});

gulp.task('renameSources', function() {
  return gulp
    .src('*.html')
    .pipe(
      htmlreplace({
        js: 'assets/js/main.min.js',
        css: 'assets/css/main.min.css',
      })
    )
    .pipe(gulp.dest('docs/'));
});

gulp.task(
  'build',
  gulp.series(gulp.parallel('minifyScripts', 'minifyCss'), function() {
    return gulp
      .src(
        [
          '*.html',
          '*.php',
          '*.css',
          'favicon.ico',
          'assets/img/**',
          'assets/css/theme.css',
          'assets/js/theme.js',
          'assets/fonts/**',
        ],
        { base: './' }
      )
      .pipe(gulp.dest('docs'));
  })
);

gulp.task(
  'serve',
  gulp.series('watchFiles', function() {
    browserSync.init({
      server: './',
    });

    gulp.watch('assets/css/**/*.scss', gulp.series('watchFiles'));
    gulp.watch('*.html').on('change', browserSync.reload);
  })
);

gulp.task('default', gulp.series('clean', 'build', 'renameSources'));
