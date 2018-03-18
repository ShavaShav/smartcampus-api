var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').JWT_SECRET;

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: [true, "required"],
    match: [/^[a-zA-Z0-9]+$/, 'is invalid'], 
    index: true
  },
  email: {
    type: String,
    unique: true,
    required: [true, "required"],
    match: [/\S+@\S+\.\S+/, 'is invalid'], 
    index: true
  },
  hash: String,
  salt: String
}, {timestamps: true});

// Use mongoose-unique-validator to check "unique" fields and return appropriate error messages
UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

// Calculates and sets salt and hash using PBKDF2, given plaintext password
UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

// Checks plaintext password against hash, returns boolean
UserSchema.methods.isValidPassword = function(password) {
 var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
 return this.hash === hash;
};

// Returns a fresh JSON webtoken for user
UserSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60); // expire in 60 days

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

// Response during authentication (registration/login)
UserSchema.methods.toJSON = function(){
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT()
  };
};

mongoose.model('User', UserSchema);
