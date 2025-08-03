const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g., G1, F1, 2F1
  type: { type: String, required: true },  // e.g., studio, 1BR, 2BR
  rent: { type: Number, required: true },
  status: { type: String, enum: ['vacant', 'occupied'], default: 'vacant' },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null },
}, { _id: false });

const FloorSchema = new mongoose.Schema({
  floor: { type: String, required: true }, // e.g., Ground, FirstFloor, 2Floor
  units: [UnitSchema]
}, { _id: false });

const PropertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caretaker: { type: mongoose.Schema.Types.ObjectId, ref: 'Caretaker', default: null },
  units: [FloorSchema], // Now grouped by floor
  description: { type: String },
  profilePic: { type: String },
  profilePicThumb: { type: String },
  gallery: { type: Array, default: [] },
  galleryThumbs: { type: Array, default: [] },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);
