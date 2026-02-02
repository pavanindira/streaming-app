'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Create Artists table
        await queryInterface.createTable('Artists', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            bio: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            image_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 2. Data Cleanup: Set artist_id to NULL in Albums and Songs using bulkUpdate (safe in transaction)
        try {
            await queryInterface.bulkUpdate('Albums', { artist_id: null }, { artist_id: { [Sequelize.Op.ne]: null } });
            await queryInterface.bulkUpdate('Songs', { artist_id: null }, { artist_id: { [Sequelize.Op.ne]: null } });
        } catch (e) {
            console.log('Error updating artist_id, possibly table does not exist or column missing:', e.message);
        }

        // 3. Remove old foreign key constraints if they exist (best effort)
        try {
            await queryInterface.removeConstraint('Albums', 'Albums_artist_id_fkey');
            await queryInterface.removeConstraint('Songs', 'Songs_artist_id_fkey');
        } catch (e) {
            console.log('Old constraints not found or could not be removed:', e.message);
        }

        // 4. Add new Foreign Key constraints referencing Artists table

        // Update Albums
        await queryInterface.addConstraint('Albums', {
            fields: ['artist_id'],
            type: 'foreign key',
            name: 'fk_albums_artist_id_artists',
            references: {
                table: 'Artists',
                field: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        // Update Songs
        await queryInterface.addConstraint('Songs', {
            fields: ['artist_id'],
            type: 'foreign key',
            name: 'fk_songs_artist_id_artists',
            references: {
                table: 'Artists',
                field: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove constraints
        await queryInterface.removeConstraint('Songs', 'fk_songs_artist_id_artists');
        await queryInterface.removeConstraint('Albums', 'fk_albums_artist_id_artists');
        // Drop Artists table
        await queryInterface.dropTable('Artists');
    }
};
