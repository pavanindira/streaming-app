'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add columns to Songs table
        // await queryInterface.addColumn('Songs', 'isrc', { type: Sequelize.STRING, allowNull: true });
        // await queryInterface.addColumn('Songs', 'track_number', { type: Sequelize.INTEGER, allowNull: true });
        // await queryInterface.addColumn('Songs', 'disc_number', { type: Sequelize.INTEGER, defaultValue: 1 });
        // await queryInterface.addColumn('Songs', 'explicit', { type: Sequelize.BOOLEAN, defaultValue: false });
        // await queryInterface.addColumn('Songs', 'composer', { type: Sequelize.STRING, allowNull: true });
        // await queryInterface.addColumn('Songs', 'producer', { type: Sequelize.STRING, allowNull: true });
        // Song-specific label (if different from album, or for singles)
        // await queryInterface.addColumn('Songs', 'label', { type: Sequelize.STRING, allowNull: true });

        // Add columns to Albums table
        await queryInterface.addColumn('Albums', 'upc', { type: Sequelize.STRING, allowNull: true });
        await queryInterface.addColumn('Albums', 'label', { type: Sequelize.STRING, allowNull: true });
        await queryInterface.addColumn('Albums', 'album_type', {
            type: Sequelize.ENUM('Single', 'EP', 'Album', 'Compilation'),
            defaultValue: 'Album'
        });
        await queryInterface.addColumn('Albums', 'copyright_text', { type: Sequelize.STRING, allowNull: true });
        await queryInterface.addColumn('Albums', 'total_tracks', { type: Sequelize.INTEGER, allowNull: true });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove columns from Songs table
        await queryInterface.removeColumn('Songs', 'isrc');
        await queryInterface.removeColumn('Songs', 'track_number');
        await queryInterface.removeColumn('Songs', 'disc_number');
        await queryInterface.removeColumn('Songs', 'explicit');
        await queryInterface.removeColumn('Songs', 'composer');
        await queryInterface.removeColumn('Songs', 'producer');
        await queryInterface.removeColumn('Songs', 'label');

        // Remove columns from Albums table
        await queryInterface.removeColumn('Albums', 'upc');
        await queryInterface.removeColumn('Albums', 'label');
        await queryInterface.removeColumn('Albums', 'album_type');
        await queryInterface.removeColumn('Albums', 'copyright_text');
        await queryInterface.removeColumn('Albums', 'total_tracks');
    },
};
