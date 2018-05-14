var mongoose = require('mongoose');
var shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ&@');
var Sale = mongoose.model('Sale', {
  _id: {
    type: String,
    'default': shortid.generate
	},
  total:{
    type: Number
  },
  status:{
    type: String
  },
  quantity:{
    type: Number
  }
});

module.exports = { Sale };