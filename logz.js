'use strict'

const { start, append, finalize } = require('./lib/formatter')
const normalize = require('./lib/normalize')
const WriteQueue = require('./lib/write-queue')
const { now } = Date

function stringifyProperties(properties) {
	return JSON.stringify(properties).slice(1, -1)
}

function stringifyProperty(name, value) {
	const valueString = JSON.stringify(value)
	return valueString === undefined? '': quoted(name) + ':' + valueString
}

function stringifyMsgData([msg, data]) {
	return stringifyProperties({ msg, data })
}

function createLogFunction(push, prefix, stringify) {
	return function log(...args) {
		const time = now()
		push({ prefix, stringify, args, time })
	}
}

function merge(parentMeta, childMeta) {
	return Object.assign({}, parentMeta, childMeta)
}

function createLogger(push, meta) {
	const log = createLogFunction(push, start(meta), stringifyMsgData)

	log.child = function child(extendMeta) {
		const childMeta = merge(meta, normalize(extendMeta))
		return createLogger(push, childMeta)
	}

	return log
}

const EMPTY_META = {}

function Logger(output) {
	const { push } = WriteQueue(output, finalTransform)
	return createLogger(push, EMPTY_META)
}

function finalTransform({ prefix, stringify, args, time }) {
	const fields = stringify(args)
	return prefix + fields + (fields? ',"time":': '"time":') + time + '}\n'
}

function Logz(output, meta) {
	meta = normalize(meta)
	const prefix = start(meta)
	const { push } = WriteQueue(output, finalize)

	function logLevel(level) {
		const partial = append(prefix, { level })
		return (msg, data, toJSON) => {
			const time = now()
			msg = String(msg)
			if (toJSON)
				data = toJSON(data)
			push({ partial, time, msg, data })
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

module.exports = Logger
