var mongoose = require('mongoose');

// User Schema
var UserSchema = mongoose.Schema({
    local: {
        email: String,
        password: String
    },
    facebook: {
        id: String,
        token: String,
        email: String,       
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        // required: true
    },    
    phone: {
        type: Number, 
        //required: true       
    },address: {
        type: String
    },
    role: {
        type: String
    }
    
});

var User = module.exports = mongoose.model('User', UserSchema);

