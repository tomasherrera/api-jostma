var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid');

var itemSchema = new Schema({
  _id: {
    type: String,
    'default': shortid.generate
  },
  description:{
    type: String,
    required: true,
    default: "",
    es_indexed:true
  },
  barcode:{
    type: String
  },
  base_price:{
    type: Number
  },
  stock:{
    type: Number
  }
});

var Item = mongoose.model('Item', itemSchema);

module.exports = { Item, itemSchema };