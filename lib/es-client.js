'use strict'

const elasticsearch = require('elasticsearch')

let client = null

module.exports = function () {
  if (!client) {
    client = elasticsearch.Client({
      hosts: process.env.BONSAI_URL
    })
  }
  return client
}
