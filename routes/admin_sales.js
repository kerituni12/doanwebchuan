var express = require('express');
var router = express.Router();

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

var saleController = require('../controllers/admin/saleController');
// var nsaleController = require('../controllers/saleController');

router.get('/',  saleController.index);

router.post('/add-sale',  saleController.add_sale);

router.get('/edit-sale/:id',  saleController.edit_sale_get);

router.get('/total',  saleController.total);

router.post('/delete-sale/:id',  saleController.delete_sale_post);


// Exports
module.exports = router;