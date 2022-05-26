import pkg from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import include from 'gulp-file-include';
import concat from 'gulp-concat';
import autoprefixer from 'gulp-autoprefixer';
import imagemin from 'gulp-imagemin';
import del from 'del';
import browserSync from 'browser-sync';
import uglify from 'gulp-uglify-es';

const { src, dest, watch, parallel, series } = pkg;
const scss = gulpSass(dartSass);
const sync = browserSync.create();

export function html() {
	return src('src/html/*.html')
		.pipe(include({
			prefix: '@@',
		}))
		.pipe(dest('src'));

}

export function styles() {
	return src('src/scss/style.scss')
		.pipe(scss({ outputStyle: 'compressed' }))
		.pipe(concat('style.min.css'))
		.pipe(autoprefixer({ overrideBrowserlist: ['last 5 version'], grid: true }))
		.pipe(dest('src/css'))
		.pipe(sync.stream());
}

export function watching() {
	watch(['src/scss/**/*.scss'], styles);
	watch(['src/js/**/*.js', '!src/js/main.min.js'], scripts);
	watch(['src/html/**/*.html'], html).on('change', sync.reload);
	watch(['src/*.html']).on('change', sync.reload);
}

export function syncing() {
	sync.init({
		server: {
			baseDir: 'src/',
		}
	})
}

export function scripts() {
	return src([
		'src/js/main.js'
	])
		.pipe(concat('main.min.js'))
		.pipe(uglify.default())
		.pipe(dest('src/js'))
		.pipe(sync.stream());
}

export function cleanDist() {
	return del('dist');
}

export function images() {
	return src('src/images/**/*')
        .pipe(imagemin())
        .pipe(dest('dist/images'));
}

function building() {
	return src([
		'src/css/style.min.css',
		'src/fonts/**/*',
		'src/js/main.min.js',
		'src/*.html'
	], { base: 'src' })
		.pipe(dest('dist'));
}

export const build = series(cleanDist, images, building);
export default parallel(html, styles, scripts, syncing, watching);