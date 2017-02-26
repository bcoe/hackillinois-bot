const client = require('./es-client')()

function search(query, callback) {
  client.search({
    index: 'questions',
    type: 'question',
    body: {
      size: 5,
      query: {
        function_score: {
          boost_mode: 'replace',
          query: {
            multi_match: {
              query: query,
              fields: ['title^1', 'tags^2']
            }
          },
          script_score: {
            script: '_score * 5.0 + doc["score"] * 0.1'
          }
        }
      }
    }
  }).then(function(body) {
      callback(body.hits.hits);
    }, function(error) {
        console.log(error.message);
  });
}

module.exports = {
  search: search,
};
