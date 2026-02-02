const { Sequelize } = require('sequelize');
const config = require('./config/config')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: console.log
});

async function fixDatabase() {
    try {
        console.log('Starting Manual DB Fix...');
        await sequelize.authenticate();
        console.log('Connected.');

        const queryInterface = sequelize.getQueryInterface();

        // 1. Create Artists table if not exists
        console.log('Creating Artists table...');
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
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW')
            }
        });

        // 2. Nullify artist_id in Albums and Songs
        console.log('Nullifying invalid artist_ids...');
        await sequelize.query('UPDATE "Albums" SET "artist_id" = NULL');
        await sequelize.query('UPDATE "Songs" SET "artist_id" = NULL');

        // 3. Add Constraints
        console.log('Adding constraints...');
        try {
            await queryInterface.addConstraint('Albums', {
                fields: ['artist_id'],
                type: 'foreign key',
                name: 'fk_albums_artist_id_artists_manual',
                references: {
                    table: 'Artists',
                    field: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            });
        } catch (e) { console.log('Album constraint error (maybe exists):', e.message); }

        try {
            await queryInterface.addConstraint('Songs', {
                fields: ['artist_id'],
                type: 'foreign key',
                name: 'fk_songs_artist_id_artists_manual',
                references: {
                    table: 'Artists',
                    field: 'id'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            });
        } catch (e) { console.log('Song constraint error (maybe exists):', e.message); }

        console.log('Done.');
        process.exit(0);

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixDatabase();
