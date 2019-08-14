

var sass = require('gulp-sass');



////  Tasks ////

gulp.task('sass', function(){
    gulp.src('app/styles/sass/**/*.+(scss|sass)')
      .pipe(sass()) // Using gulp-sass
      .pipe(gulp.dest('app/styles/css'))
  });
// Gulp watch syntax
gulp.task('watch', function(){
    gulp.watch('app/styles/sass/**/*.+(scss|sass)', ['sass']);
  })