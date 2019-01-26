'use strict'
const assert = require('./lib/assert')
const WriteQueue = require('./lib/write-queue')
const now = require('@spazmodius/now')
const { getSignature, setSignature } = require('./lib/signature')

const { parse: JSONparse } = JSON
const indexOf = (s, c) => s.indexOf(c)
const EMPTY_META = Object.freeze({})

function Logger(output) {
	const { push, flush } = WriteQueue(output, transform)
	return createLogger(push, flush, EMPTY_META, Logger.stringify.fields)
}

Logger.stringify = require('./lib/stringify')

function transform({ prefix, stringify, args, time }) {
	const fields = stringify(...args)
	const json = prefix + fields + (fields? ',"time":': '"time":') + time + '}\n'
	assert.that(JSONparse, json).doesNotThrow(SyntaxError, 'should be valid JSON', json)
	assert.that(indexOf, json, '\n').equal(json.length - 1, 'should not contain newlines', json)
	return json
}

function createLogger(push, flush, meta, stringify) {
	const log = createLogFunction(push, meta, stringify)
	const child = createChildFunction(push, flush, meta, stringify)
	log.meta = meta
	log.signature = getSignature(stringify)
	Object.defineProperties(log, {
		child: { value: child },
		flush: { value: flush },
	})
	return log
}

function createLogFunction(push, meta, stringify) {
	const fields = Logger.stringify.fields.fast(meta)
	const prefix = fields? '{' + fields + ',': '{'
	return function log(...args) {
		const time = now()
		push({ prefix, stringify, args, time })
		return log
	}
}

function createChildFunction(push, flush, parentMeta, parentStringify) {
	return function child(meta, stringify) {
		if (typeof meta === 'function') {
			stringify = meta
			meta = undefined
		}
		const childMeta = merge(parentMeta, meta)
		const childStringify = derive(parentStringify, stringify)
		return createLogger(push, flush, childMeta, childStringify)
	}
}

function merge(parentMeta, meta) {
	return Object.freeze(
		Object.assign({}, 
			parentMeta, 
			normalize(meta)
		)
	)
}

function normalize(meta) {
	if (meta === undefined || meta === null)
		return EMPTY_META
	if (typeof meta === 'string')
		return { name: meta }
	return meta
}

function derive(parentStringify, stringify) {
	if (typeof stringify === 'function')
		return setSignature(stringify.bind(parentStringify), stringify)
	return parentStringify
}

module.exports = Logger
