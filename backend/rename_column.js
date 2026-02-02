const { sequelize } = require('./models');

async function run() {
    try {
        console.log('Renaming column SongId to song_id in PlaylistSongs...');
        await sequelize.query('ALTER TABLE "PlaylistSongs" RENAME COLUMN "SongId" TO "song_id";');
        console.log('Column renamed successfully.');
    } catch (error) {
        console.error('Error renaming column:', error);
    } finally {
        await sequelize.close();
    }
}

run();
