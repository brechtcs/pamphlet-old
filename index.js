var assert = require('assert')
var atom = require('./lib/atom')
var marked = require('marked')
var path = require('path')
var pbox = require('pbox')
var through = require('through2')
var vinyl = require('./lib/vinyl')

class VinylPress {
  constructor (config) {
    assert.equal(typeof config.baseUrl, 'string', 'Site needs a baseUrl')
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
}

module.exports = VinylPress
