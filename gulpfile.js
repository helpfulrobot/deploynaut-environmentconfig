var gulp = require('gulp');
var sass = require('gulp-sass');

var path = {
	DEST: './static/'
};

gulp.task('sass', function () {
	gulp.src('sass/*.sass')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(path.DEST));
});

// Rerun when files changes
gulp.task('watch', function () {
	gulp.watch('./sass/*.sass', ['sass']);
});

// the default task just compiles all the things
gulp.task('default', ['sass']);
