let mongoose = require('mongoose')

let CampSchema = mongoose.Schema({
    type : {
        type : String
    },
    name: {
        type: String
    },
    content: {
        type: String
    },
    des: {
        type: String
    },
    status: {
        type: Number
    }
})

let Camp = module.exports = mongoose.model('Camp', CampSchema)