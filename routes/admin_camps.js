var express = require('express');
var router = express.Router();

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

var campController = require('../controllers/admin/campController');
// var ncampController = require('../controllers/campController');

router.get('/', isAdmin, campController.index);

router.post('/add-camp', isAdmin, campController.add_camp);

router.get('/edit-camp/:id', isAdmin, campController.edit_camp_get);

router.post('/edit-camp/:id', isAdmin, campController.edit_camp_post);

router.post('/delete-camp/:id', isAdmin, campController.delete_camp_post);

router.post('/send-camp/:id',isAdmin, campController.send_camp)

// Exports
module.exports = router;