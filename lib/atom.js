module.exports.feed = function feed (config, entries, updated) {
  return `<?xml version="1.0" encoding="utf-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>${config.name}</title>
      <id>${config.baseUrl}</id>
      <link href="${config.baseUrl}${config.feedUrl}" rel="self" />
      <link href="${config.baseUrl}" />
      <updated>${updated.toISOString()}</updated>
      ${entries.join('\n')}
    </feed>
  `
}

module.exports.entry = function entry (config, doc) {
  return `<entry>
    <title>${doc.title}</title>
    <id>${config.baseUrl}${doc.permalink}</id>
    <link href="${config.baseUrl}${doc.permalink}" />
    <updated>${doc.date.toISOString()}</updated>
    <content type="html">${escape(doc.content)}</content>
    ${Array.isArray(doc.authors) ? doc.authors.map(author).join('\n') : ''}
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
