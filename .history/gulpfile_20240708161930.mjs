import gulp from 'gulp';
import plumber from 'gulp-plumber';
import * as sass from 'sass';
import gulpSass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'autoprefixer';
import postCss from 'gulp-postcss';
import rename from 'gulp-rename';
import browserSync from 'browser-sync';
import concat from 'gulp-concat';
import fileInclude from 'gulp-file-include';
import cssnano from 'cssnano';
import cached from 'gulp-cached';

const sassCompiler = gulpSass(sass);
const server = browserSync.create();

const paths = {
  html: 'src/html/**/*.html',
  scss: 'src/assets/css/',
  js: 'src/assets/js/**/*.js',
  images: 'src/assets/images/**/*',
  dist: 'dist',
  distCss: 'dist/assets/css',
  distJs: 'dist/assets/js',
  distImages: 'dist/assets/images',
};

// Clean task
async function clean() {
  const del = (await import('del')).deleteSync;
  return del([paths.dist]);
}

// HTML task
function html() {
  return gulp.src(paths.html)
    .pipe(plumber())
    .pipe(fileInclude({ prefix: '@@', basepath: '@file', context : {
      page_main : false,
      page_name : null,
      page__name : null,
      title : null,
      menuTitle: null
    } })) 
    .pipe(cached('html'))
    .pipe(gulp.dest(paths.dist))
    .pipe(server.stream());
}

// SCSS task
function styles() {
  return gulp.src([paths.scss + '/index.scss'], { allowEmpty: true })
    .pipe(plumber())
    .pipe(sassCompiler().on('error', sassCompiler.logError))
    .pipe(rename('styles.css'))
    //.pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.distCss))
    .pipe(server.stream());
}

const cssReset = () => {
  const sassCompiler = gulpSass(sass);
  return gulp.src([paths.scss + '/reset.scss'], { allowEmpty: true })
    .pipe(plumber())
    //.pipe(sourcemaps.init())
    .pipe(sassCompiler().on('error', sassCompiler.logError))
    //.pipe(postCss(sassOptions.postcss))
    .pipe(rename('reset.css'))
    //.pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.distCss))
};



// JavaScript task
function scripts() {
  return gulp.src([
    './src/assets/js/*.js',
    '!' + paths.js + '/vendor/**',
    '!' + paths.js + '/main.js'
  ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('all.js'))
    .pipe(rename('all.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.distJs))
    .pipe(server.stream());
}

const vendors = () => {
  return gulp.src(`${path.js}/vendor/**`)
    .pipe(gulp.dest(`${path.js}/vendor`))
    .pipe(browserSyncInstance.stream());
};


// Images task
function images() {
  return gulp.src(paths.images)
    .pipe(gulp.dest(paths.distImages));
}

// BrowserSync task
function serve() {
  server.init({
    server: {
      baseDir: "./dist/"
    }
  });

  gulp.watch(paths.html, html);
  gulp.watch(paths.scss, styles);
  gulp.watch(paths.js, scripts);
  gulp.watch(paths.images, images);
}

// Build task
const build = gulp.series(clean, gulp.parallel(html, cssReset, styles, vendors, scripts, images));

// Default task
export default gulp.series(build, serve);
