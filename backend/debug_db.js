const db = require('./models');

async function debug() {
    try {
        let user = await db.User.findOne();
        if (!user) {
            console.log('Creating temp user...');
            user = await db.User.create({
                name: 'Debug User',
                email: 'debug_user_' + Date.now() + '@example.com',
                password_hash: 'password',
                role: 'user'
            });
        }
        console.log('Using User ID:', user.id);

        try {
            const p = await db.Playlist.create({
                name: 'Debug Playlist',
                user_id: user.id
            });
            console.log('SUCCESS: Created playlist:', p.toJSON());
        } catch (e) {
            console.error('FAILURE: Create error:', e);
        }

    } catch (err) {
        console.error('General error:', err);
    } finally {
        await db.sequelize.close();
    }
}

debug();
