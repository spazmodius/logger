# Spaz's JSON Logger

Ultra-low-overhead JSON logging for Node.js

## Install
`npm install spazmodius/logz`

## Usage Example

```js
const Logz = require('@spazmodius/logz')
const log = Logz('example')
log.stream.pipe(process.stdout)

log.info('normal operation', { count: 3 })
log.warn('something sketchy', { state: { a: true } })
```

which produces:

```
{"name":"example","level":30,"time":1547404875491,"msg":"normal operation","data":{"count":3}}
{"name":"example","level":40,"time":1547404875491,"msg":"something sketchy","data":{"state":{"a":true}}}
```

## API

### [new] **Logz(** [_meta_] **)**

- `meta`; string | object; optional; Name of this logger, or an object of meta-properties 
 
 This factory/constructor method creates and returns a new logger.

You can pass a string (or any value, really) to name the logger, and a `name` property will be output with every line.  Alternatively, you can pass an object, and all of it's own properties will be output with every line.

### log.**stream**

The `stream` instance property refers to a [Readable stream](https://nodejs.org/api/stream.html#stream_readable_streams), which is emitting the bytes to be logged.  This stream may be consumed however you like, usually piped to an appropriate output.

For example, pipe the logs to a collector process, using a named pipe (on Windows):

```js
const net = require('net')
const output = net.connect({ path: '\\\\.\\pipe\\log-collector-3' }).unref()
const log = Logz('example')
log.stream.pipe(output)
```

### log.**trace(** _message_, [_data_] **)**
### log.**debug(** _message_, [_data_] **)**
### log.**info(** _message_, [_data_] **)**
### log.**warn(** _message_, [_data_] **)**
### log.**error(** _message_, [_data_] **)**
### log.**fatal(** _message_, [_data_] **)**

- `message`; string; The message to log, as the `msg` property
- `data`; any value or object; optional; Extra data to be logged, as the `data` property

These instance methods each emit a line of JSON.  Each one adds a `level` property to the line, with a numeric value:

 |method|level|
 |---|---|
 |`trace`|10|
 |`debug`|20|
 |`info`|30|
 |`warn`|40|
 |`error`|50|
 |`fatal`|60|
 
 When `data` is passed, it will be included in the output as the `data` property.  Importantly, its properties **will not** be promoted to top-level properties in the JSON.  This means that `data` properties will never conflict with other properties being logged.  In fact, `data` may be a string or number, if desired.