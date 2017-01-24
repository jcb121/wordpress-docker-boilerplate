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

var types = ['plugins', 'themes'];
var tasks = [
  //{ name: 'clean',  function: clean },
  { name: 'php',    function: move_static, file_types: ['php'] },
  { name: 'js',     function: move_js,     file_types: ['js'] },
  { name: 'sass',   function: sass,        file_types: ['scss'] },
  { name: 'assets', function: move_static, file_types: ['svg', 'png', 'jpg', 'jpeg' ]}
]

gulp.task('default', types.concat(['watch']))
gulp.task('clean', ['themes:clean', 'plugins:clean'])

types.forEach(function(type){
  gulp.task(type, tasks.map(function(task){ return type + ':' + task.name }));
  tasks.forEach(function(task){
    gulp.task(type + ':' + task.name, task.function.bind(this, type, task.file_types));
  })
})

gulp.task('watch', function(){
  types.forEach(function(plugin_type){
    tasks.forEach(function(task){
      var files  = task.file_types.map(function(type){ return './' + plugin_type + '_src/**/*.' + type })
      gulp.watch(files,  ['themes:'  + task.name]);
    });
  });
});

function clean(type){
  return gulp.src('./' + type + '_src/*')
  .pipe(foreach(function(stream, file){
    var path = file.history[0].split('/').reverse()[0]
    return del('./dist/' + type + '/' + path);
    //return stream;
  }))
}

function move_static(type, file_type){

  if(typeof file_type === 'string'){
    file_type = [file_type];
  }

  file_type = file_type.map(function(){
    return './' + type + '_src/**/*.' + file_type;
  });

  return gulp.src(file_type)
  .pipe(gulp.dest('./dist/' + type));
}

function move_js(type){
  return gulp.src('./' + type + '_src/**/*.js')
  .pipe(gulp.dest('./dist/' + type));
}

function concat_js(type){
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
}

function sass(type) {
  return gulp.src('./' + type + '_src/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/' + type));
}

gulp.task('compose', function(){
  exec('docker-compose up', function (err, stdout, stderr) {
  console.log(stdout);
  console.log(stderr);
  cb(err);
  })
})
