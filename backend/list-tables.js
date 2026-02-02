const { Sequelize } = require('sequelize');
const config = require('./config/config.js').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    logging: false // Turn off SQL logging to clean output
});

(async () => {
    try {
        await sequelize.authenticate();
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log('\n--- TABLES ---');
        tables.forEach(t => console.log(t));
        console.log('--------------\n');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
})();
