const express = require('express');
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Get Admin Stats
router.get('/stats', authMiddleware, adminMiddleware, adminController.getStats);

module.exports = router;
