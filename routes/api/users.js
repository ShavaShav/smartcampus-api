var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

// Return current user
router.get('/', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(!user) {
        return res.sendStatus(401); // JWT payload doesn't match a user
    }

    return res.json({user: user.toJSON()});
  }).catch(next);
});

// Authenticate user
router.post('/login', function(req, res, next){
  if(!req.body.user.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
  	// didn't pass authentication (bad password/email)
    if(err){ return next(err); }

    // authentication passed, assign JWT to mdoel and return User JSON
    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

// Register new user
router.post('/', function(req, res, next){
  if(!req.body.user.username){
    return res.status(422).json({errors: {username: "can't be blank"}});
  }

  if(!req.body.user.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  var user = new User();

  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);

  user.save().then(function(){
    return res.json({user: user.toJSON()});
  }).catch(next);
});

module.exports = router;
