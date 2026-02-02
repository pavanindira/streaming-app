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
        const [songsCols] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Songs' AND column_name = 'is_featured';
    `);
        const [albumsCols] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Albums' AND column_name = 'is_featured';
    `);
        console.log('Songs is_featured:', songsCols.length > 0);
        console.log('Albums is_featured:', albumsCols.length > 0);

        // If not exists, try to add manually
        if (songsCols.length === 0) {
            console.log('Adding is_featured to Songs manually...');
            await sequelize.query(`ALTER TABLE "Songs" ADD COLUMN "is_featured" BOOLEAN DEFAULT false;`);
        }
        if (albumsCols.length === 0) {
            console.log('Adding is_featured to Albums manually...');
            await sequelize.query(`ALTER TABLE "Albums" ADD COLUMN "is_featured" BOOLEAN DEFAULT false;`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

verify();
