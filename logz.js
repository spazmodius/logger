'use strict'

const { Readable } = require('stream')
const flatstr = require('flatstr')

const levels = {
	trace: 10,
	debug: 20,
	info: 30,
	warn: 40,
	error: 50,
	fatal: 60,
}

const levelLabel = ',"level":'
const timeLabel = ',"time":'
const eventLabel = ',"event":'
const dataLabel = ',"data":'

function Logz(meta = {}) {
	let pushing, chunk = ''
	const stream = new Readable({ read })
	const prefix = JSON.stringify(meta).slice(0, -1)
	const suffix = '}\n'

	function read(size) {
		pushing = true
		if (chunk)
			flush()
	}

	function flush() {
		pushing = stream.push(chunk)
		chunk = ''
	}

	function _format(event, data) {
		chunk += Date.now()
		chunk += eventLabel 
		chunk += JSON.stringify(event)
		if (data !== undefined) {
			chunk += dataLabel 
			chunk += JSON.stringify(data)
		}
		chunk += suffix
	}

	function epiLogger(epilogue) {
		return (event, data) => {
			chunk += epilogue
			_format(String(event), data)
			if (pushing) flush()
		}
	}

	function levelLogger(level) {
		const epilogue = flatstr(prefix + levelLabel + level + timeLabel)
		return epiLogger(epilogue)
	}

	const instance = {
		pipe: stream.pipe.bind(stream),
	}

	return Object.entries(levels)
		.reduce((instance, [name, level]) => {
			instance[name] = levelLogger(level)
			return instance
		}, instance)
}

module.exports = Logz
