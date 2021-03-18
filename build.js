var tsb = require('gulp-tsb');
var gulp = require('gulp');

// create and keep compiler
var compilation = tsb.create({
	target: 'es2018',
	module: 'commonjs',
	// declaration: false
});

gulp.task('build', function () {
	return gulp.src('index.ts')
		.pipe(compilation()) // <- new compilation
		.pipe(gulp.dest('dist/'));
});