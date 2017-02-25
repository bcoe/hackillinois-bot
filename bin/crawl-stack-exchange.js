#!/usr/bin/env node
const eachLimit = require('async').eachLimit
const request = require('request')
require('yargs')
  .option('url', {
    describe: 'url to crawl for questions',
    default: 'https://api.stackexchange.com/2.2/search/advanced'
  })
  .option('page', {
    describe: 'page to start crawling from',
    default: 1
  })
  .option('page-size', {
    describe: 'page to start crawling from',
    default: 50
  })
  .option('min-date', {
    describe: 'date to start crawling from',
    default: 1417824000
  })
  .option('page-count', {
    describe: 'how many pages should we crawl?',
    default: 3
  })
  .command('crawl', 'crawl stackoverflow for JavaScript questions', () => {}, (argv) => {
    var counter = argv.page
    eachLimit(new Array(argv.pageCount), 1, (_item, cb) => {
      const opts = Object.assign(argv, {
        page: counter
      })
      console.info('fetching page ', counter, ' from stackoverflow.com')
      request.get({
        url: createUrl(opts),
        json: true,
        gzip: true
      }, (err, res, obj) => {
        console.log(res.statusCode, res.body)
        if (res && res.statusCode !== 200) err = Error('unexpected status = ', res.statusCode)
        if (err) return cb(err)

        // console.log(JSON.stringify(obj, null, 2))

        counter ++
        return cb()
      })
    }, (err) => {
      if (err) console.error(err.message)
    })
  })
  .strict()
  .help()
  .argv

function createUrl(opts) {
  return `${opts.url}?page=${opts.page}&pagesize=${opts.pageSize}&order=desc&min=${opts.minDate}&sort=activity&accepted=True&answers=1&tagged=javascript&site=stackoverflow`
}
