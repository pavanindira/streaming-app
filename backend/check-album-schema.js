const { Sequelize } = require('sequelize');
const config = require('./config/config')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function checkAlbumSchema() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        // 1. List Columns
        const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Albums';
    `);
        console.log('Columns in "Albums" table:', results.map(r => r.column_name));

        // 2. Try simple select
        try {
            await sequelize.query('SELECT * FROM "Albums" LIMIT 1');
            console.log('Select query successful.');
        } catch (e) {
            console.log('Select query failed:', e.message);
        }

        process.exit(0);

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkAlbumSchema();
