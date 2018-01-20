var VinylPress = require('../')
var fs = require('fs')
var path = require('path')
var test = require('tape')
var vfs = require('vinyl-fs')

test('generate website', function (t) {
  var press = new VinylPress({
    name: 'Example',
    baseUrl: 'http://example.com',
    feedUrl: '/feed.atom',
    defaultLayout: 'test/layout',
    stylesheets: [],
    scripts: []
  })

  t.plan(5)
  t.ok(press, 'init press')

  var posts = vfs.src('test/posts/*.md')
  var opts = {concat: 'posts.json'}

  posts.pipe(press.fromFile())
    .pipe(press.toHtml())
    .pipe(vfs.dest('test/site'))
    .on('end', function () {
      t.ok(fs.existsSync(path.join(__dirname, 'site', 'first', 'index.html')), 'first post')
      t.ok(fs.existsSync(path.join(__dirname, 'site', 'second', 'index.html')), 'second post')
    })

  posts.pipe(press.fromFile(opts))
    .pipe(press.toHtml('index.html'))
    .pipe(vfs.dest('test/site'))
    .on('end', function () {
      t.ok(fs.existsSync(path.join(__dirname, 'site', 'index.html')), 'home page')
    })

  posts.pipe(press.fromFile(opts))
    .pipe(press.toAtom('feed.atom'))
    .pipe(vfs.dest('test/site'))
    .on('end', function () {
      t.ok(fs.existsSync(path.join(__dirname, 'site', 'index.html')), 'atom feed')
    })
})
