const { Sequelize } = require('sequelize');
const config = require('./config/config')['development'];
const migration = require('./migrations/20260131170525-create-labels-and-associations');

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: console.log
});

async function runMigration() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');
        const queryInterface = sequelize.getQueryInterface();

        console.log('Running UP migration...');
        await migration.up(queryInterface, Sequelize);
        console.log('Migration Success');
    } catch (err) {
        console.error('Migration Failed:', err);
        console.error('Original Error:', err.original);
    } finally {
        process.exit();
    }
}

runMigration();
