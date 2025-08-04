const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { requireAuth } = require('../middleware/authMiddleware');

// GET /api/payments - all payments (optionally filter by landlord's properties)
router.get('/', requireAuth, async (req, res) => {
  try {
    // Optionally, filter by landlord's properties here if needed
    // For now, return all payments
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

module.exports = router;
