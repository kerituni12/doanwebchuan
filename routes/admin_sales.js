var express = require('express');
var router = express.Router();

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

var saleController = require('../controllers/admin/saleController');
// var nsaleController = require('../controllers/saleController');

router.get('/', isAdmin, saleController.index);

router.post('/add-sale', isAdmin, saleController.add_sale);

router.get('/edit-sale/:id', isAdmin, saleController.edit_sale_get);

router.get('/total/:year', isAdmin, saleController.total);

router.post('/delete-sale/:id', isAdmin, saleController.delete_sale_post);


// Exports
module.exports = router;