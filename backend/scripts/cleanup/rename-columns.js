const { Sequelize } = require('sequelize');
const config = require('./config/config')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: console.log
});

async function fixColumns() {
    try {
        await sequelize.authenticate();
        const queryInterface = sequelize.getQueryInterface();

        console.log('Renaming createdAt to created_at...');
        try {
            await queryInterface.renameColumn('Artists', 'createdAt', 'created_at');
        } catch (e) { console.log('Rename createdAt failed (maybe already renamed):', e.message); }

        console.log('Renaming updatedAt to updated_at...');
        try {
            await queryInterface.renameColumn('Artists', 'updatedAt', 'updated_at');
        } catch (e) { console.log('Rename updatedAt failed (maybe already renamed):', e.message); }

        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixColumns();
