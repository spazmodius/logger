'use strict'
const test = require('ava')
const { getSignature } = require('../lib/signature')

const signatures = [
	[function() {}, '()'],
	[function(a) {}, '(a)'],
	[function(  a  ) {}, '(a)'],
	[function(  b = []  ) {}, '(b=[])'],
	[function(a, b) {}, '(a, b)'],
	[function( a, ...b ) {}, '(a, ...b)'],
	[function(a,b,c,d,e) {}, '(a, b, c, d, e)'],
	[function f00() {}, '()'],
	[function f01(  ) {}, '()'],
	[function f51( a,b,c,  d,e, ) {}, '(a, b, c, d, e)'],
	[function f52( a,b,c,  d,e = {} ) {}, '(a, b, c, d, e={})'],
	[function f53( a,b,c = null,  d,e = {} ) {}, '(a, b, c=null, d, e={})'],
	[()=>{}, '()'],
	[_=>_, '(_)'],
	[  _  =>  _  , '(_)'],
	[(_)=>_, '(_)'],
	[(  _  )=>_, '(_)'],
	[(  _  )  =>  _, '(_)'],
	[(a,  b,c,)=>{}, '(a, b, c)'],
	[({a,  b,c})=>{}, '({a, b, c})'],
	[([a,  b,c])  =>{}, '([a, b, c])'],
	[(a  =  new   X   )=>{}, '(a=new X)'],
	[(a  =  new   X()   )=>{}, '(a=new X())'],
]

signatures.forEach(([fn, sig]) => test(fn.toString(), t => {
	t.is(getSignature(fn), sig)
}))
