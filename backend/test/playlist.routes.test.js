const request = require('supertest');
const app = require('../app');
const { User, Playlist } = require('../models');
const { expect } = require('chai');

describe('Playlist Interface', () => {
    let token;
    let userId;
    const testUser = {
        name: 'Playlist Tester',
        username: 'playlist_tester',
        email: 'playlist_tester_unique@example.com',
        password: 'password123'
    };

    before(async () => {
        console.log('Test Before Hook Starting');
        console.log('User Model:', !!User);
        console.log('Playlist Model:', !!Playlist);

        // Ensure DB is synced before cleaning
        if (User && User.sequelize) {
            await User.sequelize.sync();
        }

        // Cleanup existing test user/playlists
        if (Playlist) await Playlist.destroy({ where: {} }); // Be careful with this on a shared DB, but for local test it's fine
        if (User) await User.destroy({ where: { email: testUser.email }, force: true });

        // Register
        try {
            await request(app)
                .post('/api/users/register')
                .send(testUser);
        } catch (e) { console.log('Register error/ignored', e); }

        // Login to get token
        const loginRes = await request(app)
            .post('/api/users/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        if (loginRes.status !== 200) {
            console.error('Login failed:', loginRes.body);
        }

        token = loginRes.body.token;

        // Get User ID from login or by querying
        const user = await User.findOne({ where: { email: testUser.email } });
        userId = user.id;
    });

    after(async () => {
        // Optional cleanup
        await Playlist.destroy({ where: { user_id: userId } });
        await User.destroy({ where: { id: userId } });
    });

    it('should create a playlist successfully', async () => {
        const res = await request(app)
            .post('/api/playlists')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'My Vibe',
                description: 'Testing vibes',
                is_public: true
            });

        if (res.status !== 201) {
            console.error('Playlist Create Error:', JSON.stringify(res.body, null, 2));
        }

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('name', 'My Vibe');
        // Verify the foreign key serialization
        // Depending on the model serialization, it might be userId or user_id or neither if not returned
        // But we should check if it persists in DB correctly
        const saved = await Playlist.findOne({ where: { id: res.body.id } });
        expect(saved).to.not.be.null;
        expect(saved.user_id).to.equal(userId);
    });

    it('should get user playlists', async () => {
        const res = await request(app)
            .get('/api/playlists')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        const myPlaylist = res.body.find(p => p.name === 'My Vibe');
        expect(myPlaylist).to.exist;
    });

    it('should fail to create playlist without name', async () => {
        const res = await request(app)
            .post('/api/playlists')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'No Name'
            });
        // Assuming validation is in place, either 400 or 500 if Sequelize error catches it
        // Model says name: { allowNull: false }
        expect(res.status).to.not.equal(201);
    });
});
