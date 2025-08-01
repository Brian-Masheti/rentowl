const express = require('express');
const router = express.Router();
const { getLandlordOverview } = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/authMiddleware');

// Landlord dashboard overview route
router.get('/landlord/overview', requireAuth, getLandlordOverview);

module.exports = router;
