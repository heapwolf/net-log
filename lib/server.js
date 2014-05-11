var dgram = require('dgram')
var mts = require('monotonic-timestamp')
var EventEmitter = require('events').EventEmitter

module.exports = function(opts) {

  if (!opts.db) throw new Error('a leveldb instance is required')

  var db = opts.db
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

    var value = JSON.parse(String(data))
    var key = [info.address, mts()].join('!')

    db.put(key, value, function(err) {

      if (err) return ee.emit('error', err)
      ee.emit('log', key, value, info)

      //
      // TODO: send back ACK...
      //
    })
  })

  return ee
}

