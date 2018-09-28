var router           = require('express').Router();
var {OAuth2Client}   = require('google-auth-library');
var auth             = require('../auth');
var models           = require('../../models');
var GOOGLE_CLIENT_ID = require('../../config').GOOGLE_CLIENT_ID;

// GET /user
// Return current user
router.get('/', auth.required, function(req, res, next) {
  models.User.find({
    where: { id: req.user.id }
  }).then(function(user) {
    if (!user) {
      return res.status(401).json({errors: {message: "Unauthorized"}}); // JWT payload doesn't match a user
    }
    // Return the user (token rep)
    return res.json({user: user.authJSON()});
  }).catch(next);
});

// POST /user/login
// Authenticate user
router.post('/login', function(req, res, next){

  // Validate google id token was passed
  if(!req.body.googleIdToken){
    return res.status(422).json({errors: {googleIdToken: "can't be blank"}});
  }

  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  
  // Use google API to check token
  return client.verifyIdToken({
    idToken: req.body.googleIdToken,
    audience: GOOGLE_CLIENT_ID
  }).then(ticket => {
    // Parse the user payload from ticket
    const payload = ticket.getPayload();

    // Restrict users to uwindsor.ca
    if (payload['hd'] !== 'uwindsor.ca') {
      throw new Error("Must be a uwindsor.ca account"); 
    }

    // Form user json
    const userBody = {
      googleId: payload['sub'],
      name: payload['name'],
      firstName: payload['given_name'],
      lastName: payload['family_name'],
      locale: payload['locale'],
      email: payload['email'],
      picture: payload['picture']
    }

    // Create/update user, return it.
    return models.User.find({ 
      where: { googleId: userBody.googleId } 
    }).then(user => {
      if (user) {
        // User exists, update attributes
        return user.updateAttributes(userBody);
      } else {
        // First time, create user
        return models.User.create(userBody);
      }
    });
  }).then(user => {
    // Success. Return user in json form
    return res.json({user: user.authJSON()});
  }).catch(err => {
    // Auth error (either OAuth or uwindsor domain restriction)
    return res.status(401).json({errors: {message: err.message}});
  });
});

module.exports = router;
