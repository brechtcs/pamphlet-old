var marked = require('marked')
var path = require('path')
var pbox = require('pbox')
var through = require('through2')
var vinyl = require('./vinyl')

module.exports.fromFile = function (opts) {
  if (!opts) {
    opts = {}
  }
  var collected = []
  var slugify = doc => '/' + path.basename(doc.path, '.md').split('-').slice(3).join('-')
  var stringify = (data) => JSON.stringify(data, opts.replacer, opts.space)

  return through.obj(function (doc, encoding, cb) {
    var parsed = pbox.parse(doc.contents.toString(), {
      content: content => marked(content.join('\n---\n')),
      date: date => new Date(date),
      slug: () => slugify(doc),
      url: () => opts.baseUrl ? opts.baseUrl + slugify(doc) : slugify(doc)
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
