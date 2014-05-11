var ASSERT = require('assert').ok
var logger = require('..')
var level = require('level')
var db = level(__dirname + '/db1', { valueEncoding: 'json' })

describe('the client', function() {

  it('should be enabled and disabled on SIGUSR2', function(done) {

    var client = logger.createClient()
    var server = logger.createServer({ db: db })

    var count = 0

    server.on('log', function(data) {
      ++count
    })

    client.next = { foo: 100 }
    process.kill(process.pid, 'SIGUSR2')

    setTimeout(function() {
      client.next = { foo: 100 }
      ASSERT(count == 1)
      done()
    }, 100)
  })
})
