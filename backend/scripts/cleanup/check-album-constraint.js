require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Album, User } = require('./models');

async function testConstraint() {
    try {
        const user = await User.findOne();
        if (!user) { console.log('No user'); return; }

        console.log('Attempting to create album with User ID:', user.id);

        const album = await Album.create({
            title: 'Constraint Test',
            artist_id: user.id, // Using User ID
            release_date: new Date()
        });

        console.log('Album created successfully:', album.id);
        await album.destroy();
    } catch (e) {
        console.error('Creation failed:', e.message);
        if (e.parent) console.error('DB Error:', e.parent.message);
    }
}

testConstraint();
