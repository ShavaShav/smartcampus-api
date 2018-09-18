var router   = require('express').Router();
var passport = require('passport');
var auth     = require('../auth');
var models   = require('../../models');

// GET /user
// Return current user
router.get('/', auth.required, function(req, res, next) {
  models.User.find({
    where: {
       id: req.user.id
    }
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
  // Validate email and password input
  if(!req.body.user.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
    // didn't pass authentication (bad password/email)
    if(err){ return next(err); }

    // authentication passed, return the user (token rep)
    if(user){
      return res.json({user: user.authJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

// POST /user/register
// Register new user
router.post('/register', function(req, res, next){
  // Validate email, username, and password input
  if(!req.body.user.username){
    return res.status(422).json({errors: {username: "can't be blank"}});
  }

  if(!req.body.user.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  models.User.create({
    username: req.body.user.username,
    email: req.body.user.email,
  }).then(user => {
    // User created, can now set password
    user.setPassword(req.body.user.password);
    return user.save();
  }).then(function(user){
    // Return the user (token rep)
    return res.json({user: user.authJSON()});
  }).catch(next);

});

module.exports = router;
