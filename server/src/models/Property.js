const mongoose = require('mongoose');

const PropertyTenantSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  unitType: { type: String, required: true },
});

const PropertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caretaker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    tenants: [PropertyTenantSchema],
    status: { type: String, enum: ['occupied', 'vacant'], default: 'vacant' },
    units: [
      {
        type: { type: String, required: true },
        count: { type: Number, required: true },
        rent: { type: Number, required: true },
      }
    ],
    description: { type: String },
    profilePic: { type: String },
    profilePicThumb: { type: String },
    gallery: [{ type: String }],
    galleryThumbs: [{ type: String }],
    rentDueDay: { type: Number, default: 5 },
    gracePeriodDays: { type: Number, default: 3 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', PropertySchema);
