const { Sequelize } = require('sequelize');
const config = require('./config/config')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function checkSchema() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const queryInterface = sequelize.getQueryInterface();

        const tableExists = await queryInterface.tableExists('Artists');
        console.log(`Table 'Artists' exists: ${tableExists}`);

        if (tableExists) {
            const columns = await queryInterface.describeTable('Artists');
            console.log('Columns in Artists table:', Object.keys(columns));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkSchema();
