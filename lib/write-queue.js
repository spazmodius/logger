'use strict'

const Queue = require('@spazmodius/queue')

function identity(x) { return x }
function noop() {}

function WriteQueue(output, transform = identity) {
	let pushing = true, scheduled = null
	const queue = Queue()

	function _schedule() {
		if (scheduled === null)
			scheduled = setImmediate(write)
	}

	function _unschedule() {
		if (scheduled !== null) {
			clearImmediate(scheduled)
			scheduled = null
		}
	}

	function _write(cb) {
		const item = queue.dequeue()
		const line = transform(item)
		pushing = output.write(line, cb)
	}

	function write() {
		scheduled = null
		do {
			_write()
		} while (pushing && queue.length > 0)
	}

	function _drain() {
		pushing = true
		if (queue.length > 0)
			_schedule()
	}

	function push(item) {
		queue.enqueue(item)
		if (pushing)
			_schedule()
	}

	function flush(cb = noop) {
		if (queue.length === 0)
			return cb()
		_unschedule()
		while (queue.length > 1)
			_write()
		_write(cb)
	}

	output.on('drain', _drain)
	return { push, flush }
}

module.exports = WriteQueue
