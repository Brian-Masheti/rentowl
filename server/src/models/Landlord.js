const mongoose = require('mongoose');

const LandlordSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  subscriptionDueDate: { type: Date },
  subscriptionStatus: { type: String },
  lastSubscriptionReminderSent: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Landlord', LandlordSchema);
