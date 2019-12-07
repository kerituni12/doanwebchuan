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


    // async await
    
    let sale = await Sale.find();
    let count = await User.count();
    let products = await Product.find();
    let emp = await User.find();
    
    res.render('admin/sale', {
        sale: sale,
        count: count,
        products: products,
        emp: emp
    });


   //  res.send([count, products, emp, sale]);

    // [Sale.count(), Sale.find().exec()] -> fast
    // [Sale.find().exec(), Product.find().exec()] -> fast
    // [Sale.count(), Sale.find().exec(), Product.find().exec()] -> 2 ~ 3 giây

    // Debug promis all

    // console.time("start")
    // const value = await Promise.all([Sale.count().exec(), Sale.find().exec(), Product.find().exec(), User.find().exec()]);
    // const value1 = await Promise.all([]);
    // console.timeEnd('start')
    // res.send([value])
       
};

exports.add_sale = function (req, res) {

    // console.log('req body0', req.body);
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

    console.log('product', merged);

    let errors = req.validationErrors();

    if (errors) {
        req.app.locals.errors = errors;
        res.redirect('/admin/sales');
    } else {
        let sale = new Sale({
            user_mem: name_kh,
            phone: phone,
            user_emp: name_nv,
            items: merged,
            total: total,
            date: new Date(),
            status: 0
        });
        req.app.locals.errors =null;
        sale.save(function (err) {
            if (err)
                return console.log(err);
            req.flash('success', 'Đơn hàng đã được thêm');
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
        req.flash('success', 'Đơn hàng đã được xóa!');
        res.redirect('/admin/sales');
    });
};

exports.total = async function (req, res) {

    // chua toi uu
    let arr = [];    
        for (let i = 0; i < 12; i ++) {
            let sum = 0;
            await Sale.find(function(err, sale) {   
                sale.forEach((v, j) => {                   
                    if(v.date.getFullYear() == 2019 && v.date.getMonth() == i) {
                        sum += v.total;
                        }
                })             
                
            })            
            arr.push(sum);
        }

    res.send(arr);
}