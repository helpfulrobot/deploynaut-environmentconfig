var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sass = require('gulp-sass');
var react = require('gulp-react');
var gutil = require('gulp-util');

var path = {
	JS: 'js/*.js*',
	DEST: './static/'
};

var onError = function (err) {
	// do a terminal beep on error
	gutil.beep();
	console.log(err);
};

gulp.task('js-debug', function() {
	browserify('js/base.jsx', {debug: true})
		.transform('reactify')
		// For now we are loading react from the global state.
		.exclude('react')
		.bundle()
		.on('error', onError)
		.pipe(source('bundle-debug.js'))
		.pipe(gulp.dest(path.DEST));
});

gulp.task('js', function() {
	browserify('js/base.jsx')
		.transform('reactify')
		// For now we are loading react from the global state.
		.exclude('react')
		.bundle()
		.on('error', onError)
		.pipe(source('bundle.js'))
		// Use unminified source on prod - they will get gzipped anyway.
		.pipe(gulp.dest(path.DEST));
});

gulp.task('sass', function () {
	gulp.src('sass/*.sass')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(path.DEST));
});

// Rerun when files changes
gulp.task('watch', function () {
	gulp.watch('./sass/*.sass', ['sass']);
	gulp.watch(path.JS, ['js-debug', 'js']);
});
