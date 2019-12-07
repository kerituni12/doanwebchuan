var express = require('express');
var path = require('path');
var fs = require('fs');
var https = require('https');     
var mongoose = require('mongoose');
require('dotenv').config();
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport');
const fbService = require('./services/fbService');
const callSendAPI = require('./controllers/fbController').callSendAPI;
const Product = require('./models/product');


//mongoose connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/cmscart');
// mongoose.set('debug', true);
var dbMongo = mongoose.connection;
dbMongo.on('err', console.error.bind(console, 'connect fail'));
//dbMongo.once('open',function () {
    //sao lai connect toi day lam gi
    //const taskCollection = dbMongo.collection('products');

     //console.log(taskCollection); 
    //   const changeStream = taskCollection.watch();
    //   changeStream.on('change', (change) => {

    //     // console.log(change);
           
    //       if (change.operationType == 'update') {
              
    //         if(change.updateDescription.updatedFields.count <= 5 ) {
    //             Product.findOne({id: change.documentKey._id}, function(err, p){

    //                 if(err) console.log(err);

    //                 if(p)
    //                 callSendAPI('3020488171325993', {'text': `Vui lòng bổ sung ${p.title} cho kho`});
    //             })
                
    //         }else console.log(change.updateDescription);
    //       }
    //    });
  //  console.log('mongo connected');
//});


// Init app
var app = express();
const http = require("http").Server(app);
const io = require("socket.io");
socket = io(http);
// Product.watch().on('change', (change) => {
//     console.log(JSON.stringify(change)); // You could parse out the needed info and send only that data. 
//     io.emit('changeData', change);
// }); 
socket.on('connection', function () {
    console.log(' io connected');
});
global.loopMessage = null;


// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set global errors variable
app.locals.errors = null;
app.locals.sessionchat = null;

// Get Category Model
var Category = require('./models/category');

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});

// Express fileUpload middleware
app.use(fileUpload());

// Body Parser middleware
// 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());

// Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { 
    //     maxAge: 300000,
    //     secure: false 
    // }
}));

// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next) {
   res.locals.cart = req.session.cart;
   res.locals.user = req.user || null;
   next();
});

// Set routes 
var users = require('./routes/users.js');
var adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');
var adminUsers = require('./routes/admin_users.js');
var adminCamps = require('./routes/admin_camps.js');
var adminSales = require('./routes/admin_sales.js');
app.get('/webhook', fbService.handleVerifyServer);
app.post('/webhook', fbService.handleWebhookEvent);
app.get('/admin/chart', function (req, res) {
    res.render('admin/chart');
});


app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/admin/users', adminUsers);
app.use('/users', users);
app.use('/admin/camps', adminCamps);
app.use('/admin/sales', adminSales);
// app.use('/', res);
app.use('/', function (req, res) {
    if (typeof req.user != 'undefined' && (req.user.role ==  'admin')) return res.redirect('/admin/users');
    console.log(req.user);
    // if (req.user) return res.redirect('/admin/users');
    res.render('login');
});
// app.use('/api', function(req, res){
//     res.send(app.locals.categories);
// })

// Start the server https

//const port = process.env.PORT ||3001;

// const httpsOptions = {
//     cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
//     key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key')),
// }
// var port = 3001;
// https.createServer(httpsOptions, app).listen(port, function(){
//     console.log('Server started on port ' + port);
// })

// server https
const port = process.env.PORT ||3001;
app.listen(port, function () {
    console.log('Server started on port ' + port);
});
