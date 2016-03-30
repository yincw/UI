var gulp = require('gulp');

gulp.task('nw', function () {
    return gulp.src('./nwjs/**/*').pipe(gulp.dest('dist'));
});

gulp.task('release', ['nw'], function (done) {
    return gulp.src([
        './.ui/*',
        './.ui/.editorconfig',

        './app/*.html',
        './app/bower/**/*',
        './app/views/**/*.html',
        './app/js/*',
        './app/resources/**/*',

        './gruntBuildFolder/package.json',

        './debug.bat',
        './node.exe',
        './package.json',
        './CHANGELOG.md'
    ], {base: '.'}).pipe(gulp.dest('dist'));
});
