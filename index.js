var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

function replace(config) {
    var cssre = /\.css$/;
    var jsre = /\.js$/;

    var files = {
        css: [],
        js: []
    };


    return through.obj(function (file, enc, cb) {
        if(cssre.test(file.path)) {
            files.css.push(file);
        } else if(jsre.test(file.path)) {
            files.js.push(file);
        }
        cb();
    }, function(cb) {
        var ctx = this;
        Object.keys(files).forEach(function(type) {
            if(type === 'css') parser(/url\((.*)\)/g, files.css, ctx);
            if(type === 'js') parser(/src\s*=\s*['"](.*)['"]/g, files.js, ctx);
        });
        cb();
    });

    function parser(re, files, ctx) {

        files.forEach(function(file) {
            var contents = file.contents.toString();
            var filePath = path.dirname(file.path);

            var matches = [];
            var m = re.exec(contents);
            while (m !== null) {
                matches.push(m[1].replace(/['"]/g, ''));
                m = re.exec(contents);
            }

            matches.forEach(function(matched) {
                var url = '';

                if(matched.indexOf('/') !== 0) {
                    var tmp = path.resolve(filePath, matched);
                    tmpPaths = tmp.split(path.sep);
                    tmpPaths = tmpPaths.slice(tmpPaths.indexOf(config.base) + 1);
                    url = config.cdn + '/' + path.join.apply(null, tmpPaths);
                } else {
                    url = config.cdn + matched;
                }
                contents = contents.replace(new RegExp(matched, 'g'), url);
                try {
                    file.contents = new Buffer(contents);
                } catch (err) {
                    ctx.emit('error', new gutil.PluginError('gulp-cdn-ref', err));
                }
                ctx.push(file);
            });

        });
    }

}

module.exports = replace;