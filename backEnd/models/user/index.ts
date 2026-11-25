import { Document, Schema, model } from 'mongoose';
import { USER_ROLE } from '../../enumerations';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: USER_ROLE;
  headline: string;
  bio: string;
  skills: string[];
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },   // select:false => never returned by accident
  role: { type: String, enum: Object.values(USER_ROLE), required: true },
  headline: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] }
}, { timestamps: true });

export const UserModel = model<IUser>('User', userSchema);
