'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add is_featured to Songs
    await queryInterface.addColumn('Songs', 'is_featured', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    // Add is_featured to Albums
    await queryInterface.addColumn('Albums', 'is_featured', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Songs', 'is_featured');
    await queryInterface.removeColumn('Albums', 'is_featured');
  }
};
