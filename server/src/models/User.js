const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['landlord', 'tenant', 'caretaker', 'admin', 'support', 'super_admin', 'devops'], required: true },
    permissions: [{ type: String }], // e.g., ['manage_users', 'view_reports']
    isActive: { type: Boolean, default: true },
    profilePic: { type: String },
    idDocument: { type: String },
    nextOfKin: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },
    documents: [{ type: String }],
    deleted: { type: Boolean, default: false },
    subscriptionDueDate: { type: Date },
    subscriptionStatus: { type: String, enum: ['active', 'expiring', 'grace', 'expired'], default: 'active' },
    lastSubscriptionReminderSent: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
