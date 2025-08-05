const Payment = require('../models/Payment');

// Get current tenant's payment status/countdown
const getMyPaymentStatus = async (req, res) => {
  try {
    const tenant = req.user && req.user.id;
    const payment = await Payment.findOne({ tenant, status: { $in: ['unpaid', 'overdue'] } }).sort({ dueDate: 1 });
    if (!payment) return res.json({ status: 'paid' });
    const today = new Date();
    const daysLeft = Math.ceil((payment.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    res.json({
      status: payment.status,
      dueDate: payment.dueDate,
      daysLeft,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment status.' });
  }
};

// PATCH /api/payments/:id/manual - Landlord records manual payment
const recordManualPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountPaid, notes } = req.body;
    const payment = await Payment.findById(id).populate('property');
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });
    // Only landlord who owns the property can update
    if (req.user.role !== 'admin' && (!payment.property || String(payment.property.landlord) !== String(req.user.id))) {
      return res.status(403).json({ error: 'Forbidden: not your property/payment.' });
    }
    payment.amountPaid = (payment.amountPaid || 0) + Number(amountPaid);
    payment.paymentMethod = 'manual';
    payment.notes = notes || '';
    if (payment.amountPaid >= payment.amount) {
      payment.status = 'paid';
    } else if (payment.amountPaid > 0) {
      payment.status = 'partial';
    }
    await payment.save();
    // TODO: Generate receipt here if needed
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to record manual payment.' });
  }
};

// POST /api/payments/:id/digital - Tenant processes digital payment
const processDigitalPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountPaid, paymentMethod, transactionId } = req.body;
    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });
    // Only the tenant who owns the payment can update
    if (String(payment.tenant) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden: not your payment.' });
    }
    payment.amountPaid = (payment.amountPaid || 0) + Number(amountPaid);
    payment.paymentMethod = paymentMethod;
    payment.transactionId = transactionId;
    if (payment.amountPaid >= payment.amount) {
      payment.status = 'paid';
    } else if (payment.amountPaid > 0) {
      payment.status = 'partial';
    }
    await payment.save();
    // TODO: Generate receipt here if needed
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to process digital payment.' });
  }
};

// GET /api/payments/:id/receipt - Download/fetch receipt (placeholder)
const getPaymentReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id).populate('tenant property');
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });
    // For now, return a simple HTML receipt (replace with PDF generation as needed)
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <html><body>
      <h2>Payment Receipt</h2>
      <p><b>Tenant:</b> ${payment.tenant?.firstName || ''} ${payment.tenant?.lastName || ''}</p>
      <p><b>Property:</b> ${payment.property?.name || ''}</p>
      <p><b>Type:</b> ${payment.type}</p>
      <p><b>Amount:</b> KES ${payment.amount}</p>
      <p><b>Paid:</b> KES ${payment.amountPaid}</p>
      <p><b>Status:</b> ${payment.status}</p>
      <p><b>Date:</b> ${payment.updatedAt.toLocaleString()}</p>
      <p><b>Payment Method:</b> ${payment.paymentMethod || ''}</p>
      <p><b>Transaction ID:</b> ${payment.transactionId || ''}</p>
      <p><b>Notes:</b> ${payment.notes || ''}</p>
      <hr/>
      <p>Thank you for your payment.</p>
      </body></html>
    `);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch receipt.' });
  }
};

module.exports = {
  getMyPaymentStatus,
  recordManualPayment,
  processDigitalPayment,
  getPaymentReceipt
};
