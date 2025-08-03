const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  unitType: { type: String },
  floor: { type: String },
  unitLabel: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Tenant', TenantSchema);
