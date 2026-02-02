const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlist.controller');
const authenticate = require('../middleware/authMiddleware'); // Updated to match file name

// Apply auth middleware to all playlist routes
router.use(authenticate);

router.post('/', playlistController.create);
router.get('/', playlistController.findAll);
router.get('/:id', playlistController.findOne);
router.put('/:id', playlistController.update);
router.delete('/:id', playlistController.delete);

// Song management
router.post('/:id/songs', playlistController.addSong);
router.delete('/:id/songs', playlistController.removeSong);


// Collaborator routes
router.post('/:id/collaborators', authenticate, playlistController.addCollaborator);
router.delete('/:id/collaborators/:userId', authenticate, playlistController.removeCollaborator);

module.exports = router;