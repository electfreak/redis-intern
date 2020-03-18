const { src, parallel, series, dest, watch } = require('gulp'),
      sassCompile = require('gulp-sass'),
      browserSync = require('browser-sync').create(),
      browserify = require('browserify');

const scss = 'scss/*.scss';

function sass() {
  return src(scss)
    .pipe(sassCompile())
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream())
};

function serve(done) {
  browserSync.init({
    server: './',
  });

  done();
};

function watchFiles() {
  watch(scss, parallel(sass));
  watch('*.js').on('change', browserSync.reload);
  watch('*.html').on('change', browserSync.reload);
};

exports.start = parallel(serve, series(sass, watchFiles));