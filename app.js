const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Set View Engine to EJS
app.set('view engine', 'ejs');

//  connect to database
require('./db/db_config');

//  ENABLE LOGGING
app.use(morgan('dev'));
//  ENABLE BODY PARSING
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({}));

app.use(express.static('uploads'));
//  ENABLE CORS ACCESS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
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

const indexRoutes = require('./api/routes/index');
app.use('/', indexRoutes);

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
