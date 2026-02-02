require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../models');
db.sequelize.options.logging = false;
const { User, Album, Song } = db;
const fs = require('fs');

async function verifyAlbumManagement() {
    try {
        console.log('--- Verifying Album Management ---');

        // 1. Get User (Artist)
        const user = await User.findOne({ where: { role: 'artist' } });
        if (!user) {
            console.error('No artist found. Please seed the database.');
            process.exit(1);
        }
        console.log(`Testing with User ID: ${user.id} (${user.username})`);

        // 2. Create Album
        console.log('--- Creating Album ---');
        const albumTitle = 'Test Album ' + Date.now();
        let album = await Album.create({
            title: albumTitle,
            artist_id: user.id,
            release_date: new Date(),
            album_type: 'Album'
        });
        console.log(`Album Created: ${album.id} - ${album.title}`);

        // 3. Create Song linked to Album
        console.log('--- Uploading Song to Album ---');
        const songTitle = 'Album Track 1';
        let song = await Song.create({
            title: songTitle,
            artist_id: user.id,
            album_id: album.id,
            duration: 180,
            file_url: 'http://example.com/track.mp3'
        });
        console.log(`Song Created: ${song.id} linked to Album: ${song.album_id}`);

        // 4. Verify Association
        console.log('--- Verifying Association ---');
        const fetchedAlbum = await Album.findByPk(album.id, {
            include: [{ model: Song, as: 'songs' }]
        });

        if (fetchedAlbum && fetchedAlbum.songs.length > 0 && fetchedAlbum.songs[0].id === song.id) {
            console.log('SUCCESS: Song is correctly associated with Album.');
        } else {
            console.error('FAILURE: Song not found in Album.');
        }

        // Cleanup
        console.log('--- Cleanup ---');
        await song.destroy();
        await album.destroy();
        console.log('Cleanup complete.');

        process.exit(0);

    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    }
}

verifyAlbumManagement();
