const express = require('express');
const { body, param } = require('express-validator');
const artistController = require('../controllers/artist.controller');
const validateRequest = require('../middleware/validateRequest');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public: Get all artists
router.get('/', artistController.findAll);

// Public: Get artist by ID
router.get('/:id', artistController.findOne);

// Public: Get artist stats
router.get('/:id/stats', artistController.getStats);


// Admin: Create Artist
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('bio').optional().isString(),
  ],
  validateRequest,
  artistController.create
);

// Admin: Update Artist
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('name').optional().isString().notEmpty(),
    body('bio').optional().isString(),
  ],
  validateRequest,
  artistController.update
);

// Admin: Delete Artist
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  artistController.delete
);

module.exports = router;