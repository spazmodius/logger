'use strict'

const $sig = Symbol('signature')

function getSignature(fn) {
	return fn[$sig] || (fn[$sig] = calculateSignature(fn.toString()))
}

function calculateSignature(code) {
	const rxSig = /^(?:function[^(]*)?(\(.*\))\s*(?:=>|{)/
	return rxSig.exec(code)[1]
}

function setSignature(fn, other) {
	fn[$sig] = getSignature(other)
	return fn
}

module.exports = { getSignature, setSignature }
