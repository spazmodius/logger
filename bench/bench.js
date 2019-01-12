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

function logzFactory(dest) {
	const Logz = require('../logz')
	const logger = Logz({ name: 'LOGZ', pid, hostname })
	logger.stream.pipe(dest)
	return logger
}

const message = 'hello world'
const data = { a: 1, b: 2, c: null, d: 'e', f: false }

let pino = pinoFactory(stdout), logz = logzFactory(stdout)
pino.info(data, message)
logz.info(message, data)

pino = pinoFactory(devnul), logz = logzFactory(devnul)

const bench = new Bench({ maxCycles: 10000 })
bench
	.test(() => pino.info(data, message))
	.test(() => logz.info(message, data))
	.run()
	.then(Bench.summarize)
	.then(console.log, console.error)
