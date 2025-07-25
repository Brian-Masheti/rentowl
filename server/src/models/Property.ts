import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPropertyTenant {
  tenant: Types.ObjectId;
  unitType: string;
}

export interface IProperty extends Document {
  name: string;
  address: string;
  landlord: Types.ObjectId;
  caretaker: Types.ObjectId | null;
  tenants: IPropertyTenant[];
  status: 'occupied' | 'vacant';
  units: {
    type: string; // e.g., "Bedsitter", "1 Bedroom"
    count: number; // number of such units
    rent: number; // rent per unit
  }[];
  description?: string;
  profilePic?: string;
  profilePicThumb?: string;
  gallery: string[];
  galleryThumbs?: string[];
  rentDueDay?: number;
  gracePeriodDays?: number;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PropertyTenantSchema = new Schema<IPropertyTenant>({
  tenant: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  unitType: { type: String, required: true },
});

const PropertySchema = new Schema<IProperty>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    landlord: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    caretaker: { type: Schema.Types.ObjectId, ref: 'User', default: null },
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
    rentDueDay: { type: Number, default: 5 }, // 5th of the month
    gracePeriodDays: { type: Number, default: 3 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IProperty>('Property', PropertySchema);
