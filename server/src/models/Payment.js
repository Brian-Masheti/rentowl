const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    amount: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 }, // Track partial payments
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['paid', 'unpaid', 'overdue'], default: 'unpaid' },
    type: { type: String, enum: ['rent', 'deposit', 'utility', 'other'], required: true },
    lastReminderSent: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
