import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  isActive: boolean;
  deleted?: boolean;
  // Add more tenant-specific fields as needed
}

const TenantSchema = new Schema<ITenant>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<ITenant>('Tenant', TenantSchema);
