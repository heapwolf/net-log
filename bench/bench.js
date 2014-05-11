var Benchmark = require('benchmark')
var net = require('net')
var dgram = require('dgram')
var netlog = require('..')
var db = require('level')('./db', { valueEncoding: 'json' })

net.createServer(function(s) {
  s.pipe(s)
}).listen(3000)

netlog.createServer({ db: db })

function Logger(enabled) {

  var client = net.connect(3000)
  var logger = {}

  if (enabled)
    Object.defineProperty(logger, "next", { 
      set: function() {
        var log = JSON.stringify(arguments) + '\n'
        client.write(log)
      }
    })

  return logger 
}

function L(enabled) {
  
  var client = net.connect(3000)
  
  return {
    next: function() {
      if (enabled) {
        var log = JSON.stringify(arguments) + '\n'
        client.write(log)
      }
    }
  }
}

function UDP(enabled) {

  var client = dgram.createSocket('udp4')
  
  return {
    next: function() {
      if (enabled) {
        var log = JSON.stringify(arguments)
        socket.send(
          new Buffer(log),
          0,
          log.length,
          3000,
          '224.0.0.1'
        )
      }
    }
  }
}

var suite = new Benchmark.Suite

var logger1 = Logger(false)
var logger2 = Logger(true)
var logger3 = L(false)
var logger4 = L(true)
var logger5 = UDP(true)

suite.add('setter#logger1 disabled', function() {
  logger1.next = ['hello', 'world']
})

suite.add('setter#logger2 enabled', function() {
  logger2.next = ['hello', 'world']
})

suite.add('function#logger3 disabled', function() {
  logger3.next('hello', 'world')
})

suite.add('function#logger4 enabled', function() {
  logger4.next('hello', 'world')
})

suite.add('setter#netlog enabled', function() {
  logger5.next = ['hello', 'world']
})

.on('cycle', function(event) {
    console.log(String(event.target))
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'))
})

.run()

