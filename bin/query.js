#!/usr/bin/env node

require('dotenv').config()
const client = require('../lib/es-client')()

client.search({
	index: 'questions',
	type: 'question',
 // function_score: {
  //  query: { match: { title: 'jquery forms'} },
//    field_value_factor: {
//      field: "score", modifier: "log1p", factor: 0.1
    //},
//    boost_mode: "sum"
 // },
 	query: { match: { title: 'jquery forms'} },
  	size: 255,
}).then(function(body) {
	console.log(JSON.stringify(body, null, 2))
}, function(error) {
  console.log(error.message)
});