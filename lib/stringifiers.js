'use strict'
const assert = require('./assert')
const { stringify: JSONstringify, parse: JSONparse } = JSON

function none() {
	return ''
}

function safe_properties(properties) {
	if (properties !== undefined) {
		const json = JSONstringify(properties)
		if (json !== undefined && json[0] === '{')
			return json.slice(1, -1)
	}
	return ''
}

function fast_properties(properties) {
	const json = JSONstringify(properties)
	assert.startsWith(json, '{', 'must be an object', properties)
	return json.slice(1, -1)
}

const properties = safe_properties
properties.fast = fast_properties

function safe_property(name, value) {
	const valueString = JSONstringify(value)
	return valueString === undefined? '': safe_quote(name) + ':' + valueString
}

function fast_property(name, value) {
	const valueString = JSONstringify(value)
	assert.notEqual(valueString, undefined, 'value must jsonify', name, value)
	return fast_quote(name) + ':' + valueString
}

const property = safe_property
property.fast = fast_property

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
	properties,
	property,
	quote,
}
