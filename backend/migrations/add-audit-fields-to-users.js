'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Users');

    // Add 'deleted_at' column if it doesn't exist
    if (!tableDescription.deleted_at) {
      await queryInterface.addColumn('Users', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    // Add 'last_login' column if it doesn't exist
    if (!tableDescription.last_login) {
      await queryInterface.addColumn('Users', 'last_login', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Users');

    // Remove 'deleted_at' column if it exists
    if (tableDescription.deleted_at) {
      await queryInterface.removeColumn('Users', 'deleted_at');
    }

    // Remove 'last_login' column if it exists
    if (tableDescription.last_login) {
      await queryInterface.removeColumn('Users', 'last_login');
    }
  },
};