const mongoose = require('mongoose');

const CheckListItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  status: { type: String, enum: ['good', 'needs_repair', 'damaged', 'missing'], default: 'good' },
  comment: { type: String },
  photos: [{ type: String }], // file paths
});

const CheckListSchema = new mongoose.Schema({
  type: { type: String, enum: ['move_in', 'move_out'], required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  unit: { type: String }, // or ObjectId if you have a Unit model
  unitType: { type: String }, // bedsitter, 1BR, 2BR, etc.
  caretaker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // caretaker assigned to the property/unit
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [CheckListItemSchema],
  landlordComment: { type: String },
  tenantComment: { type: String },
  signedByLandlord: { type: Boolean, default: false },
  landlordSignature: { type: String },
  landlordSignedAt: { type: Date },
  signedByTenant: { type: Boolean, default: false },
  tenantSignature: { type: String },
  tenantSignedAt: { type: Date },
  status: { type: String, enum: ['pending', 'signed_by_landlord', 'signed_by_tenant', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CheckList', CheckListSchema);
