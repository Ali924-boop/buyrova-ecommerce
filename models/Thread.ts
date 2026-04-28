import mongoose, { Schema, Document, Model } from "mongoose";

export interface IThread extends Document {
  userId: string;
  subject: string;
  icon: "order" | "support" | "alert";
  preview: string;
  unread: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ThreadSchema = new Schema<IThread>(
  {
    userId:   { type: String, required: true, index: true },
    subject:  { type: String, required: true },
    icon:     { type: String, enum: ["order", "support", "alert"], default: "support" },
    preview:  { type: String, default: "" },
    unread:   { type: Number, default: 0 },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Thread: Model<IThread> =
  mongoose.models.Thread || mongoose.model<IThread>("Thread", ThreadSchema);

export default Thread;