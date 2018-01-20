var through = require('through2')
var vinyl = require('./vinyl')

module.exports = function (filename) {
  return through.obj(function (doc, encoding, cb) {
    var content, updated
    var posts = JSON.parse(doc.contents.toString())

    if (Array.isArray(posts)) {
      updated = posts[0].date
      content = posts.map(entry).join('\n')
    } else {
      throw new TypeError('Atom feed can only be generated from a collection')
    }
    filename = filename || doc.path.replace(/\.json$/, '.atom')
    cb(null, vinyl(filename, feed(content, updated)))
  })
}

function feed (entries, updated) {
  return `<?xml version="1.0" encoding="utf-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>Distilled Pamphlets</title>
      <id>https://distilled.pm</id>
      <link href="https://distilled.pm/feed.xml" rel="self" />
      <link href="https://distilled.pm" />
      <updated>${new Date(updated).toISOString()}</updated>
      ${entries}
    </feed>
  `
}

function entry (doc) {
  return `<entry>
    <title>${doc.title}</title>
    <id>${doc.url}</id>
    <link href="${doc.url}" />
    <updated>${new Date(doc.date).toISOString()}</updated>
    <content type="html">${escape(doc.content)}</content>
    ${doc.authors.map(author).join('\n')}
  </entry>`
}

function author (name) {
  return `<author>
    <name>${name}</name>
  </author>`
}

function escape (content) {
  return content
    .replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
}
