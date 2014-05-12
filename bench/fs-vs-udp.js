var fs = require('fs')
var dgram = require('dgram')
var chunk = Math.random().toString(15)
var Benchmark = require('benchmark')
var client = dgram.createSocket('udp4')

var message = new Buffer(chunk)
var suite = new Benchmark.Suite;

suite
.add('udp', function() {
    client.send(message, 0, message.length, 3000, '0.0.0.0')
})
.add('fs', function() {
    fs.writeFile('foo.text', chunk)
})
.on('cycle', function(event) {
    console.log(String(event.target));
})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run();

// udp x 322,442 ops/sec ±21.30% (25 runs sampled)
// fs x 11,394 ops/sec ±9.29% (59 runs sampled)
// Fastest is udp

