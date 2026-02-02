const express = require('express');
const { body, param, query } = require('express-validator');
const audiobookController = require('../controllers/audiobook.controller');
const validateRequest = require('../middleware/validateRequest');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
console.log(audiobookController);

// Create a new audiobook
router.post(
  '/',
  [
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('author').isString().notEmpty().withMessage('Author is required'),
    body('narrator').optional().isString().withMessage('Narrator must be a string'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('file_url').isURL().withMessage('File URL must be a valid URL'),
    body('cover_image_url').optional().isURL().withMessage('Cover image URL must be a valid URL'),
    body('release_date').optional().isISO8601().withMessage('Release date must be a valid date'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('category_id').isInt().withMessage('Category ID must be an integer'),
  ],
  validateRequest,
  audiobookController.create // Use the correct method name
);

// Get all audiobooks
router.get(
  '/',
  [
    query('category_id').optional().isInt().withMessage('Category ID must be an integer'),
    query('author').optional().isString().withMessage('Author must be a string'),
  ],
  validateRequest,
  validateRequest,
  audiobookController.findAll // Use the correct method name
);

// Get progress for an audiobook
router.get(
  '/:id/progress',
  [param('id').isInt().withMessage('ID must be an integer')],
  authMiddleware,
  validateRequest,
  audiobookController.getProgress
);

// Save progress for an audiobook
router.post(
  '/:id/progress',
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('progress_seconds').isInt({ min: 0 }).withMessage('Progress must be a non-negative integer'),
    body('is_completed').optional().isBoolean().withMessage('is_completed must be a boolean')
  ],
  authMiddleware,
  validateRequest,
  audiobookController.saveProgress
);

// Update an audiobook by ID
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('title').optional().isString().notEmpty().withMessage('Title must be a string'),
    body('author').optional().isString().notEmpty().withMessage('Author must be a string'),
    body('narrator').optional().isString().withMessage('Narrator must be a string'),
    body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('file_url').optional().isURL().withMessage('File URL must be a valid URL'),
    body('cover_image_url').optional().isURL().withMessage('Cover image URL must be a valid URL'),
    body('release_date').optional().isISO8601().withMessage('Release date must be a valid date'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('category_id').optional().isInt().withMessage('Category ID must be an integer'),
  ],
  validateRequest,
  audiobookController.updateAudiobook // Ensure this method is defined and imported correctly
);

// Delete an audiobook by ID
router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  audiobookController.deleteAudiobook // Ensure this method is defined and imported correctly
);

module.exports = router;