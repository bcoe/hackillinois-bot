const flip = require('flip')
const bodyParser = require('body-parser')
const pick = require('pick-random')
const express = require('express')
const request = require('request')
const cowsay = require('cowsay')
const cool = require('cool-ascii-faces')
const client = require('./lib/es-client')()
const searcher = require('./lib/searcher')
const decode = require('parse-entities')

// configure the yargs instance used
// to parse chat messages.
const parser = require('yargs')
  .usage('/hi [command]')
  .command('ask <text...>', 'Ask a Javascript related question!', () => {}, (argv) => {
    var response = decode('_*Question: '+ argv.text.join(' ') + '*_\n\n_*Suggested StackOverflow posts:*_\n')
    argv.respond(response)
    searcher.search(argv.text.join(' '), function(hits) {
      hits.forEach((hit) => {
        argv.respond(decode('\n*' + hit._source.title + '*\n' + hit._source.link + '\n'));
      })
    })
  })
  .command('issues', 'print issues labeled with #hackillinois', (yargs) => {
    yargs
      .option('label', {
        alias: 'l',
        description: 'label to list issues for',
        default: 'hackillinois'
      })
      .option('count', {
        alias: 'c',
        description: 'how many issues should we print',
        default: 3
      })
  }, (argv) => {
    request.get({
      url: `https://api.github.com/search/issues?q=label:${argv.label}&per_page=100`,
      json: true,
      headers: {
        'user-agent': 'HackIllinois 2017'
      }
    }, (err, res, obj) => {
      pick(obj.items, {count: argv.count}).forEach((item) => {
        argv.respond('*' + item.title + '*' + ': ' + item.url)
      })
    })
  })
  .command('flip <text...>', 'flip text upside down', () => {}, (argv) => {
    argv.respond(flip(argv.text.join(' ')))
  })
  .command('cowsay <text...>', 'Say it like a cow?', () => {}, (argv) => {
    argv.respond('```\n' + cowsay.say({
      text: argv.text.join(' '),
      e: 'oO',
      t: 'U'
    }) + '\n```')
  })
  .command('asciiface', 'send a random cool ascii face', () => {}, (argv) => {
    argv.respond(cool())
  })
  .demand(1)
  .strict()
  .help()
  .epilog("HackIllinois 2017 Chat Bot, Contribute Here https://github.com/bcoe/hackillinois-bot")

const app = express()
let logger = console

// Slack's slash commands are passed as an urlencoded
// HTTP post: https://api.slack.com/slash-commands
app.use(bodyParser.urlencoded({ extended: false }))

// slack webhook endpoint.
app.post('/', function (req, res) {
  let context = Object.assign({}, req.body)

  // slack secret token must be provided.
  if (!req.body || req.body.token !== process.env.SLACK_TOKEN) {
    return res.sendStatus(401)
  }

  // provides a respond function that any yargs
  // command can use to respond to Slack.
  context.respond = buildResponder(req.body.response_url)
  // run the yargs parser on the inbound slack command.
  parser.parse(req.body.text || '', context, (err, argv, output) => {
    if (err) logger.error('```\n' + err.message + '\n```')
    if (output) argv.respond('```\n' + output + '\n```')
  })

  res.send('')
})

// returns a helper function for dispatching messages
// back to Slack.
function buildResponder (responseUrl) {
  return function (msg) {
    request.post({
      url: responseUrl,
      json: true,
      body: {
        response_type: 'in_channel',
        text:  msg
      }
    }, function (err, res, body) {
      if (err) return logger.error(err)
      if (res && res.statusCode >= 400) logger.error('invalid response =', res.statusCode)
      else logger.info(body)
    })
  }
}

// ping endpoint.
app.get('/', function (req, res) {
  res.send('pong')
})

const port = process.env.PORT || 3000

const server = app.listen(port, function (foo) {
  if (process.env.HEROKU) keepAlive()
  logger.info('Pirate Joe bot listening on :' + port, 'beep boop')
})

// ping our application every 5 minutes so
// that Heroku does not sleep it.
function keepAlive () {
  setInterval(function () {
    logger.info('pinged', process.env.APP_URL)
    request.get(process.env.APP_URL)
  }, 300000)
}
