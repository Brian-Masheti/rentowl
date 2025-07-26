const express = require('express');
const { getMySubscriptionStatus } = require('../controllers/subscriptionController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Landlord: get subscription status/countdown
router.get('/my-status', requireAuth, requireRole(['landlord']), getMySubscriptionStatus);

module.exports = router;
