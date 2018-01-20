var html = require('bel')

module.exports.page = function page (config, data, content) {
  return '<!doctype html><html>' + head(config, data) + '<body>' + content + '</body></html>'
}

function head (config, data) {
  return html`<head>
    <meta charset="utf-8">
    ${meta('http-equiv', 'x-ua-compatible')('ie-edge')}
    ${meta('name', 'viewport')('width=device-width, initial-scale=1')}

    <title>${data.title ? data.title + ' · ' : ''}${config.name}</title>

    ${link('canonical')(data.url)}
    ${data.cover ? link('prefetch')(data.cover) : ''}
    ${config.stylesheets.map(link('stylesheet'))}
    <link rel="alternate" href="${config.feedUrl}" type="application/atom+xml" title="Atom 0.3">

    ${data.description ? meta('name', 'description')(data.description) : ''}
    ${meta('name', 'google')('notranslate')}
    ${meta('name', 'generator')('pamphlets/vinyl-press')}
    ${config.subject ? meta('name', 'subject')(config.subject) : ''}
    ${meta('name', 'url')(config.baseUrl)}
    ${meta('name', 'referrer')('origin')}

    ${meta('property', 'og:url')(data.permalink ? config.baseUrl + data.permalink : config.baseUrl)}
    ${data.title ? meta('property', 'og:title')(data.title) : ''}
    ${data.cover ? meta('property', 'og:image')(data.cover) : ''}
    ${data.description || config.subject ? meta('property', 'og:description')(data.description || config.subject) : ''}
    ${meta('property', 'og:site_name')(config.name)}
    ${meta('property', 'og:locale')(data.language || config.language || 'en_IE')}
    ${data.authors ? data.authors.map(meta('property', 'article:author')) : ''}

    ${data.twitterHandle || config.twitterHandle ? meta('name', 'twitter:site')(data.twitterHandle || config.twitterHandle) : ''}
    ${meta('name', 'twitter:url')(config.baseUrl)}
    ${data.title ? meta('name', 'twitter:title')(data.title) : meta('name', 'twitter:title')(config.name)}
    ${data.description || config.subject ? meta('name', 'twitter:description')(data.description || config.subject) : ''}
    ${data.cover ? meta('name', 'twitter:image')(data.cover) : ''}

    ${data.title ? meta('itemprop', 'name')(data.title) : meta('itemprop', 'name')(config.name)}
    ${data.description || config.subject ? meta('itemprop', 'description')(data.description || config.subject) : ''}
    ${data.cover ? meta('itemprop', 'image')(data.cover) : ''}

    ${config.scripts.map(script)}
  </head>`
}

function link (rel) {
  return function (href) {
    return html`<link href="${href}" rel="${rel}">`
  }
}

function meta (type, value) {
  return function (content) {
    return html`<meta ${type}="${value}" content="${content}">`
  }
}

function script (src) {
  return html`<script src="${src}"></script>`
}
