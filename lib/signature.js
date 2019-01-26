'use strict'

const $sig = Symbol('signature')
const rxFunctionArgs = /^function[^(]*\((.*)\)\s*{/
const rxArrowArgs = /^(.*)=>/
const PUNC = new Set('!"$%&\'()*+,-./:;<=>?[]^`{|}~')
const isPunc = c => PUNC.has(c)
const EMPTY = ''
const SPACE = ' '

function getSignature(fn) {
	return fn[$sig] || (fn[$sig] = calculateSignature(fn.toString()))
}

function calculateSignature(code) {
	const sig = (rxFunctionArgs.exec(code) || rxArrowArgs.exec(code))[1]

	return pipeline(sig,
		compress,
		stripParens,
		stripTrailingComma,
		spaceAfterCommas,
		surroundWithParens,
	)
}

function pipeline(value, ...fns) {
	return fns.reduce((value, fn) => fn(value), value)
}

const compress = js => js.replace(/\s+/g, elide)

function elide(ws, at, text) {
	if (at === 0 || isPunc(text[at - 1]))
		return EMPTY
	const after = at + ws.length
	if (after >= text.length || isPunc(text[after]))
		return EMPTY
	return SPACE
}

const hasParens = sig => sig[0] === '(' && sig[sig.length - 1] === ')'

function stripParens(sig) {
	if (hasParens(sig))
		return sig.slice(1, -1)
	return sig
}

function spaceAfterCommas(sig) {
	return sig.replace(/,/g, ', ')
}

function stripTrailingComma(sig) {
	if (sig[sig.length - 1] === ',')
		return sig.slice(0, -1)
	return sig
}

function surroundWithParens(sig) {
	if (!hasParens(sig))
		return '(' + sig + ')'
	return sig
}

function setSignature(fn, other) {
	fn[$sig] = getSignature(other)
	return fn
}

module.exports = { getSignature, setSignature }
