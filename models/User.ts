import mongoose, { Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, select: false },  // ✅ hidden by default, .select("+password") works now
    avatar:   { type: String },
    phone:    { type: String },
    role:     { type: String, default: "user" },
  },
  { timestamps: true }
);

// Clear cached model in dev to avoid stale schema issues
if (process.env.NODE_ENV === "development" && models.User) {
  mongoose.deleteModel("User");
}

export default models.User || model("User", userSchema);