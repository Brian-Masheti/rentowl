const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g., 'tenant_created', 'caretaker_assigned', etc.
  message: { type: String, required: true },
  data: { type: Object }, // Optional: store extra info (tenantId, propertyId, etc.)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);
