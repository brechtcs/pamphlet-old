var assert = require('assert')
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
        permalink: permalink => permalink ? permalink : path.basename(doc.path, '.md')
      })

      if (!opts.concat && !opts.sort) {
        return cb(null, vinyl(doc.path, stringify(parsed)))
      }
      collected = collected.concat(parsed)
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
}
