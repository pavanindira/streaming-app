const { Sequelize } = require('sequelize');
const config = require('./config/config')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: console.log
});

async function addColumns() {
    try {
        await sequelize.authenticate();
        const queryInterface = sequelize.getQueryInterface();

        const tableDescription = await queryInterface.describeTable('Artists');

        if (!tableDescription.bio) {
            console.log('Adding bio column...');
            await queryInterface.addColumn('Artists', 'bio', {
                type: Sequelize.TEXT,
                allowNull: true
            });
        } else {
            console.log('bio column already exists.');
        }

        if (!tableDescription.image_url) {
            console.log('Adding image_url column...');
            await queryInterface.addColumn('Artists', 'image_url', {
                type: Sequelize.STRING,
                allowNull: true
            });
        } else {
            console.log('image_url column already exists.');
        }

        console.log('Done adding columns.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

addColumns();
