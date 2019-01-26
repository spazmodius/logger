'use strict'
const test = require('ava')
const hrNow = require('../lib/hr-now')

test('hrNow matches Date.now', t => {
	t.true(Math.abs(hrNow() - Date.now()) <= 1)
})
