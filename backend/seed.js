const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./models');
const { User, Album, Song } = db;

const seed = async () => {
    try {
        console.log('Connecting to database:', process.env.DB_NAME, 'at', process.env.DB_HOST);
        await db.sequelize.authenticate();
        console.log('Authentication successful.');

        await db.sequelize.sync({ force: true }); // Wipe and recreate
        console.log('Database synced (Forced).');

        // 1. Create Artist
        const [artist, created] = await User.findOrCreate({
            where: { email: 'theweeknd@music.com' },
            defaults: {
                username: 'TheWeeknd',
                name: 'The Weeknd',
                password_hash: '$2b$10$EpOddzIg.Zc6yq.A2gQ.O.a/0/0/0/0', // dummy hash
                role: 'artist',
                email: 'theweeknd@music.com',
                profile_picture_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'
            }
        });

        console.log(`Artist ${created ? 'created' : 'found'}: ${artist.name}`);

        if (!artist || !artist.id) {
            throw new Error('Artist ID not found');
        }

        // 2. Create Album
        const [album] = await Album.findOrCreate({
            where: { title: 'Dawn FM' },
            defaults: {
                title: 'Dawn FM',
                artist_id: artist.id,
                release_date: new Date(),
                cover_image_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'
            }
        });

        if (!album || !album.id) {
            throw new Error('Album ID not found');
        }

        console.log(`Album created/found: ${album.title} (ID: ${album.id})`);

        // 3. Create Songs
        const songsData = [
            {
                title: 'Gasoline',
                duration: 240,
                file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                cover_image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
                genre: 'Synth-pop',
                lyrics: "It's 5 AM, I'm nihilist\nI know there's nothing after this\nObsessing over aftermaths\nApocalypse and hopelessness\n\nGasoline..."
            },
            {
                title: 'Take My Breath',
                duration: 210,
                file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                cover_image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
                genre: 'Disco',
                lyrics: "Take my breath away\nAnd make it last forever, babe\nDo it now or never, babe\nTake my breath away\nNobody does it better, babe..."
            },
            {
                title: 'Sacrifice',
                duration: 190,
                file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                cover_image_url: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9',
                genre: 'Funk',
                lyrics: "I refrained, I refrained\nI refrain-ained-ained-ained\nI refrain-ained-ained-ained\nI refrain-ained-ained-ained\nI refrain-ained-ained-ained"
            },
        ];

        for (const songData of songsData) {
            console.log(`Creating song: ${songData.title} for Artist: ${artist.id}, Album: ${album.id}`);
            try {
                await Song.create({
                    ...songData,
                    artist_id: artist.id,
                    album_id: album.id
                });
            } catch (e) {
                // If duplicate, ignore or update
                console.log(`Song ${songData.title} already exists or error:`, e.message);
            }
        }

        console.log('Songs seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:');
        console.error(error.message);
        if (error.original) console.error('Original Error:', error.original.message);
        if (error.errors) error.errors.forEach(e => console.error(`Validation Error: ${e.message}`));
        process.exit(1);
    }
};

seed();
