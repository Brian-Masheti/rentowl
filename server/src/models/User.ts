import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'landlord' | 'tenant' | 'caretaker' | 'super_admin';

export interface IUser extends Document {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  profilePic?: string;
  idDocument?: string;
  nextOfKin?: {
    name: string;
    phone: string;
    relationship: string;
  };
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
  // Landlord SaaS subscription fields
  subscriptionDueDate?: Date;
  subscriptionStatus?: 'active' | 'expiring' | 'grace' | 'expired';
  lastSubscriptionReminderSent?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['landlord', 'tenant', 'caretaker', 'super_admin'], required: true },
    isActive: { type: Boolean, default: true },
    profilePic: { type: String },
    idDocument: { type: String },
    nextOfKin: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },
    documents: [{ type: String }],
    deleted: { type: Boolean, default: false }, // Soft delete flag for tenants
    // Landlord SaaS subscription fields
    subscriptionDueDate: { type: Date },
    subscriptionStatus: { type: String, enum: ['active', 'expiring', 'grace', 'expired'], default: 'active' },
    lastSubscriptionReminderSent: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
