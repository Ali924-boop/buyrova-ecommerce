import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContact extends Document {
  name:      string;
  email:     string;
  subject:   string;
  body:      string;
  read:      boolean;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name:    { type: String, required: true },
    email:   { type: String, required: true },
    subject: { type: String, required: true },
    body:    { type: String, required: true },
    read:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Contact ||
  mongoose.model<IContact>("Contact", ContactSchema);