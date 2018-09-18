var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var cors         = require('cors');
var express      = require('express');
var path         = require('path');
var logger       = require('morgan');
var config       = require('./config');

var app = express();

// Load middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

const PROD = app.get('env') === 'production';

if (PROD) {
  // force https in production
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });

  // Configure CORS preflight options
  app.options('*', cors({
    origin: true,
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin'],
    preflightContinue: false,
  }));
}

// load passport for authentication
require('./config/passport');

// load routes
app.use(require('./routes'));

// catch 404 (no route) and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// catch all formatter for error responses
app.use(function(err, req, res, next) {
  // set locals, only providing error stack in development/test
  res.locals.message = err.message;
  res.locals.error = PROD ? {} : err.stack;

  // return the error
  res.status(err.status || 500);
  res.json({'errors': {
    message: res.locals.message,
    error: res.locals.error
  }});
});

module.exports = app;
