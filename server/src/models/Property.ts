import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProperty extends Document {
  name: string;
  address: string;
  landlord: Types.ObjectId;
  caretaker: Types.ObjectId | null;
  tenants: Types.ObjectId[];
  status: 'occupied' | 'vacant';
  rentAmount: number;
  description?: string;
  profilePic?: string;
  gallery: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    landlord: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    caretaker: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    tenants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['occupied', 'vacant'], default: 'vacant' },
    rentAmount: { type: Number, required: true },
    description: { type: String },
    profilePic: { type: String },
    gallery: [{ type: String }],
    rentDueDay: { type: Number, default: 5 }, // 5th of the month
    gracePeriodDays: { type: Number, default: 3 },
  },
  { timestamps: true }
);

export default mongoose.model<IProperty>('Property', PropertySchema);
