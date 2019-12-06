var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

var usersController = require('../controllers/admin/usersController');

router.get('/', isAdmin, usersController.index);

router.post('/add-user', isAdmin, usersController.add_user);

router.get('/edit-user/:id', isAdmin, usersController.edit_user_get);

router.post('/edit-user/:id', isAdmin, usersController.edit_user_post);

router.post('/delete-user/:id', isAdmin, usersController.del_user);
// Exports
module.exports = router;