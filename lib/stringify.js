'use strict'
const assert = require('./assert')
const { stringify: JSONstringify, parse: JSONparse } = JSON

function none() {
	return ''
}

function safe_fields(fields) {
	if (fields !== undefined) {
		const json = JSONstringify(fields)
		if (json !== undefined && json[0] === '{')
			return json.slice(1, -1)
	}
	return ''
}

function fast_fields(fields) {
	const json = JSONstringify(fields)
	assert.startsWith(json, '{', 'must be an object', fields)
	return json.slice(1, -1)
}

const fields = safe_fields
fields.fast = fast_fields

function safe_field(name, value) {
	const valueString = JSONstringify(value)
	return valueString === undefined? '': safe_quote(name) + ':' + valueString
}

function fast_field(name, value) {
	const valueString = JSONstringify(value)
	assert.notEqual(valueString, undefined, 'value must jsonify', name, value)
	return fast_quote(name) + ':' + valueString
}

const field = safe_field
field.fast = fast_field

const SPACE = 32, QUOTE = 34, BACKSLASH = 92

function safe_quote(str) {
	str = String(str)

	const len = str.length
	if (len > 100)
		return JSONstringify(str)

	let result = '"', last = 0, point = 255
	for (let i = 0; i < len && point >= SPACE; i++) {
		point = str.charCodeAt(i)
		if (point === QUOTE || point === BACKSLASH) {
			result += str.slice(last, i) + '\\'
			last = i
		}
	}
	
	result += (last === 0)? str: str.slice(last)
	return point < SPACE ? JSONstringify(str) : result + '"'
}

function fast_quote(str) {
	assert.isTypeof(str, 'string', 'must be a string')
	const quoted = '"' + str + '"'
	assert.that(JSONparse, quoted).equal(str, 'must not require escaping')
	return quoted
}

const quote = safe_quote
quote.fast = fast_quote

module.exports = {
	none,
	fields,
	field,
	quote,
}
