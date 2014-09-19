# gulp-cdn-ref
change urls in html/css/js files to cdn-based version

# install
```
$ npm i gulp-cdn-ref --save-dev
```

# usage
```js
var gulp=require('gulp');
var replace=require('gulp-cdn-ref');

gulp.task('cdnref',function(){
    return gulp.src('test/fixtures/**/*')
        .pipe(replace({
            base: 'fixtures',
            cdn: 'http://lisposter.b0.upaiyun.com'
        }))
        .pipe(gulp.dest('test/expected/'));
});
```

and

```
$ gulp cdnref
```

See example in [test](https://github.com/lisposter/gulp-cdn-ref/tree/master/test)

# config object

```js
var config = {
    cdn: 'http://lisposter.b0.upaiyun.com',
    base: 'assets',
    map: {
        //...
    }
}
```

* `cdn`: your cdn service url.
* `base`: the root dir of this website.

eg. here is a files tree:

```
project
├── style
│   └── style.css
├── assets
│   └── images
|           └── bg.png
```

and, here is the css:

```css
.bg {
    background: url(../assets/bg.png) repeat;
}
```

so, the `config` may be:

```js
var config = {
    cdn: 'http://lisposter.b0.upaiyun.com',
    base: 'project'
}
```

this can make your css like this:

```css
.bg {
    background: url(http://lisposter.b0.upaiyun.com/assets/bg.png) repeat;
}
```
