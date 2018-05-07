const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order  = require('../models/order');
const Product = require('../models/product')
const auth = require('../token-check');

router.get('/', auth, (req, res, next) => {
    Order.find()
    .select("product quantity _id")
    .populate('product', '_id name price')
    .exec()
    .then(docs => {
      res.status(200).json({
          count: docs.length,
          orders: docs.map(doc => {
                return {_id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: "http://localhost:3000/orders/" + doc._id
                    }
                }
          })
      })
    })
    .catch(err => {
        res.status(200).json({
            error: err
        })
    });
});

router.post('/', auth, (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product =>{
            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }
            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
           return order.save();

        })
    .then(result => {
        res.status(200).json({
            message: "Order saved",
            orderCreated: {
                _id: result._id,
                product: {
                    productId: result.product,
                    request: {
                        type: 'GET', 
                        url: 'http://localhost:3000/products/' + result.product
                    }
                },
                quantity: result.quantity
            },
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders/' + result._id
            }
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

router.get('/:orderId', auth, (req, res, next) => {
    Order.findById(req.params.orderId)
    .populate('product', '_id name price')
    .exec()
    .then(order => {
        if(!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }
        res.status(200).json({
            order: order._id,
            product: order.product,
            
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders/' + order._id
            }
        })
    })
    .catch(err => {
        res.status(500).json({error: err});
    })
});

router.delete('/:orderId', auth, (req, res, next) => {
    Order.remove({_id: req.params.orderId})
    .exec()
    .then(result => {
        res.status(200).json({
            message: "order deleted"
        })
        
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});





module.exports = router;