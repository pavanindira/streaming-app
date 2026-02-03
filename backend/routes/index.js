const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const artistRoutes = require('./artist.routes');
const albumRoutes = require('./album.routes');
const songRoutes = require('./song.routes');
const playlistRoutes = require('./playlist.routes');

// Register routes
router.use('/users', userRoutes); // Regular users
router.use('/artists', artistRoutes); // Artists
router.use('/albums', albumRoutes);
router.use('/songs', songRoutes);
router.use('/playlists', playlistRoutes);
router.use('/comments', require('./comment.routes'));
router.use('/proxy', require('./proxy.routes'));
router.use('/audiobooks', require('./audiobook.routes')); // [NEW] Register audiobooks

module.exports = router;