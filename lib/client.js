var dgram = require('dgram')
var levelDefs = require('../levels.json')
var stringify = require('json-stringify-safe')

module.exports = function Logger(opts) {

  opts = opts || {}

  var levels = opts.levels || levelDefs
  var level = opts.level && levels[opts.level] || 0
  var lookup = {}

  Object.keys(levels).forEach(function(level) {
    lookup[levels[level]] = level
  })

  var local = opts.local
  var port = opts.port || 3000
  var address = opts.broadcastAddress || '224.0.0.1'

  var socket = dgram.createSocket('udp4')
  var logger = {}

  function send(log) {

    if (level == -1 || log[lookup[level]] < levels[level]) {
      return
    }

    log = stringify(log)

    if (local) {
      return process.stdout.write(log + '\n')
    }

    socket.send(
      new Buffer(log),
      0,
      log.length,
      port,
      address
    )
  }


  function enable() {
    Object.defineProperty(logger, 'next', {
      configurable: true,
      set: send
    })
  }

  function disable() {
    Object.defineProperty(logger, 'next', { 
      set: function() {}
    })
  }

  process.on('SIGUSR2', function() {
    if (lookup[level+1]) {
      ++level
    }
    else {
      level = -1
    }

    if (level == -1) disable()
    else if (level == 1) enable()
  })

  if (level > -1) {
    enable()
  }

  return logger
}

