'use strict'

const EMPTY = {}

function normalize(meta) {
	if (meta === undefined || meta === null)
		return EMPTY
	if (typeof meta === 'object' && !Array.isArray(meta))
		return meta
	return { name: meta }
}

module.exports = normalize
