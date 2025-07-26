const express = require('express');
const { getMyPaymentStatus } = require('../controllers/paymentController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Tenant: get payment status/countdown
router.get('/my-status', requireAuth, requireRole(['tenant']), getMyPaymentStatus);

module.exports = router;
