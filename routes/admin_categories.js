var express = require('express');
var router = express.Router();

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

var categoriesController = require('../controllers/admin/categoriesController');

router.get('/', isAdmin, categoriesController.index);

router.post('/add-category', isAdmin, categoriesController.add_cate_post);

router.get('/edit-category/:id', isAdmin, categoriesController.edit_cate_get);

router.post('/edit-category/:id', isAdmin, categoriesController.edit_cate_post);

router.post('/delete-category/:id', isAdmin, categoriesController.delete_cate_post);

// Exports
module.exports = router;