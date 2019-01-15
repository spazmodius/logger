'use strict'

const Queue = require('@spazmodius/queue')

function identity(x) { return x }

function WriteQueue(output, transform = identity) {
	let pushing = true, scheduled = false
	const queue = Queue()

	function scheduleFlush() {
		if (!scheduled) {
			setImmediate(flush)
			scheduled = true
		}
	}

	function flush() {
		scheduled = false
		do {
			const item = queue.dequeue()
			const line = transform(item)
			pushing = output.write(line)
		} while (pushing && queue.length > 0)
	}

	function drain() {
		pushing = true
		if (queue.length > 0)
			scheduleFlush()
	}

	function push(item) {
		queue.enqueue(item)
		if (pushing)
			scheduleFlush()
	}

	output.on('drain', drain)
	return { push }
}

module.exports = WriteQueue
