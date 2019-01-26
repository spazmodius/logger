# Spaz's Barebones JSON Logger

***Ultra-low-overhead, unopinionated JSON logging for Node.js***

This library provides base functionality for generating JSON logs and writing them to a stream.
It has very few opinions about what goes into the logs, but can easily be the core of a full-featured logging framework.

## Install and Usage
`npm install spazmodius/logger`

```js
const Logger = require('@spazmodius/logger')
const log = Logger(process.stdout)
log({ msg: 'hello world' })
log({ count: 99 })
```

which outputs newline-delimited JSON:

```json
{"msg":"hello world","time":1548369941980}
{"count":99,"time":1548369941980}
```

## Concepts

Concept | Definition
---|---
Output Stream | A [Writable](https://nodejs.org/api/stream.html#stream_writable_streams) stream, which is the destination for JSON logging.
Logger | A function that logs a line of JSON to it's **output stream**.  Each logger is bound to both a **meta** and a **stringify function**.
Child | A **logger** that derives from another. The child shares its parent's **output stream**, and either extends its **meta** or has a different **stringify function** (and thus a different **signature**), or both.
Meta | A set of fixed fields that will be output with every line of JSON.  Each **logger** is bound to a meta, which is generally a superset of its parent's meta.
Stringify Function | A function, usually of your devising, that takes its arguments and returns a string of JSON fields suitable for inclusion in a line of JSON.  Each **logger** is bound to a stringify function, which thereby defines its **signature**.
Signature | The number and types of arguments that a **logger** expects to be sent when it is called.  This will be exactly the same as expected by its **stringify function**.

The idea is to generate a "family" of loggers, functions that write to the same [Writable](https://nodejs.org/api/stream.html#stream_writable_streams) stream.
The parent-most logger is very basic, but each child can extend the meta fields, and use a different stringify function to define a bespoke signature that accepts certain values and outputs particular JSON fields.

## Factory/Constructor

### [new] Logger( _output_ )

| Argument | Type | Optional | Description
|---|---|---|---
| `output` | Writable stream | | Stream to which to send lines of JSON

**Returns** a base logger `log([fields])`

 This factory/constructor method creates a base logger, which writes to the `output` stream.
 This is the root of a "family" of loggers that all will write to the same output stream.

 This base logger has empty meta (`{}`).
 Its signature is an optional object `fields`, whose JSON-serializable properties will be included as fields in the line of JSON.  (Its stringify function is, in fact, [`Logger.stringify.fields`](#loggerstringifyfields-fields-).)

Example:
```js
const log = Logger(process.stdout)
log({ msg: 'hello world' })
```

## Logger Instance

### log( _...args_ )

Logs a line of JSON to the output stream.
The line of JSON will include:
 - fixed meta fields,
 - fields from the stringify function and the given `args`
 - a `"time"` field containing the number of milliseconds since  the UNIX epoch (as returned from `Date.now()`)

The signature of this logger depends on its stringify function, specified when it was created (see [`log.child()`](#logchild-meta-stringify-)).
The same arguments passed to `log()` will be passed along to the stringify function.

### log.meta

An object whose properties represent the fixed fields that are included in the JSON logged by this logger.
This is purely informational; attempting to modify `log.meta` will not affect the logger.

### log.signature

A string representing the arguments accepted by this logger.
This signature is derived from the this logger's stringify function.
It is purely informational.

### log.child( _[meta], [stringify]_ )

| Argument | Type | Optional | Description
|---|---|---|---
| `meta` | object | &check; | Object whose properties become fixed fields for the child logger. These will extend the `meta` inherited from `log`.
| `stringify` | function | &check; | Function that converts its arguments into JSON fields.

**Returns** a new logger [`log(...args)`](#log-args-)

Creates a new logger derived from an existing one.

The child logger inherits the parent's meta, extended by the `meta` argument.
New meta fields can be added, 
existing fields overridden, 
or removed by assigning `undefined`.

The `stringify` function _must_ return a string: either the empty string, or a comma-delimited list of _JSON fields_.  
A JSON field is a properly quoted and escaped _field name_, followed by a _colon_, followed by a _JSON value_.
This will be a string that can be enclosed in curly braces to result in a valid JSON object.

`stringify` will be invoked with the same `args` arguments as the child logger is called with.  

For example:
```js
// base logger
const base = Logger(process.stdout)

// a logger that includes pid and hostname on every line
const log = base.child({ pid: process.pid, hostname: os.hostname() })

// a logger that logs Error objects
const logError = log.child(
	{ sev: 'ERROR'}, 
	error => Logger.stringify.fields.fast({
		msg: error.message,
		err: { stack: error.stack, ...error }
	})
)
```

### log.flush( _[cb]_ )

| Argument | Type | Optional | Description
|---|---|---|---
| `cb` | function | &check; | Callback function that will be invoked when all current log lines have been flushed to the output stream.

Immediately (synchronously) writes all queued log lines to the output stream.
Once the underlying system has accepted all the writes, the callback `cb` will be invoked.
The `flush()` method is shared by all loggers in the same family.

This is useful during process shutdown, to ensure all logs get written.  For example:
```js
process.on('uncaughtException', err => {
	logError(err).flush(() => process.exit(1))
})
```

## Stringify Utility Functions

To assist with constructing fast and effecient stringify functions, there is a small library of utility functions.

### Logger.stringify.none()

Returns the empty string, the stringification of no fields.

### Logger.stringify.fields( _[fields]_ )

| Argument | Type | Optional | Description
|---|---|---|---
| `fields` | object | &check; | Object whose properties are serialized to JSON fields.

Stringifies many fields at once, as represented by the serializable properties of the `fields` object.

If `fields` is a value that cannot be serialized to JSON,
or serializes to a non-object JSON value,
or has no serializable properties,
then empty string is returned.

### Logger.stringify.fields.fast( _fields_ )

| Argument | Type | Optional | Description
|---|---|---|---
| `fields` | object | | Object whose JSON-serializable properties become JSON fields. _Must be a value that serializes to a JSON object._

A fast, but restrictive, version of [`Logger.stringify.fields`](#loggerstringifyfields-fields-).

### Logger.stringify.field( _name, value_ )

| Argument | Type | Optional | Description
|---|---|---|---
| `name` | string | | Name of the field to serialize. Will be coerced into a string.
| `value` | any | | Vaue of the field to serialize.

Stringifies a single field.
If `value` is not JSON-serializable, then returns empty string.

### Logger.stringify.field.fast( _name, value_ )

| Argument | Type | Optional | Description
|---|---|---|---
| `name` | string | | Name of the field to serialize.  _Must be a string that does not require JSON escaping._
| `value` | any | | Vaue of the field to serialize. _Must be a JSON-serializable value._

A fast, but restrictive, version of [`Logger.stringify.field`](#loggerstringifyfield-name-value-).

### Logger.stringify.quote( _str_ )

| Argument | Type | Optional | Description
|---|---|---|---
| `str` | string | | Value to serialize to a JSON string (quoted) value. Will be coerced into a string.

Serializes a value to a JSON quoted string, escaping characters as necessary.

### Logger.stringify.quote.fast( _str_ )

| Argument | Type | Optional | Description
|---|---|---|---
| `str` | string | | String to enclose in quotes. _Must be a string that does not require JSON escaping._

A fast, but restrictive, version of [`Logger.stringify.quote`](#loggerstringifyquote-str-).
