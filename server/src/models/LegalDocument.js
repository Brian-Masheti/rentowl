const mongoose = require('mongoose');

const LegalDocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: [
      'tenancy_agreement',
      'lease_agreement',
      'deposit_receipt',
      'move_in_checklist',
      'move_out_checklist',
      'id_document',
      'utility_registration',
      'compliance_certificate',
      'eviction_notice',
      'other_notice',
      'insurance',
      'other'
    ]
  }, // e.g., lease, insurance, compliance, other
  filePath: { type: String, required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadDate: { type: Date, default: Date.now },
  tags: [{ type: String }],
  signedByTenant: { type: Boolean, default: false },
  tenantSignature: { type: String },
  signedAt: { type: Date },
  signedIp: { type: String },
});

module.exports = mongoose.model('LegalDocument', LegalDocumentSchema);
