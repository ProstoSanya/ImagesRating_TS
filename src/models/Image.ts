import mongoose, { Schema, Document } from 'mongoose';

export interface IImage extends Document {
  filename: string;
  title: string;
  userId: Schema.Types.ObjectId;
  uploadedAt: Date;
  ratings: Schema.Types.ObjectId[];
}

export const imageSchema = new Schema<IImage>({
  filename: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now, required: true },
  ratings: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

export default mongoose.model<IImage>('Image', imageSchema);