var ASSERT = require('assert').ok
var logger = require('..')
var level = require('level')
var db = level(__dirname + '/db1', { valueEncoding: 'json' })

process.setMaxListeners(0)

describe('the client', function() {

  it('should have a ctor that returns an instance', function(done) {

    var client = logger.createClient()
    ASSERT(!!client)
    done()
  })

  it('should handle different logging levels', function() {

    var client = logger.createClient({ level: 'error' })
    var server = logger.createServer({ db: db })

    var count = 0

    server.on('log', function() {
      ++count
    })

    server.on('listening', function() {

      client.next = { info: 1 }
      client.next = { error: 1 }
    })

    setTimeout(function() {
      console.log(count)
      ASSERT(count == 1)
      done()
    }, 1000)
  })


})

describe('the server', function() {

  it('should have a ctor that returns an instance', function(done) {

    var server = logger.createServer({ db: db })
    ASSERT(!!server)
    server.on('listening', function() {
      done()
    })
  })
})

describe('integration', function() {

  it('N cleints should send N messages to N servers', function(done) {

    var r = function() { return Math.floor(Math.max(1, Math.random()*50)) }

    var servers = {}
    var clients = {}
    var clientCount = r()
    var serverCount = r()
    var logs = r()
    var expectedLogs = serverCount * clientCount * logs
    var start = process.hrtime()

    var lcount = 0
    var dcount = 0

    var listening = function() {
      ++lcount
      if (lcount == serverCount) {
        sendLogs()
      }
    }

    var onLog = function(key, value, info) {
      if (++dcount == expectedLogs) {
        var diff = process.hrtime(start)
        console.log(
          '%d logs from %d clients were sent to %d servers in %d milliseconds',
          expectedLogs, clientCount, serverCount, (diff[1] / 1e6).toFixed())
        done()
      }
    }

    var sendLogs = function() {
      Object.keys(clients).forEach(function(client) {
        for(var i = 1; i <= logs; i++) {
          clients[client].next = { thing: i }
        }
      })
    }

    for (var i = 1; i <= clientCount; i++) {
      var name = 'client_' + i
      clients[name] = logger.createClient()
    }

    for (var i = 1; i <= serverCount; i++) {
      var name = 'server_' + i
      servers[name] = logger.createServer({ db: db })

      servers[name].on('listening', listening)
      servers[name].on('error', function() { ASSERT(false) })
      servers[name].on('log', onLog)
    }
  })
})

