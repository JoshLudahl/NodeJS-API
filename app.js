
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

//  connect to database
const mongoURI = "mongodb://" +process.env.MONGO_USER+ ":"+ process.env.MONGO_ATLAS_PW + "@cluster0-shard-00-00-zapnu.mongodb.net:27017,cluster0-shard-00-01-zapnu.mongodb.net:27017,cluster0-shard-00-02-zapnu.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin"
mongoose.connect(mongoURI);

//  ENABLE LOGGING
app.use(morgan('dev'));
//  ENABLE BODY PARSING
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({}));

app.use(express.static('uploads'));
//  ENABLE CORS ACCESS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});


//  ROUTES
//      PRODUCT ROUTE
const productRoutes = require('./api/routes/products');
app.use('/products', productRoutes);


//      ORDERS ROUTE
const ordersRoutes = require('./api/routes/orders');
app.use('/orders', ordersRoutes);

//      USER ROUTE
const userRoutes = require('./api/routes/user');
app.use('/user', userRoutes);

//  CUSTOM ERROR HANDLING
app.use((req, res, next) => {
    const error = new Error('404 Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;