'use strict'
const Bench = require('@spazmodius/hrbench')
const hrNow = require('../lib/hr-now')
const { now } = Date

Bench()
	.test(now)
	.test(hrNow)
	.run()
	.then(Bench.summarize)
	.then(console.log)