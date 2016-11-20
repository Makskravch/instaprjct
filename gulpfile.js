const gulp         = require('gulp');
const stylus       = require('gulp-stylus');
const postcss      = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sourcemaps   = require('gulp-sourcemaps');
const concat       = require('gulp-concat');
const include      = require('gulp-include');
const order        = require('gulp-order');
const gutil        = require('gulp-util');
const plumber      = require('gulp-plumber');
const notify       = require('gulp-notify');
const cache        = require('gulp-cached');
const handlebars   = require('gulp-handlebars');
const wrap         = require('gulp-wrap');
const declare      = require('gulp-declare');
const merge        = require('merge-stream');
const sequence     = require('run-sequence');
const path         = require('path');
const del          = require('del');
const server       = require('browser-sync').create();

const errorHandler = (title = 'Error') => plumber({
  errorHandler: notify.onError({
    title,
    message: '<%= error.message %>',
    sound: 'Submarine'
  })
});


gulp.task('server', () => {
  server.init({
    server: {
      baseDir: 'public',
      routes: {
        '/libs': 'node_modules'
      }
    },
    files: [
      'public/css/**/*.css',
      'public/js/**/*.js',
      'public/**/*.html'
    ],
    open: gutil.env.open !== false,
    ghostMode: false,
    middleware: [
      require('connect-history-api-fallback')()
    ]
  });
});


gulp.task('styles', () => {
  return gulp
    .src('src/css/[^_]*.styl')
    .pipe(errorHandler())
    .pipe(sourcemaps.init())
    .pipe(stylus({
      paths: ['src/css', 'node_modules'],
      'include css': true
    }))
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/css'));
});


gulp.task('scripts', () => {
  return gulp
    .src('src/js/app.js')
    .pipe(errorHandler())
    .pipe(sourcemaps.init())
    .pipe(include())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/js'));
});


gulp.task('templates', () => {
  const hbs = require('handlebars');

  const partials = gulp
    .src('src/templates/**/_*.hbs')
    .pipe(errorHandler())
    .pipe(handlebars({
      handlebars: hbs
    }))
    .pipe(wrap('Handlebars.registerPartial(<%= partName(file.relative) %>, Handlebars.template(<%= contents %>));', {}, {
      imports: {
        partName(fileName) {
          return JSON.stringify(path.basename(fileName, '.js').substr(1));
        }
      }
    }));


  const templates = gulp
    .src('src/templates/**/[^_]*.hbs')
    .pipe(errorHandler())
    .pipe(handlebars({
      handlebars: hbs
    }))
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'templates',
      noRedeclare: true
    }));

  return merge(partials, templates)
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('public/js'));
});


gulp.task('html', () => {
  return gulp
    .src('src/index.html')
    .pipe(errorHandler())
    .pipe(gulp.dest('public'));
});


gulp.task('clean', () => {
  return del('public').then((paths) => {
    gutil.log('Deleted:', gutil.colors.magenta(paths.join('\n')));
  });
});


gulp.task('build', (cb) => {
  sequence(
    'clean',
    'styles',
    'scripts',
    'templates',
    'html',
    cb
  );
});


gulp.task('watch', () => {
  gulp.watch('src/css/**/*.styl', ['styles']);
  gulp.watch('src/js/**/*.js', ['scripts']);
  gulp.watch('src/index.html', ['html']);
  gulp.watch('src/templates/**/*.hbs', ['templates']);
});


gulp.task('default', () => {
  sequence(
    'build',
    'watch',
    'server'
  );
});
