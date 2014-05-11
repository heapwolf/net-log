var dgram = require('dgram')
var EventEmitter = require('events').EventEmitter

module.exports = function(opts) {

  var port = opts.port || 3000
  var ee = new EventEmitter
  var broadcastAddress = opts.broadcastAddress || '224.0.0.1'
  var socket = dgram.createSocket('udp4')

  socket.bind(port, broadcastAddress, function() {

    socket.setBroadcast(true)
    ee.emit('listening')
  })

  socket.on('error', function (err) {
    ee.emit('error', err)
  })

  socket.on('message', function (data, info) {

    try {
      data = JSON.parse(String(data))
    } catch(ex) {
      return ee.emit('error', ex)
    }
    ee.emit('log', data, info)
  })

  return ee
}

