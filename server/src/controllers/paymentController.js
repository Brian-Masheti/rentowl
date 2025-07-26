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

module.exports = {
  getMyPaymentStatus
};
