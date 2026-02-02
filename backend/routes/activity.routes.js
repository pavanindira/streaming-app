const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/play', authMiddleware, activityController.logPlay);
router.get('/friends', authMiddleware, activityController.getFriendActivity);

module.exports = router;
