'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    hash: DataTypes.STRING,
    salt: DataTypes.STRING
  }, {
    freezeTableName: true,
    tableName: 'users',
    timestamps: true
  });

  User.associate = function(models) {
    // associations can be defined here
  };

  // Calculates and sets salt and hash using PBKDF2, given plaintext password
  User.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  };

  // Checks plaintext password against hash, returns boolean
  User.isValidPassword = function(password) {
   var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
   return this.hash === hash;
  };

  // Returns a fresh JSON webtoken for user
  User.generateJWT = function() {
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
  User.toJSON = function(){
    return {
      username: this.username,
      email: this.email,
      token: this.generateJWT()
    };
  };
  
  return User;
};