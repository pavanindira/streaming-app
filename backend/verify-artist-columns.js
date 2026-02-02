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
        console.log('Connected to DB:', config.database);

        // 1. Check if table exists (raw)
        const [results] = await sequelize.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Artists';`);
        console.log('Columns in "Artists" table (from information_schema):');
        console.table(results);

        // 2. Try selecting bio
        try {
            await sequelize.query('SELECT bio FROM "Artists" LIMIT 1');
            console.log('Successfully selected "bio" column.');
        } catch (e) {
            console.error('Failed to select "bio":', e.message);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

verify();
