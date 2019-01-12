'use strict'

const quoted = require('./quoted')
const { stringify } = JSON

const innards = obj => stringify(obj).slice(1, -1)

const start = append.bind(null, '{')

function append(partial, properties) {
	properties = innards(properties)
	return properties? partial + properties + ',': partial
}

const timeLabel = '"time":'
const msgLabel = ',"msg":'
const dataLabel = ',"data":'
const EOL = '}\n'

function finalize({ partial, time, msg, data }) {
	partial += timeLabel + time
	partial += msgLabel + quoted(msg)
	if (data !== undefined && (data = stringify(data)) !== undefined)
		partial += dataLabel + data
	return partial + EOL
}

module.exports = {
	start,
	append,
	finalize,
}