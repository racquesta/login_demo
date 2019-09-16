'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        userName: 'testUser1',
        email: 'testUser1@login.com',
        password: bcrypt.hashSync('password', bcrypt.genSaltSync(10)),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete(
      'Users',
      {
        userName: 'testUser1',
        email: 'testUser1@login.com'
      },
      {}
    );
  }
};
