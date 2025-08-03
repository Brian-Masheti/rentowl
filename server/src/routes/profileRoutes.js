const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile } = require('../controllers/profileController');
const { requireAuth } = require('../middleware/authMiddleware');

// Get current user's profile
router.get('/me', requireAuth, getMyProfile);
// Update current user's profile
router.put('/me', requireAuth, updateMyProfile);
// Change current user's password
router.put('/change-password', requireAuth, require('../controllers/profileController').changeMyPassword);
// Get notification preferences
router.get('/notifications', requireAuth, require('../controllers/profileController').getMyNotificationPrefs);
// Update notification preferences
router.put('/notifications', requireAuth, require('../controllers/profileController').updateMyNotificationPrefs);

module.exports = router;
