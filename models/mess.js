var mongoose = require('mongoose');

// Category Schema
var CategorySchema = mongoose.Schema({
   
    id: {
        type: String,        
    },
    loop: {
        type: Number
    },
    temppass: {
        type: String
    },
    admin: {
        type: Number
    }
});

var Mess = module.exports = mongoose.model('Mess', CategorySchema);

