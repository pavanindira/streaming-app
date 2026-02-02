const { sequelize } = require('./models');

async function inspect() {
    try {
        const fs = require('fs');
        const tableInfo = await sequelize.getQueryInterface().describeTable('PlaylistSongs');
        fs.writeFileSync('db_schema.json', JSON.stringify(tableInfo, null, 2));
        console.log('Schema written to db_schema.json');
    } catch (error) {
        console.error('Error describing table:', error);
    } finally {
        await sequelize.close();
    }
}

inspect();
