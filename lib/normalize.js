'use strict'

function normalize(meta) {
	if (meta === undefined || meta === null)
		return {}
	if (typeof meta === 'object' && !Array.isArray(meta))
		return meta
	return { name: meta }
}

module.exports = normalize
