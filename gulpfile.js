'use strict';
var gulp = require('gulp');
var exec = require('child_process').exec;
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var foreach = require('gulp-foreach');
var del = require('del');

gulp.task('default', ['themes', 'plugins', 'watch'])

gulp.task('clean', ['themes:clean', 'plugins:clean'])

gulp.task('plugins', ['plugins:sass', 'plugins:js'])

gulp.task('themes', ['themes:sass', 'themes:js'])

/*
 * Clean
 */
gulp.task('themes:clean', function(){
  return gulp.src('./themes_src/*')
    .pipe(foreach(function(stream, file){
      var path = file.history[0].split('/').reverse()[0]
      del('./dist/themes/' + path);
      return stream;
    }))
});

gulp.task('plugins:clean', function(){
  return gulp.src('./plugins_src/*')
    .pipe(foreach(function(stream, file){
      var path = file.history[0].split('/').reverse()[0]
      del('./dist/plugins/' + path);
      return stream;
    }))
});
/*
 * PHP / html
 */
gulp.task('themes:php', function(){
  return gulp.src(['./themes_src/**/*.scss', './themes_src/**/*.html'])
    .pipe(gulp.dest('./dist/themes'));
})

gulp.task('plugins:php', function(){
  return gulp.src(['./plugins_src/**/*.php', './plugins_src/**/*.html'])
    .pipe(gulp.dest('./dist/plugins'));
})

/*
 * JS
 */
gulp.task('themes:js', function () {
  return gulp.src('./themes_src/*')
    .pipe(foreach(function(stream, file){
      var path = file.history[0].split('/').reverse()[0]
      gulp.src(file.history[0] + '/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('scripts.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/themes/' + path))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/themes/' + path));
      return stream;
    }));
});

gulp.task('plugins:js', function () {
  return gulp.src('./plugins_src/*')
    .pipe(foreach(function(stream, file){
      var path = file.history[0].split('/').reverse()[0]
      gulp.src(file.history[0] + '/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('scripts.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/plugins/' + path))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/plugins/' + path));
      return stream;
    }));
});

/*
 * CSS
 */
gulp.task('themes:sass', function () {
  return gulp.src('./themes_src/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/themes'));
});

gulp.task('plugins:sass', function () {
  return gulp.src('./plugins_src/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/plugins'));
});



gulp.task('watch', function () {
  gulp.watch('./themes_src/**/*.scss', ['themes:sass']);
  gulp.watch('./plugins_src/**/*.scss', ['plguins:sass']);

  gulp.watch('./themes_src/**/*.php', ['themes:php']);
  gulp.watch('./plugins_src/**/*.php', ['plugins:php']);

  gulp.watch('./themes_src/**/*.html', ['themes:php']);
  gulp.watch('./plugins_src/**/*.html', ['plugins:php']);

  gulp.watch('./themes_src/**/*.js', ['themes:js']);
  gulp.watch('./plugins_src/**/*.js', ['plugins:js']);
});


gulp.task('compose', function(){
  exec('docker-compose up', function (err, stdout, stderr) {
  console.log(stdout);
  console.log(stderr);
  cb(err);
  })
})
