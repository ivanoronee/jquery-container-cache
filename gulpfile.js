var gulp = require('gulp');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');
var gulpIf = require('gulp-if');

var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');

gulp.task('clean:dist', function () {
    return del.sync('dist')
});

gulp.task('useref', function () {
    return gulp.src('src/*.html')
        .pipe(useref())
        .pipe(gulpIf('js/**/*.js', uglify()))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', function (callback) {
    runSequence('clean:dist', 'useref', callback);
});

gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: 'src'
        }
    });
});

gulp.task('watch', ['browserSync'], function () {
    gulp.watch('src/*.html', browserSync.reload);
    gulp.watch('src/js/**/*.js', browserSync.reload);
});

gulp.task('default', function (callback) {
    runSequence(['watch'], callback);
});