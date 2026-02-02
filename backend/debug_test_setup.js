const { User, Playlist } = require('./models');

async function check() {
    try {
        console.log('Test Setup Debug Start');
        console.log('Destroying playlists...');
        await Playlist.destroy({ where: {} });
        console.log('Destroying users...');
        await User.destroy({ where: { email: 'playlist_tester_unique@example.com' } });
        console.log('Test Setup Debug SUCCESS');
    } catch (e) {
        console.error('Test Setup Debug FAILURE:', e);
    } finally {
        process.exit();
    }
}
check();
