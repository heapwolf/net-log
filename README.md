# SYNOPSIS

A faster application logger.

# MOTIVATION

- Avoid disk I/O.
- Minimize moving parts on the client, avoid unnecessary boolean logic and 
function calls.
- No ip addesses or urls to keep track of.
- A single transport protocol.
- A many clients to many servers design that is network-partition tolerant.
- JSON is great, client isn't concerned with
[`formatting or transforming output`](https://github.com/hij1nx/logmap).
- `node-bunyan` and `winston` are pathologically complex.

# PERFORMANCE

When disabled, has less impact than a logger with a function that does a 
boolean check.
```
setter disabled x 56,931,283 ops/sec ±0.69% (97 runs sampled)
function disabled x 22,490,243 ops/sec ±34.06% (96 runs sampled)
```

When enabled, its faster to log to servers than with tcp.
```
tcp-setter enabled x 539,357 ops/sec ±13.50% (69 runs sampled)
tcp-function enabled x 441,418 ops/sec ±37.98% (51 runs sampled)
udp-setter enabled x 46,784,099 ops/sec ±0.99% (84 runs sampled)
```

# USAGE

## CLIENT EXAMPLE

A client broadcasts to all available servers using datagrams. Packet loss 
in-data-center is rare but acceptable because there are multiple servers
receiving logs that can replicate. The result is eventually consistent.

Don't bother with formatting like `logger.info('value: %d', 50)`, the end
points should be responsible for that!

Don't specify servers, no need to maintain and distribute lists of end points
because of broadcasting!

A `level` is expected in your JSON. `verbose`, `info`, or `error` are the
defaults.

```js
var Logger = require('net-log')
var logger = Logger.createClient()

setInterval(function() {

  logger.next = { info: 'foobar', value: 50 }

}, 100)

setInterval(function() {

  logger.next = { error: 'bazz', value: 100 }

}, 1000)
```

## CLIENT API
The client will respond to `SIGUSR2` to turn on and off logging.

### `createClient(<options>)`
**`[local=false]`**
If logs should be printed to `process.stdout`.

**`[port=3000]`**
A numeric value. The port for the client to broadcast to.

**`[enabled=true]`**
A boolean value. usually dependant on an operating system environment 
variable.

**`[broadcastAddress=255.255.255.255]`**
The broadcast address to send on.

**`[level='verbose']`** A string that determines the current logging 
level.

**`[levels={}]`** Provide custom logging level definitions.

```json
{
  "quiet": -1,
  "verbose": 0,
  "info": 1,
  "error": 2
}
```

## SERVER EXAMPLE

The server will listen on a broadcast address for messages. The server can
replicate with other servers if you want.

```js
var leveldb = require('level')('./db', { valueEncoding: 'json' })

var Logger = require('net-log')
var server = Logger.createServer({ db: leveldb })

server.on('log', function(data, info) {

})
```

## SERVER API
`createServer` returns an event emitter that will emit `log` or `error`.

### `createServer(<options>)`
**`[port]`**
A numeric value. The port for the client to broadcast to.

**`[boradcastAddress=255.255.255.255`**
The broadcast address to listen on.

# TODO

Tests should introduce network lag and packet loss.

# LICENSE

The MIT License (MIT)

Copyright (c) 2014 Paolo Fragomeni, Mic Networks Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

