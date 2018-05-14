var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var _ = require('lodash');

var { mongoose } = require('./db/mongoose');
var { Sale } = require('./models/sale');
var { Item, itemSchema } = require('./models/item');
var searchMatch = require('./search_match');

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: '172.17.0.3:9200',
  log: 'trace'
});

var app = express();

app.use(bodyParser.json());

app.use(cors())

// const item = new Item({ description: "Escoba plástica para jardín 30 pulgadas 30 dientes", stock: 30, base_price: 27900  });
// item.save().then(() => console.log('saved'));
//
// const item2 = new Item({ description: "Set herramientas jardín plástico 3 piezas", stock: 30, base_price: 12900  });
// item2.save().then(() => console.log('saved'));
//
// const item3 = new Item({ description: "Palita angosta mango madera 33 cm largo", stock: 30, base_price: 59900  });
// item3.save().then(() => console.log('saved'));
//
// const item4 = new Item({ description: "Cultivador jardinería plástico", stock: 30, base_price: 40900  });
// item4.save().then(() => console.log('saved'));
//
// const item5 = new Item({ description: "Pala Plastica Antichispa", stock: 30, base_price: 15900  });
// item5.save().then(() => console.log('saved'));
//
// const item6 = new Item({ description: "Paladraga sencilla", stock: 30, base_price: 4900  });
// item6.save().then(() => console.log('saved'));

// POST Sales - Create a new Sale
app.post('/sales', (req, res) => {

  Sale.create(req.body, function (err, sale) {
    if (err) return handleError(err);
    res.send(sale);
  })

});

// GET Sales - Retrieve all Sales
app.get('/sales', (req, res) => {
  Sale.find().then((sales) => {
    res.send({
      sales
    })
  }, (e) => {
    res.status(400).send(e);
  });
});

// GET Items - Retrieve all Items
app.get('/items', (req, res) => {
 Item.find().then((items) => {
    res.send({
      items
    })
  }, (e) => {
    res.status(400).send(e);
  });
});

app.post('/sale_items', (req, res) => {
  console.log(req.body);
  res.send(req.body);
});

client.ping({
  // ping usually has a 3000ms timeout
  requestTimeout: 3000
}, function (error) {
  if (error) {
    console.trace('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});

index = () => {
  Item.find().then((items) => {
    bulkIndex('items', 'hardware', items);
  }, (e) => {
    console.log(e);
  });
}

//index();
// Elastic Search Items
app.get('/items_search', cors(), (req, res) => {
  console.log("req", req.query.search)
  let body = {
    size: 20,
    from: 0,
    query: {
      multi_match: {
        query: req.query.search,
        type: "phrase_prefix",
        fields: [ "description", "id" ]
      }
    }
  }
  searchMatch.search('items', body).then(results => {
    console.log(`found ${results.hits.total} items in ${results.took}ms`);
    console.log('DATA -> ', JSON.stringify(results.hits.hits));

    let data = _.map(results.hits.hits, '_source');
    res.json(data);
  })
  .catch(console.error);
});

app.listen(3000, () => {
  console.log('Started on port 4000');
});

const bulkIndex = function bulkIndex(index, type, data) {
  let bulkBody = [];
  let newData = [];
  let indice = 1;
  data.forEach(item => {
    let mitem = {
      id: item._id,
      description: item.description,
      base_price: item.base_price,
      stock: item.stock
    }
    indice++;
    newData.push(mitem);
  });
  newData.forEach(item => {
    bulkBody.push({
      index: {
        _index: index,
        _type: type,
        _id: item.id
      },
      mappings: {
        _doc: {
          properties: {
            description: {
              type: "text",
              boost: 2
            }
          }
        }
      }

    });
    bulkBody.push(item);
  });

  client.bulk({body: bulkBody})
  .then(response => {
    let errorCount = 0;
    response.items.forEach(item => {
      if (item.index && item.index.error) {
        console.log(++errorCount, item.index.error);
      }
    });
  })
  .catch(console.err);
};
