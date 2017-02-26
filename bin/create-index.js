#!/usr/bin/env node

const client = require('../lib/es-client')()
const indexDescription = require('../data/search-index.json')
const indexName = 'questions'

client.indices.create({index: indexName, body: indexDescription}, (err, response) => {
  if (err) console.error(err)
  else console.log(response)
})
