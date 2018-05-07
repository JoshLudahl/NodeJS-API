const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const mongoose = require('mongoose');
const multer = require('multer');
const auth = require('../token-check');


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
},
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cd(null, true);
    }
    else {cb(null, false)}
}

const upload = multer({storage: storage, limits: {
    fileSize: 7000 * 7000 * 5
}});

router.get('/', (req, res, next) => {
    Product.find()
    .select("_id name price productImage")
    .exec()
    .then(docs =>{
        const response = {
            count: docs.length,
            products:docs.map(doc =>{
                return {
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    _id: doc._id,
                    request : {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + doc._id
                    }
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', auth, upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path.replace(/\\/, '/')
    });
    product
        .save()
        .then(result => {
            
            res.status(201).json({
                message: "Created product Successfully",
                CreatedProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request : {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
     .exec()
     .then(doc => {
         
         if (doc) {
             res.status(200).json({
                id: doc._id, 
                name: doc.name,
                price: doc.price
             });
         }
         else {
             res.status(404).json({
                message: "No products found."
             });
         }

     })
     .catch(err => {
         console.log(err);
         res.status(500).json({
             error: "Product Not Found"
         });
 
     });
});

router.patch('/:productId', auth, (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};

    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    
    Product.update({_id: id}, {$set:updateOps })
        .exec()
        .then(result =>{
            
            res.status(200).json({
                message: "Product Updated",
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + id
                }
            });
        })
        .catch(err =>{
            console.log(err);
            res,status(500).json({message:err});
        });
});

router.delete('/:productId', auth, (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product Deleted'
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

module.exports = router;