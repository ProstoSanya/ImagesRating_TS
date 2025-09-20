import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  images: {
    filename: string;
    title: string;
    uploadedAt: Date;
    ratings: mongoose.Types.ObjectId[];
  }[];
  createdAt: Date;
}

export const userSchema = new Schema<IUser>({
  username: {
    type: String, unique: true, required: true, trim: true, lowercase: true,
    minlength: 3, maxlength: 32, match: /^[a-zA-Z0-9_\-\.]+$/
  },
  email: {
    type: String, unique: true, required: true, trim: true, lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: { type: String, required: true, minlength: 6, maxlength: 128 },
  images: [{
    filename: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    uploadedAt: { type: Date, default: Date.now, required: true },
    ratings: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  }],
  createdAt: { type: Date, default: Date.now, required: true }
});

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model<IUser>('User', userSchema);