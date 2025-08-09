const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

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

// PATCH /api/payments/:id/manual - Landlord records manual payment
router.patch('/:id/manual', requireAuth, requireRole(['landlord', 'admin']), paymentController.recordManualPayment);

// POST /api/payments/:id/digital - Tenant processes digital payment
router.post('/:id/digital', requireAuth, requireRole(['tenant']), paymentController.processDigitalPayment);

// GET /api/payments/:id/receipt - Download/fetch receipt
router.get('/:id/receipt', requireAuth, paymentController.getPaymentReceipt);

// POST /api/payments/manual - Landlord records a batch/manual payment (for modal)
router.post('/manual', requireAuth, requireRole(['landlord', 'admin']), paymentController.manualPayment);

// Mpesa Daraja endpoints (if you want to include them here)
const mpesaRoutes = require('./mpesaRoutes');
router.use('/mpesa', mpesaRoutes);

module.exports = router;
