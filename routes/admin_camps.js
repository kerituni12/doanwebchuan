var express = require('express');
var router = express.Router();

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

var campController = require('../controllers/admin/campController');
// var ncampController = require('../controllers/campController');

router.get('/',  campController.index);

router.post('/add-camp',  campController.add_camp);

router.get('/edit-camp/:id',  campController.edit_camp_get);

router.post('/edit-camp/:id',  campController.edit_camp_post);

router.post('/delete-camp/:id',  campController.delete_camp_post);

router.post('/send-camp/:id', campController.send_camp)

// Exports
module.exports = router;