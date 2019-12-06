// Get Category model
let Sale = require('../../models/sale');
let Product = require('../../models/product');
let User = require('../../models/user');

const request = require("request");
const rp = require('request-promise');
const Promise = require('bluebird');


exports.index = async function (req, res) {

    // Callback hell 

    //let count;

    // Sale.find(function (err, sale) {
    //     if (err)
    //         return console.log(err);
    //     Product.find(function(err, products) {
    //         if (err)
    //         return console.log(err);
    //         User.find(function(err, emp) {
    //             if(err)
    //                 return console.log(err);
    //                 Sale.count(function (err, c) {
    //                     if (err)
    //                         return console.log(err);
    //                     count = c;
    //                     res.render('admin/sale', {
    //                         sale: sale,
    //                         count: count,
    //                         products: products,
    //                         emp: emp
    //                     });
    //                 });

    //         })

    //     })

    // });
//m ko dùng phím tắt đc run lai giúp

    // async await
    //console.time('start')
     //check momery di ? em khong biet
    // let products = await Product.find().exec();
     //let emp = await User.find().exec();
    
// console.timeEnd('start')
// res.send([products, emp]);

    // res.render('admin/sale', {
    //     sale: sale,
    //     count: count,
    //     products: products,
    //     emp: emp
    // });

//save đi
//run thư x

// khong duoc thi de e dung async await cung duoc a. ton time a qua
//thương thì Promise.all chạy nhanh hơn wtf
//cho m 10' nua
//ok a

    //  res.send([count, products, emp, sale]);

    // [Sale.count(), Sale.find().exec()] -> fast
    // [Sale.find().exec(), Product.find().exec()] -> fast
    // [Sale.count(), Sale.find().exec(), Product.find().exec()] -> 2 ~ 3 giây

    // Delay 2 - 3 s ; 
    //biet vi sao bi chua
    // e khong biet nhung chi biet > 2 la no cham :(
        //Promsie.all chay song song nên nó có thể ngốn RAM trong lúc mông queyry
        //tách ra sẽ nhanh hơn so vơi await 
        // a chi em check ram voi
        //Thường thì mongodb sẽ chiếm 50% RAM
        // c.on a e test sau . a ngu som di a
        //ok bye
    console.time("start")
    const value = await Promise.all([Sale.count().exec(), Sale.find().exec(), Product.find().exec(), User.find().exec()]);
    // const value1 = await Promise.all([]);
    console.timeEnd('start')
    res.send([value])
        //.then(value => res.send(value))
//comment d
    // .then(([count, sale, products, emp]) => res.render('admin/sale', {
    //     count: count,
    //     sale: sale,        
    //     products: products,
    //     emp: emp
    // }))
};

exports.add_sale = function (req, res) {

    // console.log(req.body);
    req.checkBody('phone', 'Số điện thoại không được rỗng').notEmpty();

    let name_kh = req.body.name_kh;
    let content = req.body.content;
    let name_nv = req.body.name_nv;
    let phone = parseInt(req.body.phone);
    let product = req.body.product;
    let count = req.body.count;
    let total = parseFloat(req.body.total);

    if (!(product instanceof Array)) {
        product = [product];
        count = [count]
    };
    const merged = product.reduce((obj, key, index) => ({
        ...obj,
        [key]: count[index]
    }), {});

    let errors = req.validationErrors();

    if (errors) {
        req.flash('danger', errors);
        res.redirect('/admin/sales');
    } else {
        let sale = new Sale({
            user_mem: name_kh,
            phone: phone,
            user_emp: name_nv,
            product: merged,
            total: total,
            status: 0
        });

        sale.save(function (err) {
            if (err)
                return console.log(err);
            req.flash('success', 'sale đã được thêm');
            res.redirect('/admin/sales');
        });
    }

};

exports.edit_sale_get = function (req, res) {

    Sale.findById(req.params.id, function (err, sale) {
        if (err)
            return console.log(err);
        res.send(sale);
    });

};

exports.delete_sale_post = function (req, res) {
    Sale.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            return console.log(err);
        req.flash('success', 'sale đã được xóa!');
        res.redirect('/admin/sales');
    });
};