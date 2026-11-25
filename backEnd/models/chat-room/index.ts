import { Document, Schema, Types, model } from 'mongoose';

export interface IChatRoom extends Document {
  studentId: Types.ObjectId;
  mentorId: Types.ObjectId;
}

const chatRoomSchema = new Schema<IChatRoom>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });
chatRoomSchema.index({ studentId: 1, mentorId: 1 }, { unique: true });   // one room per pair

export const ChatRoomModel = model<IChatRoom>('ChatRoom', chatRoomSchema);
