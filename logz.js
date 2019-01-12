'use strict'

const { Readable } = require('stream')
const Queue = require('@spazmodius/queue')
const { start, append, finalize } = require('./lib/formatter')
const normalize = require('./lib/normalize')
const { now } = Date

function Logz(meta) {
	meta = normalize(meta)
	const prefix = start(meta)

	let pushing = false, scheduled = false
	const queue = Queue()
	const stream = new Readable({ read })

	function read(size) {
		pushing = true
		if (queue.length > 0)
			scheduleFlush()
	}

	function scheduleFlush() {
		if (!scheduled) {
			setImmediate(flush)
			scheduled = true
		}
	}

	function flush() {
		scheduled = false

		do {
			const args = queue.dequeue()
			const line = finalize(args)
			pushing = stream.push(line)
		} while (pushing && queue.length > 0)
	}

	function logLevel(level) {
		const partial = append(prefix, { level })
		return (msg, data) => {
			const time = now()
			queue.enqueue({ partial, time, msg: String(msg), data })
			if (pushing)
				scheduleFlush()
		}
	}

	const defs = {
		stream: { value: stream },
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
