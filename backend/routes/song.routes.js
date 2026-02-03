const express = require('express');
const { body, param, query } = require('express-validator');
const songController = require('../controllers/song.controller');
const validateRequest = require('../middleware/validateRequest');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Create a new song
router.post(
  '/',
  authMiddleware, // Allowed for Artists (checked in controller or by role logic helper if stricter needed)
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'cover_image', maxCount: 1 }]),
  [
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('artist_id').optional({ checkFalsy: true }).isInt().withMessage('Artist ID must be an integer'),
    body('duration').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('album_id').optional({ checkFalsy: true }).isInt().withMessage('Album ID must be an integer'),
    // New Metadata Fields
    body('isrc').optional({ checkFalsy: true }).isString().isLength({ max: 50 }),
    body('track_number').optional({ checkFalsy: true }).isInt({ min: 1 }),
    body('disc_number').optional({ checkFalsy: true }).isInt({ min: 1 }),
    body('explicit').optional().toBoolean(),
    body('composer').optional({ checkFalsy: true }).isString().isLength({ max: 255 }),
    body('producer').optional({ checkFalsy: true }).isString().isLength({ max: 255 }),
    body('label').optional({ checkFalsy: true }).isString().isLength({ max: 255 }),
    body('singer').optional({ checkFalsy: true }).isString().isLength({ max: 255 }),
    body('lyricist').optional({ checkFalsy: true }).isString().isLength({ max: 255 }),
    body('lyrics').optional().isString(),
  ],
  validateRequest,
  songController.create
);

// Get User Feed (Authenticated)
// Must be before GET /:id or GET / to avoid collision if they use regex, but /feed is specific so it's safer above generic ID routes
router.get('/feed', authMiddleware, songController.getFeed);

// Get unique genres
router.get('/genres', songController.getGenres);

// Get all songs
router.get(
  '/',
  [
    query('albumId').optional().isInt().withMessage('Album ID must be an integer'),
    query('artistId').optional().isInt().withMessage('Artist ID must be an integer'),
    query('genre').optional().isString().withMessage('Genre must be a string'),
  ],
  validateRequest,
  songController.findAll
);

// Get a song by ID
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  songController.findOne
);

// Update a song by ID
router.put(
  '/:id',
  authMiddleware,
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'cover_image', maxCount: 1 }]),
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('title').optional().isString().withMessage('Title must be a string'),
    body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('file_url').optional().isURL().withMessage('File URL must be a valid URL'),
    body('albumId').optional().isInt().withMessage('Album ID must be an integer'),
    // New Metadata Fields
    body('isrc').optional().isString(),
    body('track_number').optional().isInt(),
    body('disc_number').optional().isInt(),
    body('explicit').optional().toBoolean(),
    body('composer').optional().isString(),
    body('producer').optional().isString(),
    body('label').optional().isString(),
    body('singer').optional().isString(),
    body('lyricist').optional().isString(),
    body('lyrics').optional().isString(),
  ],
  validateRequest,
  songController.update
);

// Delete a song by ID
router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  authMiddleware, // Authenticated users (ownership check in controller)
  validateRequest,
  songController.delete
);

// Like a song
router.post('/:id/like', authMiddleware, songController.like);

// Unlike a song
router.delete('/:id/like', authMiddleware, songController.unlike);

module.exports = router;