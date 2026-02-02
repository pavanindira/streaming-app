const { Sequelize } = require('sequelize');
const config = require('./config/config')['development'];
const { Label } = require('./models');

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: console.log
});

const labels = [
    { name: 'Pop', color: '#ec4899' }, // Pink
    { name: 'Rock', color: '#ef4444' }, // Red
    { name: 'Hip Hop', color: '#eab308' }, // Yellow
    { name: 'Jazz', color: '#3b82f6' }, // Blue
    { name: 'Electronic', color: '#8b5cf6' }, // Purple
    { name: 'Classical', color: '#10b981' }, // Green
    { name: 'R&B', color: '#f97316' }, // Orange
    { name: 'Country', color: '#78716c' }, // Stone
];

async function seedLabels() {
    try {
        // Need to initialize models first or manually insert
        // Since we are running outside of app, simplistic model init might fail if associations depend on other models not loaded.
        // Easier to use raw query for seeder, or load all models.

        await sequelize.authenticate();
        console.log('Connected.');

        for (const label of labels) {
            const [results] = await sequelize.query(`
            INSERT INTO "Labels" (name, color, created_at, updated_at)
            VALUES ('${label.name}', '${label.color}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (name) DO NOTHING;
        `);
            console.log(`Seeded: ${label.name}`);
        }

        console.log('Done seeding labels.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

seedLabels();
