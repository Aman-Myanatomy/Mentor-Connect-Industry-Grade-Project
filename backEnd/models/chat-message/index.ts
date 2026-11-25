import { Document, Schema, Types, model } from 'mongoose';
import { MESSAGE_KIND, USER_ROLE } from '../../enumerations';

export interface IChatMessage extends Document {
  roomId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderName: string;      // denormalised: avoids a join on every message render
  senderRole: USER_ROLE;
  body: string;
  kind: MESSAGE_KIND;
  isAutoReply: boolean;     // true when the demo AI persona wrote it (shown as such in the UI)
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
  roomId: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: Object.values(USER_ROLE), required: true },
  body: { type: String, required: true, maxlength: 2000 },
  kind: { type: String, enum: Object.values(MESSAGE_KIND), default: MESSAGE_KIND.TEXT },
  isAutoReply: { type: Boolean, default: false }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const ChatMessageModel = model<IChatMessage>('ChatMessage', chatMessageSchema);
