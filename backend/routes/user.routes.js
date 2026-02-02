const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login/register requests per windowMs
  message: 'Too many login attempts from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

// Register new user route
router.post(
  '/register',
  authLimiter,
  [
    body('name').isString().notEmpty().withMessage('Names is required'),
    body('username').isString().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  userController.register
);

// Login route
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  userController.login
);

// Get all users (Admin only)
router.get('/', authMiddleware, adminMiddleware, userController.findAll);

// Create new user (Admin only)
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('username').isString().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['listener', 'artist', 'admin']).withMessage('Invalid role'),
  ],
  userController.create
);

// Get the authenticated user's details
router.get('/me', authMiddleware, userController.getMe);
router.get('/me/favorites', authMiddleware, userController.getFavorites);
router.post('/me/favorites/:songId', authMiddleware, userController.addFavorite);
router.delete('/me/favorites/:songId', authMiddleware, userController.removeFavorite);

// Follow System
router.post('/:id/follow', authMiddleware, userController.followUser);
router.delete('/:id/follow', authMiddleware, userController.unfollowUser);

// Get a user by ID
router.get(
  '/:id',
  [param('id').isInt().withMessage('User ID must be an integer')],
  authMiddleware,
  userController.getOne
);

// Update a user by ID
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('User ID must be an integer'),
    body('username').optional().isString().withMessage('Username must be a string'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  authMiddleware,
  userController.update
);

// Delete a user by ID (Admin only)
router.delete(
  '/:id',
  [param('id').isInt().withMessage('User ID must be an integer')],
  authMiddleware,
  adminMiddleware,
  userController.deleteUser
);

module.exports = router;