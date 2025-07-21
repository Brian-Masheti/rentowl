import mongoose, { Document, Schema, Types } from 'mongoose';

export type PaymentStatus = 'paid' | 'unpaid' | 'overdue';

export interface IPayment extends Document {
  tenant: Types.ObjectId;
  property: Types.ObjectId;
  amount: number;
  dueDate: Date;
  status: PaymentStatus;
  lastReminderSent?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['paid', 'unpaid', 'overdue'], default: 'unpaid' },
    lastReminderSent: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
