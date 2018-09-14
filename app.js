var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config');
var cors = require('cors');

var app = express();

const PRODUCTION = app.get('env') === 'production';

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// force https if not development
if (PRODUCTION) {
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
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
  // set locals, only providing error stack in development
  res.locals.message = err.message;
  res.locals.error = PRODUCTION ? {} : err.stack;

  // return the error
  res.status(err.status || 500);
  res.json({'errors': {
    message: res.locals.message,
    error: res.locals.error
  }});
});

module.exports = app;
