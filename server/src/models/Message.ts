import mongoose, { Document, Schema, Types } from 'mongoose';

export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'image' | 'file' | 'audio';

export interface IMessage extends Document {
  roomId: string; // propertyId for group, DM id for direct
  chatId?: Types.ObjectId;
  sender: Types.ObjectId;
  recipient?: Types.ObjectId;
  content: string;
  type: MessageType;
  attachment?: string;
  status: MessageStatus;
  deliveredTo: Types.ObjectId[];
  readBy: Types.ObjectId[];
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  roomId: { type: String, required: true },
  chatId: { type: Schema.Types.ObjectId, ref: 'Chat' },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'file', 'audio'], default: 'text' },
  attachment: { type: String },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  deliveredTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IMessage>('Message', MessageSchema);
