var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

var productsController = require('../controllers/admin/productsController');

router.get('/', isAdmin, productsController.index);

router.post('/add-product', productsController.add_product_post);

router.get('/edit-product/:id', isAdmin, productsController.edit_product_get);

router.post('/edit-product/:id', productsController.edit_product_post);

router.post('/product-gallery/:id', productsController.product_gallery);

router.get('/delete-image/:image', isAdmin, productsController.del_img);

router.post('/delete-product/:id', isAdmin, productsController.del_product);

// Exports
module.exports = router;