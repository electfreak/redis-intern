const gulp = require('gulp'),
      sass = require('gulp-sass'),
      browserSync = require('browser-sync').create();

const scss = 'scss/*.scss';

gulp.task('sass', function () {
  return gulp.src(scss)
    .pipe(sass())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream())
});

gulp.task('serve', function () {

  browserSync.init({
    server: './',
  });

});

gulp.task('watch', function() {
  gulp.watch(scss, gulp.parallel('sass'));
  gulp.watch('*.js').on('change', browserSync.reload);
  gulp.watch('*.html').on('change', browserSync.reload);
});

gulp.task('default', gulp.parallel('serve', 'sass', 'watch'));