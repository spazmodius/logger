'use strict'
const Bench = require('@spazmodius/hrbench')
const bench = new Bench()
const message = 'hello world'
const data = { a: 1 }

const { pid } = process
const hostname = require('os').hostname()

const { Writable } = require('stream')
const nul = new Writable({
	decodeStrings: false,
	write: (chunk, encoding, callback) => setImmediate(callback, null),
	writev: (chunks, callback) => setImmediate(callback, null),
	// destroy: (err, callback) => callback(err),
	// final: (callback) => callback(null),
})

const dest = nul
// const dest = process.stdout

const logz = (function() {
	const Logz = require('../logz')
	const logger = Logz({ pid, hostname })
	logger.pipe(dest)
	return logger.info
})()

const pino = (function() {
	const Pino = require('pino')
	const logger = Pino(dest)
	return logger.info.bind(logger)
})()

logz(message, data)
pino(data, message)

bench
	.test(() => logz(message, data))
	.test(() => pino(data, message))
	.run()
	.then(Bench.summarize)
	.then(console.log, console.error)
