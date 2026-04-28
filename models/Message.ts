import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  threadId: string;
  text: string;
  from: "user" | "support";
  userId: string;
  read: boolean;
  status: "sent" | "delivered" | "seen";
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    threadId: { type: String, required: true, index: true },
    text:     { type: String, required: true },
    from:     { type: String, enum: ["user", "support"], required: true },
    userId:   { type: String, required: true, index: true },
    read:     { type: Boolean, default: false },
    status:   { type: String, enum: ["sent", "delivered", "seen"], default: "sent" },
  },
  { timestamps: true }
);

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;