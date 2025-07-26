const mongoose = require('mongoose');

const MaintenanceRequestSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caretaker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'escalated'], default: 'pending' },
    urgency: { type: String, enum: ['low', 'medium', 'high'], required: true },
    images: [{ type: String }],
    resolutionNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaintenanceRequest', MaintenanceRequestSchema);
