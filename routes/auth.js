var jwt    = require('express-jwt');
var secret = require('../config').JWT_SECRET;

// Settings for express-jwt checks at API endpoints
function getTokenFromHeader(req){
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token' ||
      req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

/* 
Express-JWT will use to check token against private secret

auth.optional's creditionalsRequired=false allows us to identify users, 
and still provide access to unregistered users 
*/ 

var auth = {
  required: jwt({
    secret: secret,
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: secret,
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
};

module.exports = auth;
