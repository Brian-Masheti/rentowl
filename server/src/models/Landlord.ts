import mongoose, { Document, Schema } from 'mongoose';

export interface ILandlord extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  isActive: boolean;
  subscriptionDueDate?: Date;
  subscriptionStatus?: string;
  lastSubscriptionReminderSent?: Date;
  // Add more landlord-specific fields as needed
}

const LandlordSchema = new Schema<ILandlord>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  subscriptionDueDate: { type: Date },
  subscriptionStatus: { type: String },
  lastSubscriptionReminderSent: { type: Date },
}, { timestamps: true });

export default mongoose.model<ILandlord>('Landlord', LandlordSchema);
