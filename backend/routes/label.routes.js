const express = require('express');
const { body, param } = require('express-validator');
const labelController = require('../controllers/label.controller');
const validateRequest = require('../middleware/validateRequest');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Public: Get all labels
router.get('/', labelController.findAll);

// Admin: Create Label
router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    [
        body('name').isString().notEmpty().withMessage('Name is required'),
        body('color').optional().isString(),
    ],
    validateRequest,
    labelController.create
);

// Admin: Update Label
router.put(
    '/:id',
    authMiddleware,
    adminMiddleware,
    [
        param('id').isInt().withMessage('ID must be an integer'),
        body('name').optional().isString().notEmpty().withMessage('Name cannot be empty'),
        body('color').optional().isString(),
    ],
    validateRequest,
    labelController.update
);

// Admin: Delete Label
router.delete(
    '/:id',
    authMiddleware,
    adminMiddleware,
    [param('id').isInt().withMessage('ID must be an integer')],
    validateRequest,
    labelController.delete
);

module.exports = router;
