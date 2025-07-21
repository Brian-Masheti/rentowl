import mongoose, { Document, Schema, Types } from 'mongoose';

export type MaintenanceStatus = 'pending' | 'in_progress' | 'resolved' | 'escalated';
export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface IMaintenanceRequest extends Document {
  property: Types.ObjectId;
  tenant: Types.ObjectId;
  caretaker: Types.ObjectId | null;
  description: string;
  status: MaintenanceStatus;
  urgency: UrgencyLevel;
  images: string[];
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceRequestSchema = new Schema<IMaintenanceRequest>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    caretaker: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'escalated'], default: 'pending' },
    urgency: { type: String, enum: ['low', 'medium', 'high'], required: true },
    images: [{ type: String }],
    resolutionNotes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IMaintenanceRequest>('MaintenanceRequest', MaintenanceRequestSchema);
