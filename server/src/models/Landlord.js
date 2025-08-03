const mongoose = require('mongoose');

const NotificationPrefsSchema = new mongoose.Schema({
  email: { type: Boolean, default: true },
  sms: { type: Boolean, default: false },
  inApp: { type: Boolean, default: true },
}, { _id: false });

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
  notificationPrefs: { type: NotificationPrefsSchema, default: () => ({}) },
  role: { type: String, default: 'landlord' },
}, { timestamps: true });

module.exports = mongoose.model('Landlord', LandlordSchema);
