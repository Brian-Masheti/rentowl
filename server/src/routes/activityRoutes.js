const express = require('express');
const { getRecentActivities } = require('../controllers/activityController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Get recent activities for the logged-in landlord
router.get('/landlord/activities', requireAuth, getRecentActivities);

module.exports = router;
