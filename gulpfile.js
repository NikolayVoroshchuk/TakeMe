'use strict';

const gulp = require('gulp');
const watch = require('gulp-watch');
const prefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const rimraf = require('rimraf');
const browserSync = require('browser-sync');
const { reload } = browserSync;

const tasks = [
	'html',
	'scss',
	'js',
	'image',
	'fonts'
];

const path = {
	dist: { // Тут мы укажем куда складывать готовые после сборки файлы
		html: 'dist/',
		js: 'dist/js/',
		css: 'dist/css/',
		img: 'dist/img/',
		fonts: 'dist/fonts/'
	},
	app: { // Пути откуда брать исходники
		html: 'app/*.html', // Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
		js: 'app/js/**/*.js', // В стилях и скриптах нам понадобятся только main файлы
		scss: 'app/css/*.scss',
		img: 'app/img/**/*.*', // Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
		fonts: 'app/fonts/*.*'
	},
	watch: { // Тут мы укажем, за изменением каких файлов мы хотим наблюдать
		html: 'app/**/*.html',
		js: 'app/js/**/*.js',
		scss: 'app/css/**/*.scss',
		css: 'app/css/**/*.css',
		image: 'app/img/**/*.*',
		fonts: 'app/fonts/*.*'
	},
	clean: './dist'
};

const config = {
	server: {
		baseDir: './dist'
	},
	tunnel: true,
	host: 'localhost',
	port: 8081,
};

gulp.task('build', [
	// 'styles',
	// 'scripts',
	'html:build',
	'js:build',
	'scss:build',
	'fonts:build',
	'image:build'
]);

gulp.task('html:build', function() {
	gulp.src(path.app.html) // Выберем файлы по нужному пути
		.pipe(gulp.dest(path.dist.html)) // Выплюнем их в папку build
		.pipe(reload({
			stream: true
		})); // И перезагрузим наш сервер для обновлений
});

// gulp.task('scripts', function() {
// 	gulp.src([
// 		'node_modules/bootstrap/dist/js/bootstrap.min.js'
// 	])
// 	.pipe(concat('libs.min.js'))
// 	.pipe(uglify())
// 	.pipe(gulp.dest(path.dist.js));
// });

// gulp.task('styles', function() {
// 	gulp.src([
// 		'node_modules/bootstrap/dist/css/bootstrap.min.css',
// 		'node_modules/normalize.css/normalize.css'
// 	])
// 	.pipe(cleanCSS()) // Сожмем
// 	.pipe(concat('libs.min.css'))
// 	.pipe(gulp.dest(path.dist.css));
// });

gulp.task('js:build', function() {
	gulp.src(path.app.js) // Найдем наш main файл
		.pipe(sourcemaps.init()) // Инициализируем sourcemap
		// .pipe(uglify()) // Сожмем наш js
		.pipe(sourcemaps.write()) // Пропишем карты
		.pipe(gulp.dest(path.dist.js)) // Выплюнем готовый файл в build
		.pipe(reload({
			stream: true
		})); // И перезагрузим сервер
});


gulp.task('scss:build', function() {
	gulp.src(path.app.scss) // Выберем наш main.scss
		.pipe(sourcemaps.init()) // То же самое что и с js
		.pipe(sass().on('error', sass.logError))
		.pipe(prefixer()) // Добавим вендорные префиксы
		.pipe(cleanCSS()) // Сожмем
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(path.dist.css)) // И в build
		.pipe(reload({
			stream: true
		}));
});

gulp.task('image:build', function() {
	gulp.src(path.app.img) // Выберем наши картинки
		.pipe(imagemin({ // Сожмем их
			progressive: true,
			svgoPlugins: [{
				removeViewBox: false
			}],
			interlaced: true
		}))
		.pipe(gulp.dest(path.dist.img)) // И бросим в build
		.pipe(reload({
			stream: true
		}));
});

gulp.task('fonts:build', function() {
	gulp.src(path.app.fonts)
		.pipe(gulp.dest(path.dist.fonts))
});


gulp.task('watch', function() {
	tasks.forEach(task => {
		watch([path.watch[task]], function(event, cb) {
			gulp.start(`${task}:build`);
		});
	});
});

gulp.task('webserver', function() {
	browserSync(config);
});


gulp.task('clean', function(cb) {
	rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);
