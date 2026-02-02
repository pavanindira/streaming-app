const express = require('express');
const { body, param } = require('express-validator');
const categoryController = require('../controllers/category.controller');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Create a new category
router.post(
  '/',
  [
    body('name').isString().notEmpty().withMessage('Category name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
  ],
  validateRequest,
  categoryController.create // Use the correct method name
);

// Get all categories
router.get('/', categoryController.findAll); // Use the correct method name

// Get a category by ID
router.get(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  categoryController.findOne // Use the correct method name
);

// Update a category by ID
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('name').optional().isString().notEmpty().withMessage('Category name must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
  ],
  validateRequest,
  categoryController.updateCategory
);

// Delete a category by ID
router.delete(
  '/:id',
  [param('id').isInt().withMessage('ID must be an integer')],
  validateRequest,
  categoryController.deleteCategory
);

module.exports = router;