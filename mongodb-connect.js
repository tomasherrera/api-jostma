const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://172.17.0.2:27017/jostma', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');
  const db = client.db('jostma')

  db.collection('sales').insertOne({
    total: 200000,
    salesman: "Tomas Herrera"
  }, (err, result) => {
    if(err) {
      return console.log('Unable to insert todo', err);
    }

    console.log(JSON.stringify(result.ops, undefined, 2));
  });

  client.close();
});
