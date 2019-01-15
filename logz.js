'use strict'

const { start, append, finalize } = require('./lib/formatter')
const normalize = require('./lib/normalize')
const WriteQueue = require('./lib/write-queue')
const { now } = Date

function Logz(output, meta) {
	meta = normalize(meta)
	const prefix = start(meta)
	const { push } = WriteQueue(output, finalize)

	function logLevel(level) {
		const partial = append(prefix, { level })
		return (msg, data) => {
			const time = now()
			push({ partial, time, msg: String(msg), data })
		}
	}

	const defs = {
		trace: { value: logLevel(10), enumerable: true },
		debug: { value: logLevel(20), enumerable: true },
		info: { value: logLevel(30), enumerable: true },
		warn: { value: logLevel(40), enumerable: true },
		error: { value: logLevel(50), enumerable: true },
		fatal: { value: logLevel(60), enumerable: true },
	}

	return Object.create(Logz.prototype, defs)
}

module.exports = Logz
