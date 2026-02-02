const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./models');
const { User, Song, ListeningHistory, sequelize } = db;
const bcrypt = require('bcrypt');

const seedActivity = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Authentication successful.');
        await db.sequelize.sync({ alter: true });
        console.log('Database synced.');

        // 1. Create Users if they don't exist
        const passwordHash = await bcrypt.hash('password123', 10);

        const [pavan] = await User.findOrCreate({
            where: { email: 'pavan@example.com' },
            defaults: {
                username: 'pavan',
                name: 'Pavan',
                email: 'pavan@example.com',
                password_hash: passwordHash,
                role: 'user',
                profile_picture_url: 'https://ui-avatars.com/api/?name=Pavan&background=random'
            }
        });
        console.log('User Pavan ready:', pavan.id);

        const [alice] = await User.findOrCreate({
            where: { email: 'alice@example.com' },
            defaults: {
                username: 'alice',
                name: 'Alice Wonderland',
                email: 'alice@example.com',
                password_hash: passwordHash,
                role: 'artist', // or artist
                profile_picture_url: 'https://ui-avatars.com/api/?name=Alice&background=random'
            }
        });
        if (alice.role !== 'artist') {
            await alice.update({ role: 'artist' });
        }
        console.log('User Alice ready:', alice.id, alice.role);

        const [bob] = await User.findOrCreate({
            where: { email: 'bob@example.com' },
            defaults: {
                username: 'bob',
                name: 'Bob Builder',
                email: 'bob@example.com',
                password_hash: passwordHash,
                role: 'user',
                profile_picture_url: 'https://ui-avatars.com/api/?name=Bob&background=random'
            }
        });
        console.log('User Bob ready:', bob.id);

        // 2. Follows
        // Pavan follows Alice and Bob
        // Check if follow exists
        // Sequelize ManyToMany add method
        await pavan.addFollowing(alice);
        await pavan.addFollowing(bob);
        console.log('Pavan follows Alice and Bob.');

        // 3. Songs (Ensure at least one exists)
        let song = await Song.findOne();
        if (!song) {
            console.log('No songs found. Creating a dummy song.');
            song = await Song.create({
                title: 'Activity Song',
                duration: 200,
                artist_id: alice.id, // Alice is artist too?
                file_url: 'http://example.com/song.mp3',
                cover_image_url: 'https://placehold.co/300',
                genre: 'Test'
            });
        }
        console.log('Using song:', song.title);

        // 4. Activity
        // Alice listens to Song
        await ListeningHistory.create({
            user_id: alice.id,
            song_id: song.id,
            played_at: new Date()
        });
        console.log('Alice played a song.');

        // Bob listens to Song (5 mins ago)
        await ListeningHistory.create({
            user_id: bob.id,
            song_id: song.id,
            played_at: new Date(Date.now() - 5 * 60000)
        });
        console.log('Bob played a song 5m ago.');

        console.log('Activity Seeded! Login as pavan@example.com / password123 to see activity.');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding activity:', error);
        process.exit(1);
    }
};

seedActivity();
