var jwt    = require('express-jwt');

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
    secret: process.env.JWT_SECRET,
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: process.env.JWT_SECRET,
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
};

module.exports = auth;
