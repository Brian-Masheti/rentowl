const mongoose = require('mongoose');

const CaretakerActionSchema = new mongoose.Schema({
  caretaker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caretaker',
    required: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: false,
  },
  actionType: {
    type: String,
    required: true,
    enum: [
      'maintenance_update',
      'maintenance_resolved',
      'announcement_sent',
      'task_assigned',
      'task_updated',
      'other',
    ],
    default: 'other',
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'in_progress'],
    default: 'completed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('CaretakerAction', CaretakerActionSchema);
