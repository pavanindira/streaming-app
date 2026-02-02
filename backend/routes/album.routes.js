const express = require('express');
const { body, param, query } = require('express-validator');
const albumController = require('../controllers/album.controller');
const auth = require('../middleware/authMiddleware'); // Correct import
const adminMiddleware = require('../middleware/adminMiddleware');
const validateRequest = require('../middleware/validateRequest');
const upload = require('../middleware/uploadMiddleware'); // Import upload middleware

const router = express.Router();

// Create a new album
// Create a new album
router.post(
  '/',
  auth, // Any authenticated user (artist check inside controller if needed, or restricted here)
  upload.single('cover_image'),
  [
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('release_date').optional().isISO8601(),
    body('album_type').optional().isIn(['Single', 'EP', 'Album', 'Compilation']),
  ],
  validateRequest,
  albumController.create
);

// Get all albums
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  ],
  validateRequest,
  albumController.findAll
);

// Get an album by ID
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  albumController.findOne
);

// Update an album by ID
router.put(
  '/:id',
  auth,
  upload.single('cover_image'),
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('title').optional().isString(),
  ],
  validateRequest,
  albumController.updateAlbum
);

// Delete an album by ID
router.delete(
  '/:id',
  auth,
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  albumController.deleteAlbum
);

module.exports = router;