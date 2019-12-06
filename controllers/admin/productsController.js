// Get Product model

var Product = require('../../models/product');

var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

exports.index = function (req, res) {
    let count;
    Product.count(function (err, c) {
        count = c;
    });

    Product.find(function (err, products) {
        res.render('admin/products', {
            products: products,
            count: count
        });
    });
};

exports.add_product_post = function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Tiêu đề không được rỗng.').notEmpty();
    req.checkBody('desc', 'Mô tả không được rỗng.').notEmpty();
    req.checkBody('price', 'Giá không được rỗng.').isDecimal();
    req.checkBody('image', 'Vui lòng chọn ảnh').isImage(imageFile);
    req.checkBody('count', 'Số lượng không được rỗng').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var count = req.body.count;

    var errors = req.validationErrors();

    if (errors) {
        req.app.locals.errors = errors;
        res.redirect('/admin/products');

    } else {
        Product.findOne({
            slug: slug
        }, function (err, product) {
            if (product) {
                req.flash('danger', 'Sản phẩm đã tồn tại');
                res.redirect('/admin/products');
            } else {

                var price2 = parseFloat(price).toFixed(2);

                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile,
                    count: count
                });

                product.save(function (err) {
                    if (err)
                        return console.log(err);

                    //create floder
                    mkdirp('public/product_images/' + product._id, function (err) {
                         return console.log('image' + err);                         
                    });

                    // mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
                    //     return console.log('gallery' + err);                       
                    // });

                    // mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                    //     return console.log('thumbs' + err);                        
                    // });

                    // add pic
                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }

                    req.app.locals.errors = null;
                    req.flash('success', 'Sản phẩm đã được thêm');
                    res.redirect('/admin/products');
                });
            }
        });
    }

};

exports.edit_product_get = function (req, res) {

    Product.findById(req.params.id, function (err, products) {
        if (err) {
            console.log(err);
            res.redirect('/admin/products');
        } else {
            res.send(products);
        }
    });

};

exports.edit_product_post = function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Tên sản phẩm không được trống').notEmpty();
    req.checkBody('desc', 'Mô tả không được trống').notEmpty();
    req.checkBody('price', 'Vui lòng điền giá tiền.').isDecimal();
    req.checkBody('image', 'Bạn cần upload ảnh').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;
    let count = req.body.count;

    var errors = req.validationErrors();

    if (errors) {
        // req.session.errors = errors;

        res.redirect('/admin/products');
    } else {
                Product.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.count = count;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }

                    p.save(function (err) {
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });

                        }

                        req.app.locals.errors = null;
                        req.flash('success', 'Sản phẩm đã được chỉnh sửa');
                        res.redirect('/admin/products');
                    });

                });
            }
};


// tam thoi khong quan tam

// exports.product_gallery = function (req, res) {

//     var productImage = req.files.file;
//     var id = req.params.id;
//     var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
//     var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

//     productImage.mv(path, function (err) {
//         if (err)
//             console.log(err);

//         resizeImg(fs.readFileSync(path), {
//             width: 100,
//             height: 100
//         }).then(function (buf) {
//             fs.writeFileSync(thumbsPath, buf);
//         });
//     });

//     res.sendStatus(200);

// };

// exports.del_img = function (req, res) {

//     var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
//     var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

//     fs.remove(originalImage, function (err) {
//         if (err) {
//             console.log(err);
//         } else {
//             fs.remove(thumbImage, function (err) {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     req.app.locals.errors = null;
//                     req.flash('success', 'Image deleted!');
//                     res.redirect('/admin/products/edit-product/' + req.query.id);
//                 }
//             });
//         }
//     });
// };

exports.del_product = function (req, res) {

    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function (err) {
                console.log('remove-product' + err);
            });

           // req.app.locals.errors = null;
            req.flash('success', 'Sản phẩm đã được xóa');
            res.redirect('/admin/products');
        }
    });

};