var Vinyl = require('vinyl')
var log = require('fancy-log')

module.exports = function (path, contents) {
  if (verbose()) {
    log('Streaming', path)
  }
  return new Vinyl({
    path: path,
    contents: Buffer.from(contents)
  })
}

function verbose () {
  return process.argv.indexOf('--verbose') !== -1
}
