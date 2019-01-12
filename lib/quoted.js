'use strict'
const { stringify } = JSON
const SPACE = 32, QUOTE = 34, BACKSLASH = 92

function quoted(str) {
	const len = str.length
	if (len > 100)
		return stringify(str)

	let result = '"', last = 0, point = 255
	for (let i = 0; i < len && point >= SPACE; i++) {
		point = str.charCodeAt(i)
		if (point === QUOTE || point === BACKSLASH) {
			result += str.slice(last, i) + '\\'
			last = i
		}
	}
	result += (last === 0)? str: str.slice(last)
	return point < SPACE ? stringify(str) : result + '"'
}

module.exports = quoted
