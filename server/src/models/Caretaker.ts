import mongoose, { Document, Schema } from 'mongoose';

export interface ICaretaker extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  isActive: boolean;
  // Add more caretaker-specific fields as needed
}

const CaretakerSchema = new Schema<ICaretaker>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<ICaretaker>('Caretaker', CaretakerSchema);
