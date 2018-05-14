var elasticsearch = require('elasticsearch');
var esClient = new elasticsearch.Client({
  host: 'localhost:32769',
  log: 'trace'
});

const search = function search(index, body) {
	return esClient.search({index: index, body: body});
};

const test = function test() {
  let body = {
    size: 20,
    from: 0,
    query: {
      match_all: {}
    }
  };

  search('items', body)
  .then(results => {
    console.log(`found ${results.hits.total} items in ${results.took}ms`);
    console.log(`returned hardware titles:`);
    results.hits.hits.forEach(
      (hit, index) => console.log(
        `\t${body.from + ++index} - ${hit._source.description}`
      )
    )
  })
  .catch(console.error);
};

module.exports = { test };