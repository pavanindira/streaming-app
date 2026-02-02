const { Sequelize } = require('sequelize');
const config = require('./config/config')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function verify() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name IN ('Labels', 'SongLabels');
    `);
        console.log('Tables found:', results.map(r => r.table_name));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

verify();
