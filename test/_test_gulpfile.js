var gulp = require('gulp');
var replace = require('..');

gulp.task('cdnref',function(){
    return gulp.src('fixtures/**/*')
        .pipe(replace({
            base: 'fixtures',
            cdn: 'http://lisposter.b0.upaiyun.com'
        }))
        .pipe(gulp.dest('expected/'));
});