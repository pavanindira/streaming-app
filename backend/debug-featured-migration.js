const { Sequelize } = require('sequelize');
const config = require('./config/config')['development'];
const migration = require('./migrations/20260131171854-add-is-featured-to-songs-and-albums');

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: console.log
});

async function runMigration() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');
        const queryInterface = sequelize.getQueryInterface();

        console.log('Running UP migration for is_featured...');
        await migration.up(queryInterface, Sequelize);
        console.log('Migration Success: is_featured added.');
    } catch (err) {
        console.error('Migration Failed:', err);
        console.error('Original Error:', err.original);
    } finally {
        process.exit();
    }
}

runMigration();
