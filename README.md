# Spaz's JSON Logger

***Ultra-low-overhead JSON logging for Node.js***

## Install
`npm install spazmodius/logz`

## Usage Example

```js
const Logz = require('@spazmodius/logz')
const log = Logz(process.stdout, 'example')

log.info('normal operation', { count: 3 })
log.warn('something sketchy', { state: { a: true } })
```

which outputs newline-delimited JSON:

```json
{"name":"example","level":30,"time":1547404875491,"msg":"normal operation","data":{"count":3}}
{"name":"example","level":40,"time":1547404875491,"msg":"something sketchy","data":{"state":{"a":true}}}
```

## API

### [new] Logz( _output, [meta]_ )

| Argument | Type | Optional | Description
|---|---|---|---
| `output` | Writable stream | | Stream to which to send logged JSON bytes
| `meta` | string \| object | &check; | Name of this logger, or an object of meta-properties 

**Returns** A new logger instance

 This factory/constructor method creates a new logger, which outputs to the passed `output` stream.

For `meta`, you can pass a string (or any value, really) to name the logger, and a `name` property will be output with every line.  
Alternatively, you can pass an object, and all of it's own properties will be output with every line.

---
### log.trace( _message, [data]_ )
### log.debug( _message, [data]_ )
### log.info( _message, [data]_ )
### log.warn( _message, [data]_ )
### log.error( _message, [data]_ )
### log.fatal( _message, [data]_ )

| Argument | Type | Optional | Description
|---|---|---|---
| `message` | string | | The message to log, as the `msg` property
| `data` | any | &check; | Extra data to be logged, as the `data` property

These methods each emit a line of JSON, with a `level` property set to a specific numeric value:

 |method|level|
 |---|---|
 |`trace`|10|
 |`debug`|20|
 |`info`|30|
 |`warn`|40|
 |`error`|50|
 |`fatal`|60|
 
 When `data` is passed, it will be included in the output as the `data` property.  Importantly, its properties **will not** be promoted to top-level properties in the JSON.  This means that `data` properties will never conflict with other properties being logged.  In fact, `data` may be a string or number, if desired.