'use strict';

var faker = require('faker');

module.exports = {
  up: (queryInterface, Sequelize) => {
    var users = [];
    for (var i = 0; i < 10; i++) {
      users[i] = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        hash: faker.random.number(),
        salt: faker.random.number()
      }
    }

    return queryInterface.bulkInsert('Users', users, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
