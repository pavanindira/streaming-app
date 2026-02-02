const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { body } = require('express-validator');

// Create comment
router.post(
    '/',
    authMiddleware,
    [
        body('content').notEmpty().withMessage('Content is required'),
        body('songId').optional().isInt(),
        body('albumId').optional().isInt()
    ],
    validateRequest,
    commentController.create
);

// Get comments (public or auth? Public usually)
// router.get('/', commentController.getByResource);
// Let's allow public read (authenticated or not doesn't matter much for read, usually public)
router.get('/', commentController.getByResource);

// Delete
router.delete('/:id', authMiddleware, commentController.delete);

module.exports = router;
