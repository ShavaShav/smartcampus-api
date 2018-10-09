'use strict';

module.exports = {
  // Adds user data from Google profiles. Some may be unnecessary now,
  // but may be helpful later (referring to user by last name in emails for example).
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn(
        'Users', 
        'username', 
        'name'
      ),
      queryInterface.removeColumn(
        'Users',
        'hash'
      ),
      queryInterface.removeColumn(
        'Users',
        'salt'
      ),
      queryInterface.addColumn(
        'Users',
        'firstName',
        Sequelize.STRING
      ),
      queryInterface.addColumn(
        'Users',
        'lastName',
        Sequelize.STRING
      ),
      queryInterface.addColumn(
        'Users',
        'picture',
        Sequelize.STRING
      ),      
      queryInterface.addColumn(
        'Users',
        'locale',
        Sequelize.STRING
      ),
      queryInterface.addColumn(
        'Users',
        'googleId',
        Sequelize.STRING
      )
    ]);
  },

  // reverses google user migration
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn(
        'Users', 
        'name', 
        'username'
      ),
      queryInterface.addColumn(
        'Users',
        'hash',
        Sequelize.STRING
      ),
      queryInterface.addColumn(
        'Users',
        'salt',
        Sequelize.STRING
      ),
      queryInterface.removeColumn(
        'Users',
        'firstName'
      ),
      queryInterface.removeColumn(
        'Users',
        'lastName'
      ),
      queryInterface.removeColumn(
        'Users',
        'picture'
      ),      
      queryInterface.removeColumn(
        'Users',
        'locale'
      ),
      queryInterface.removeColumn(
        'Users',
        'googleId'
      )
    ]);
  }
};
