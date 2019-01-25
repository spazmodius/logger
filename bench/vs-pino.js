'use strict'
const Bench = require('@spazmodius/hrbench')
const { pid } = process
const hostname = require('os').hostname()
const { Writable } = require('stream')
const { stdout } = process

const devnul = new Writable({
	decodeStrings: false,
	write: (chunk, encoding, callback) => callback(null),
	writev: (chunks, callback) => callback(null),
})

function pinoFactory(dest) {
	const Pino = require('pino')
	const logger = Pino({ name: 'PINO' }, dest)
	return logger
}

function logrFactory(dest) {
	const Logger = require('../logger')
	const logger = Logger(dest)
	const base = logger.child({ name: 'LOGR', pid, hostname })
	const info = base.child({ level: 30 }, data_msg)
	return info

	function data_msg(data, msg) {
		return Logger.stringifiers.properties.fast(data) + ',' + Logger.stringifiers.property.fast('msg', msg)
	}
}

const message = 'hello world'
const data = { a: 1, b: 2, c: null, d: 'e', f: false }

// output a line from both loggers, for visual comparison
let pino = pinoFactory(stdout), logr = logrFactory(stdout)
pino.info(data, message)
logr(data, message)

pino = pinoFactory(devnul), logr = logrFactory(devnul)

const bench = new Bench({ maxCycles: 10000 })
bench
	.test(() => pino.info(data, message))
	.test(() => logr(data, message))
	.run()
	.then(Bench.summarize)
	.then(console.log, console.error)
