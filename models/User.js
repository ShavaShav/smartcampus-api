'use strict';

var crypto = require('crypto');
var jwt    = require('jsonwebtoken');
var secret = require('../config').JWT_SECRET;

module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    hash: DataTypes.STRING,
    salt: DataTypes.STRING
  }, {
    freezeTableName: true,
    tableName: 'Users',
    timestamps: true
  });

  // Events are tied to Users
  User.associate = function(models) {
    User.hasMany(models.Event, {onDelete: 'cascade', foreignKey: 'authorId'});
  };

  // Calculates and sets salt and hash using PBKDF2, given plaintext password
  User.prototype.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('hex');
  };

  // Checks plaintext password against hash, returns boolean
  User.prototype.isValidPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('hex');
    return this.hash === hash; 
  };

  // Returns a fresh JSON webtoken for user
  User.prototype.generateJWT = function() {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60); // expire in 60 days

    return jwt.sign({
      id: this.id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000),
    }, secret);
  };

  // Response during authentication (registration/login)
  User.prototype.authJSON = function(){
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      token: this.generateJWT()
    };
  };

  // User details to expose (even without auth)
  User.prototype.toJSON = function(){
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  };

  return User;
};