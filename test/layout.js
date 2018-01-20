var html = require('bel')
var raw = require('bel/raw')

module.exports = function (post, site) {
  return html`<article>
    <header>
      <h1><a href="${post.permalink}">${post.title} - ${site.name}</a></h1>
      <time>${new Date(post.date).toLocaleString()}</time>
      <ul>${post.authors.map(author => html`<li>${author}</li>`)}</ul>
    </header>
    ${raw(post.content)}
  </article>`
}
