let mongoose = require('mongoose')

let SaleSchema = mongoose.Schema({    
    user_mem: String,
    phone: Number,
    user_emp: String,   
    items:[],
    date: Date,
    total: Number,    
    status: Number
})

let Camp = module.exports = mongoose.model('Sale', SaleSchema)