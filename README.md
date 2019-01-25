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
Logging Function | A function that, when called, will log a line of JSON to it's **output stream**.  Each logging function is bound to both a **meta** and a **stringify function**.
Child | A **logging function** that derives from another. The child shares its parent's **output stream**, but either extends its **meta**, or has a different **stringify function** (and thus a different **signature**), or both.
Meta | A set of fixed fields that will be output with every line of JSON.  Each **logging function** is bound to a meta, which is generally a superset of its parent's meta.
Stringify Function | A function, usually of your devising, that takes certain arguments and returns a string of fields suitable for inclusion in a line of JSON.  Each **logging function** is bound to a stringify function, which thereby defines its **signature**.
Signature | The number and types of arguments that a **logging function** expects to be sent when it is called.  This will be exactly the same as expected by its **stringify function**.

The idea is to generate a "family" of logging functions, all of which write to the same [Writable](https://nodejs.org/api/stream.html#stream_writable_streams) stream.
The parent-most logging function is very basic, but each child can extend the meta fields, and use a different stringify function to define a bespoke signature that accepts certain values and outputs particular JSON fields.

## Factory/Constructor

### [new] Logger( _output_ )

| Argument | Type | Optional | Description
|---|---|---|---
| `output` | Writable stream | | Stream to which to send lines of JSON

**Returns** base logging function `log([properties])`

 This factory/constructor method creates a base logging function, which writes to the `output` stream.
 This is the root of a "family" of logging functions that all will write to this same output stream.

 This base logging function has empty meta (`{}`).
 Its signature is an optional object, whose JSON-serializable properties will be included as fields in the line of JSON.  (Its stringify function is, in fact, `Logger.stringifiers.properties`.)

Example:
```js
const log = Logger(process.stdout)
log({ msg: 'hello world' })
```

## Logging Functions

### log( _...args_ )

Logs a line of JSON to this logging function's output stream.
The line of JSON will include
 - fields from this logging functions's meta,
 - fields produced by this logging function's stringify function and the given `args`
 - a `"time"` field containing the number of milliseconds since  the UNIX epoch (as returned from `Date.now()`)

The signature of this logging function depends on its stringify function, specified when it was created (see [`log.child()`](#log-child-meta-stringify)).
The same arguments passed to `log()` will be passed along to the stringify function.

### log.meta

An object whose properties represent the fixed fields that are included in the JSON logged by this logging function.
This is purely informational; attempting to modify `log.meta` will not affect the logging function.

### log.signature

A string representing the arguments accepted by this logging function.
This signature is derived from the this logging function's stringify function, and is purely informational.

### log.child( _[meta], [stringify]_ )

| Argument | Type | Optional | Description
|---|---|---|---
| `meta` | object | &check; | Object whose properties become fixed fields for the child logging function. These will extend the `meta` inherited from `log`.
| `stringify` | function | &check; | Function that converts the arguments in the child logging function's signature into JSON fields.

**Returns** a new logging function [`log(...args)`](#log-args)

Creates a new logging function derived from an existing one.

The child logging function inherits the parent's meta, extended by the `meta` argument.
New fixed fields are added by including properties in `meta`.
inherited fields can be overwritten by providing new values, or deleted by including `undefined` `meta` properties.

The `stringify` function _must_ return a string, which is either the empty string (`""`), or a comma-delimited of JSON fields.  
A JSON field is a properly quoted and escaped field name, followed by a colon, followed by a JSON value.
This will be a string that can be enclosed in curly braces (`{}`), resulting in a valid JSON object.

## Stringify Utility Functions
