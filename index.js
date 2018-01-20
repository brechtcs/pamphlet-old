var assert = require('assert')
var atom = require('./lib/atom')
var fs = require('fs')
var html = require('./lib/html')
var marked = require('marked')
var path = require('path')
var pbox = require('pbox')
var through = require('through2')
var vinyl = require('./lib/vinyl')

module.exports = class VinylPress {
  constructor (config) {
    assert.equal(typeof config.baseUrl, 'string', 'Site needs a base URL')
    assert.equal(typeof config.feedUrl, 'string', 'Site needs a feed URL')
    assert.ok(fs.existsSync(config.defaultLayout), 'Site needs a default layout')
    assert.ok(Array.isArray(config.stylesheets), 'Site needs a list of stylesheets')
    config.stylesheets.forEach(function (styleUrl) {
      assert.equal(typeof config.styleUrl, 'string', 'Style URL needs to be a string')
    })
    assert.ok(Array.isArray(config.scripts), 'Site needs a list of scripts')
    config.scripts.forEach(function (scriptUrl) {
      assert.equal(typeof config.scriptUrl, 'string', 'Script URL needs to be a string')
    })

    this.config = config
  }

  fromFile (opts) {
    if (!opts) {
      opts = {}
    }
    var collected = []
    var stringify = (data) => JSON.stringify(data, opts.replacer, opts.space)

    return through.obj(function (doc, _enc, cb) {
      var parsed = pbox.parse(doc.contents.toString(), {
        content: content => content.map(section => marked(section)).join('<hr>'),
        date: date => new Date(date),
        permalink: permalink => permalink || path.basename(doc.path, '.md')
      })

      if (!opts.concat && !opts.sort) {
        return cb(null, vinyl(doc.path.replace(/\.md$/, 'json'), stringify(parsed)))
      }
      parsed.forEach(post => collected.push(post))
      cb()
    }, function (cb) {
      if (!collected.length) {
        return cb()
      }
      if (opts.sort) collected.sort(opts.sort)
      if (opts.reverse) collected.reverse()

      cb(null, vinyl(opts.concat, stringify(collected)))
    })
  }

  toAtom (filename) {
    return through.obj(function (doc, encoding, cb) {
      var content, updated
      var posts = JSON.parse(doc.contents.toString())

      if (Array.isArray(posts)) {
        content = posts.map(atom.entry).join('\n')
        updated = posts.reduce(function (post, last) {
          var date = new Date(post.date)
          if (!last || (date > last)) {
            return date
          }
          return last
        }, null)
      } else {
        throw new TypeError('Atom feed can only be generated from a list')
      }
      filename = filename || doc.path.replace(/\.json$/, '.atom')
      cb(null, vinyl(filename, atom.feed(content, updated)))
    })
  }

  toHtml (filename, data) {
    var press = this

    return through.obj(function (doc, _enc, cb) {
      var content, file
      var posts = JSON.parse(doc.contents.toString())

      if (posts.length > 1) {
        content = posts.map(press.layout).join('\n')
      } else {
        data = Object.assign(data, posts[0])
        content = press.layout(data)
      }
      file = filename || path.join(data.permalink || path.basename(doc.path, path.extname(doc.path)), 'index.html')
      cb(null, vinyl(file, html.page(press.config, data, content)))
    })
  }

  layout (post) {
    var layout = path.join(process.cwd(), post.layout || this.config.defaultLayout)
    delete require.cache(layout)
    return require(layout)(post)
  }
}
