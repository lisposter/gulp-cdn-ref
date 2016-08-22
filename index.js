var path = require('path');

var through = require('through2');
var gutil = require('gulp-util');
var select = require('html-select');
var tokenize = require('html-tokenize');

function replace(config) {
    var cssre = /\.css$/;
    var jsre = /\.js$/;
    var html = /\.html/;

    var files = {
        css: [],
        js: [],
        html: []
    };


    return through.obj(function (file, enc, cb) {
        if(cssre.test(file.path)) {
            files.css.push(file);
        } else if(jsre.test(file.path)) {
            files.js.push(file);
        } else if(html.test(file.path)) {
            files.html.push(file);
        }
        cb();
    }, function(cb) {
        var ctx = this;
        Object.keys(files).forEach(function(type) {
            if(type === 'css') parser(/url\((.*)\)/g, files.css, ctx);
            if(type === 'js') parser(/src\s*=\s*['"](.*)['"]/g, files.js, ctx);
            if(type === 'html') htmlParser(files.html, ctx);
        });
        //cb();
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

    function htmlParser(files, ctx) {
        
        files.forEach(function(file) {
            var fileBuf = [];
            var filePath = path.dirname(file.path);

            var stream = through();
            stream.write(file.contents.toString());
            stream.pipe(tokenize()).pipe(select('img', function(e) {
                var _src = e.getAttribute('src');
                var url = '';

                if(_src.indexOf('/') !== 0) {
                    var tmp = path.resolve(filePath, _src);
                    tmpPaths = tmp.split(path.sep);
                    tmpPaths = tmpPaths.slice(tmpPaths.indexOf(config.base) + 1);
                    url = config.cdn + '/' + path.join.apply(null, tmpPaths);
                } else {
                    url = config.cdn + _src;
                }

                e.setAttribute('src', url);
                var tr = through.obj(function(row, enc, next) {
                    this.push([row[0], row[1]]);
                    next();
                });
                tr.pipe(e.createStream()).pipe(tr);
            })).pipe(select('script', function(e) {
                var _src = e.getAttribute('src');
                var url = '';

				if(!_src){
					return ;
				}

                if( _src.indexOf('/') !== 0) {
                    var tmp = path.resolve(filePath, _src);
                    tmpPaths = tmp.split(path.sep);
                    tmpPaths = tmpPaths.slice(tmpPaths.indexOf(config.base) + 1);
                    url = config.cdn + '/' + path.join.apply(null, tmpPaths);
                } else {
                    url = config.cdn + _src;
                }

                e.setAttribute('src', url);
                var tr = through.obj(function(row, enc, next) {
                    this.push([row[0], row[1]]);
                    next();
                });
                tr.pipe(e.createStream()).pipe(tr);
            })).pipe(select('link', function(e) {
                var _src = e.getAttribute('href');
                var url = '';

                if(_src.indexOf('/') !== 0) {
                    var tmp = path.resolve(filePath, _src);
                    tmpPaths = tmp.split(path.sep);
                    tmpPaths = tmpPaths.slice(tmpPaths.indexOf(config.base) + 1);
                    url = config.cdn + '/' + path.join.apply(null, tmpPaths);
                } else {
                    url = config.cdn + _src;
                }

                e.setAttribute('href', url);
                var tr = through.obj(function(row, enc, next) {
                    this.push([row[0], row[1]]);
                    next();
                });
                tr.pipe(e.createStream()).pipe(tr);
            })).pipe(through.obj(function(row, buf, next) {
                this.push(row[1]);
                next();
            })).on('data', function(data) {
                if(!Buffer.isBuffer(data)) data = new Buffer(data);
                fileBuf.push(data);
            }).on('end', function() {
                file.contents = Buffer.concat(fileBuf);
                ctx.push(file);
            });

            stream.end();

            
        });
    }

}

module.exports = replace;
