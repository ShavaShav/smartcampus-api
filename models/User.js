'use strict';

var crypto = require('crypto');
var jwt    = require('jsonwebtoken');
var secret = require('../config').JWT_SECRET;

module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    email: DataTypes.STRING,
    firstName: DataTypes.STRING,
    googleId: DataTypes.STRING,
    lastName: DataTypes.STRING,
    locale: DataTypes.STRING,
    name: DataTypes.STRING, // Usually, not always, firstname lastname
    picture: DataTypes.STRING
  }, {
    freezeTableName: true,
    tableName: 'Users',
    timestamps: true
  });

  // Events are tied to Users
  User.associate = function(models) {
    User.hasMany(models.Event, {onDelete: 'cascade', foreignKey: 'authorId'});
  };

  // Returns a fresh JSON webtoken for user
  User.prototype.generateJWT = function() {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60); // expire in 60 days

    return jwt.sign({
      id: this.id,
      exp: parseInt(exp.getTime() / 1000),
    }, secret);
  };

  // Response during authentication (registration/login)
  User.prototype.authJSON = function(){
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      picture: this.picture,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      token: this.generateJWT()
    };
  };

  // User details to expose (even without auth)
  User.prototype.toJSON = function(){
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      picture: this.picture,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  };

  return User;
};