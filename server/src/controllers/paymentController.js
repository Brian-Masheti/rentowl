const Payment = require('../models/Payment');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const manualPayment = async (req, res) => {
  try {
    const { tenantId, propertyId, amount, applyDeposit } = req.body;
    let remaining = Number(amount);
    let depositPaid = 0, rentPaid = 0, overpayment = 0;

    // Find unpaid/partial deposit and rent payments
    const depositPayment = await Payment.findOne({
      tenant: tenantId,
      property: propertyId,
      type: 'deposit',
      status: { $in: ['unpaid', 'partial'] }
    });
    const rentPayment = await Payment.findOne({
      tenant: tenantId,
      property: propertyId,
      type: 'rent',
      status: { $in: ['unpaid', 'partial'] }
    });

    // Apply to deposit first if requested
    if (applyDeposit && depositPayment && remaining > 0) {
      const depositDue = (depositPayment.amount || 0) - (depositPayment.amountPaid || 0);
      depositPaid = Math.min(remaining, depositDue);
      depositPayment.amountPaid = (depositPayment.amountPaid || 0) + depositPaid;
      depositPayment.status = depositPayment.amountPaid >= depositPayment.amount ? 'paid' : 'partial';
      depositPayment.paymentDate = new Date();
      await depositPayment.save();
      remaining -= depositPaid;
    }

    // Apply to rent
    if (rentPayment && remaining > 0) {
      const rentDue = (rentPayment.amount || 0) - (rentPayment.amountPaid || 0);
      rentPaid = Math.min(remaining, rentDue);
      rentPayment.amountPaid = (rentPayment.amountPaid || 0) + rentPaid;
      rentPayment.status = rentPayment.amountPaid >= rentPayment.amount ? 'paid' : 'partial';
      rentPayment.paymentDate = new Date();
      await rentPayment.save();
      remaining -= rentPaid;
    }

    // Overpayment
    if (remaining > 0) {
      overpayment = remaining;
      // Add overpayment as credit to tenant
      const Tenant = require('../models/Tenant');
      await Tenant.findByIdAndUpdate(tenantId, { $inc: { credit: overpayment } });
    }

    res.json({
      success: true,
      splitSummary: {
        depositPaid,
        rentPaid,
        overpayment,
        depositRemaining: depositPayment ? (depositPayment.amount - depositPayment.amountPaid) : 0,
        rentRemaining: rentPayment ? (rentPayment.amount - rentPayment.amountPaid) : 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record manual payment.', details: err.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments.' });
  }
};

// Dummy implementations for missing handlers
const recordManualPayment = async (req, res) => {
  res.status(501).json({ error: 'recordManualPayment not implemented yet.' });
};
const processDigitalPayment = async (req, res) => {
  res.status(501).json({ error: 'processDigitalPayment not implemented yet.' });
};
const getPaymentReceipt = async (req, res) => {
  res.status(501).json({ error: 'getPaymentReceipt not implemented yet.' });
};

module.exports = {
  manualPayment,
  getAllPayments,
  recordManualPayment,
  processDigitalPayment,
  getPaymentReceipt
};
