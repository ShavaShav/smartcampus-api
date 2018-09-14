var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var models  = require('../models');

// Passport will use email and password to check user
passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]'
}, function(email, password, done) {
  // Find user in database, check against password
  models.User.find({
      where: { email: email }
    }).then(function(user) {
      if(!user) {
        return done(null, false, {errors: {'email': 'doesn\'t exist'}});
      }
      else if (!user.isValidPassword(password)){
        return done(null, false, {errors: {'password': 'is invalid'}});
      }

      return done(null, user);
    }).catch(done);
}));