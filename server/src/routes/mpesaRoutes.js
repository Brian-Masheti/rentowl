const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { stkPush } = require('../utils/mpesaDaraja');
const Payment = require('../models/Payment');

// POST /api/mpesa/stkpush
router.post('/stkpush', requireAuth, requireRole(['tenant', 'landlord', 'admin']), async (req, res) => {
  try {
    const { phone, amount, accountRef, transactionDesc, tenantId, propertyId, type } = req.body;
    if (!phone || !amount || !tenantId || !propertyId || !type) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const result = await stkPush({ phone, amount, accountRef, transactionDesc });
    // Optionally, create a pending payment record here if needed
    res.json({ success: true, result });
  } catch (err) {
    console.error('STK Push error:', err && err.response ? err.response.data : err);
    res.status(500).json({ error: 'Failed to initiate STK Push.', details: err.message });
  }
});

// POST /api/mpesa/callback
router.post('/callback', async (req, res) => {
  try {
    // Safaricom will POST payment result here
    const body = req.body;
    console.log('Mpesa Callback:', JSON.stringify(body));
    // TODO: Update payment record in DB based on callback data
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Callback error.' });
  }
});

module.exports = router;
