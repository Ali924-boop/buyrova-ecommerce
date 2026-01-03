import mongoose, { Schema, model, models } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // hashed
  image: { type: String },
  role: { type: String, default: "user" }, // admin/user
});

export default models.User || model("User", userSchema);
