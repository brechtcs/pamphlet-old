var path = require('path')
var through = require('through2')
var vinyl = require('./vinyl')

module.exports = function (filename, layout, data) {
  return through.obj(function (doc, encoding, cb) {
    var content, file
    var posts = JSON.parse(doc.contents.toString())

    if (posts.length > 1) {
      content = posts.map(layout).join('\n')
    } else {
      data = Object.assign(data, posts[0])
      content = layout(data)
    }
    file = filename || path.join(data.slug ? slugToFile(data.slug) : fileToHtml(doc.path), 'index.html')
    cb(null, vinyl(file, wrap(data, content)))
  })

  function wrap (data, content) {
    return '<!doctype html><html>' + head(data) + '<body>' + content + '</body></html>'
  }
}

function head (opts) {
  return `
    <head>
      <meta charset="utf-8">
      ${meta('http-equiv', 'x-ua-compatible')('ie-edge')}
      ${meta('name', 'viewport')('width=device-width, initial-scale=1')}

      <title>${opts.title ? opts.title + ' · ' : ''}${opts.site}</title>

      ${link('canonical')(opts.url)}
      ${link('stylesheet')('/style.css')}
      ${opts.cover ? link('prefetch')(opts.cover) : ''}
      <link rel="alternate" href="/feed.atom" type="application/atom+xml" title="Atom 0.3">

      ${opts.description ? meta('name', 'description')(opts.description) : ''}
      ${meta('name', 'google')('notranslate')}
      ${meta('name', 'generator')('distilledpm/pamphlets')}
      ${meta('name', 'subject')('Current affairs and culture')}
      ${meta('name', 'url')('https://distilled.pm')}
      ${meta('name', 'referrer')('origin')}

      ${meta('property', 'og:url')(opts.url)}
      ${opts.title ? meta('property', 'og:title')(opts.title) : ''}
      ${opts.cover ? meta('property', 'og:image')(opts.cover) : ''}
      ${opts.description ? meta('property', 'og:description')(opts.description) : ''}
      ${meta('property', 'og:site_name')(opts.site)}
      ${meta('property', 'og:locale')('en_IE')}
      ${opts.authors ? opts.authors.map(meta('property', 'article:author')).join('\n') : ''}

      ${meta('name', 'twitter:site')('@distilledpm')}
      ${meta('name', 'twitter:url')(opts.url)}
      ${opts.title ? meta('name', 'twitter:title')(opts.title) : meta('name', 'twitter:title')(opts.site)}
      ${opts.description ? meta('name', 'twitter:description')(opts.description) : ''}
      ${opts.cover ? meta('name', 'twitter:image')(opts.cover) : ''}

      ${opts.title ? meta('itemprop', 'name')(opts.title) : meta('itemprop', 'name')(opts.site)}
      ${opts.description ? meta('itemprop', 'description')(opts.description) : ''}
      ${opts.cover ? meta('itemprop', 'image')(opts.cover) : ''}

      <script src="/bundle.js"></script>
    </head>
  `
}

function link (rel) {
  return function (href) {
    return `<link href="${href}" rel="${rel}">`
  }
}

function meta (type, value) {
  return function (content) {
    return `<meta ${type}="${value}" content="${content}">`
  }
}

function slugToFile (slug) {
  return slug.replace(/^\//, '')
}

function fileToHtml (file) {
  return path.basename(file, path.extname(file))
}
