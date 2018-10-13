var router           = require('express').Router();
var {OAuth2Client}   = require('google-auth-library');
var auth             = require('../auth');
var User             = require('../../models').User;
var utils            = require('../../utils');

// GET /user
// Return current user
router.get('/', auth.required, function(req, res, next) {
  return User.findById(req.user.id)
    .then(user => {
      if (!user) {
        return res.status(401).json({errors: {message: "Unauthorized"}}); // JWT payload doesn't match a user
      }

      // Return the user (token rep)
      return res.json(utils.userAuthResponse(user));
    }).catch(next);
});

// POST /user/login
// Authenticate user
router.post('/login', function(req, res, next){

  // Validate google id token was passed
  if(!req.body.googleIdToken){
    return res.status(422).json({errors: {googleIdToken: "can't be blank"}});
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const client = new OAuth2Client(clientId);
  
  // Use google API to check token
  return client.verifyIdToken({
    idToken: req.body.googleIdToken,
    audience: clientId
  }).then(ticket => {
    // Parse the user payload from ticket
    const payload = ticket.getPayload();

    // Restrict users to uwindsor.ca
    if (payload['hd'] !== 'uwindsor.ca') {
      throw new Error("Must be a uwindsor.ca account"); 
    }

    // Form user json
    const now = new Date().toLocaleString();
    const userBody = {
      googleId: payload['sub'],
      name: payload['name'],
      firstName: payload['given_name'],
      lastName: payload['family_name'],
      locale: payload['locale'],
      email: payload['email'],
      picture: payload['picture'],
      createdAt: now,
      updatedAt: now
    }

    // Create/update user, return a JWT
    return User.first('googleId', userBody.googleId).then(user => {
      if (user) {
        // User exists, update attributes
        return user.update(userBody);
      } else {
        // First time, create user
        return User.create(userBody);
      }
    }).catch(err => {
      console.log(err);
    });
  }).then(user => {
    // Return the authentication response (contains token)
    return res.json(utils.userAuthResponse(user));
  }).catch(err => {
    // Auth error (either OAuth or uwindsor domain restriction)
    return res.status(401).json({errors: {message: err.message}});
  });
});

module.exports = router;
