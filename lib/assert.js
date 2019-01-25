'use strict'

function isTypeof(actual, type) {
	return typeof actual === type
}

function startsWith(actual, prefix) {
	return String(actual).indexOf(prefix) === 0
}

module.exports = require('@spazmodius/assert')
	.register(isTypeof)
	.register(startsWith)
