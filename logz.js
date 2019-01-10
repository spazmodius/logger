'use strict'

const { Readable } = require('stream')
const { stringify } = JSON

const levels = {
	trace: 10,
	debug: 20,
	info: 30,
	warn: 40,
	error: 50,
	fatal: 60,
}

function normalize(meta) {
	if (meta === undefined || meta === null)
		return {}
	if (typeof meta === 'object')
		return meta
	return { name: meta }
}

function formatPrefix(meta, prefix = '{') {
	return Object.entries(meta)
		.reduce((prefix, [key, value]) => `${prefix}${stringify(key)}:${stringify(value)},`, prefix)
}

const levelLabel = '"level":'
const timeLabel = ',"time":'
const eventLabel = ',"event":'
const dataLabel = ',"data":'

function Logz(meta) {
	meta = normalize(meta)
	const prefix = formatPrefix(meta)
	const suffix = '}\n'

	let pushing, chunk = ''
	const stream = new Readable({ read })


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
		const epilogue = prefix + levelLabel + level + timeLabel
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
