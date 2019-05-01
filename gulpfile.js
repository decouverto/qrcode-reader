var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var log = require('gulplog');
var rename = require('gulp-rename');
var csso = require('gulp-csso');
var autoprefixer = require('gulp-autoprefixer');
var through = require('through');
var request = require('request');
var htmlmin = require('gulp-htmlmin');
var fs = require('fs');
var isDist = process.argv.indexOf('serve') === -1;


gulp.task('favicon', function () {
  return request('https://decouverto.fr/favicon.ico').pipe(fs.createWriteStream('./dist/favicon.ico'));
});

gulp.task('css', function () {
    return gulp.src('src/css/main.css')
    .pipe(isDist ? csso() : through())
    .pipe(isDist ? autoprefixer('last 2 versions', { map: false }) : through())
    .pipe(rename('build.css'))
    .pipe(gulp.dest('dist/css/'));
});

gulp.task('js', function () {
    var b = browserify({
      entries: 'src/js/main.js',
      debug: true
    });
  
    return b.bundle()
      .pipe(source('src/js/main.js'))
      .pipe(buffer())
      .pipe(uglify())
        .on('error', log.error)
      .pipe(rename('build.js'))
      .pipe(gulp.dest('dist/js/'));
});


gulp.task('css-watch', ['css'], function (done) {
    browserSync.reload();
    done();
});

gulp.task('js-watch', ['js'], function (done) {
    browserSync.reload();
    done();
});

gulp.task('reload', function (done) {
    browserSync.reload();
    done();
});

gulp.task('html', function () {
    gulp.src('./src/index.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('html-watch', ['html'], function (done) {
    browserSync.reload();
    done();
});

gulp.task('default', ['favicon', 'js', 'css', 'html']);


gulp.task('serve', ['js', 'css', 'html'], function () {

    browserSync.init({
        server: './dist'
    });

    gulp.watch('src/index.html', ['html-watch']);
    gulp.watch('src/css/main.css', ['css-watch']);
    gulp.watch('src/js/**/**.js', ['js-watch']);
});
