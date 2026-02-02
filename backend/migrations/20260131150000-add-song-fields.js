'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Songs', 'singer', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn('Songs', 'lyricist', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Songs', 'singer');
        await queryInterface.removeColumn('Songs', 'lyricist');
    },
};
