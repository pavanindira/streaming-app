const { Sequelize } = require('sequelize');
const config = require('./config/config')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function listColumns() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Artists';
    `);

        console.log('Actual Columns:', results.map(r => r.column_name));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

listColumns();
