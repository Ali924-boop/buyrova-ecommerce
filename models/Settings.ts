import { Schema, model, models } from "mongoose";

const settingsSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
});

export default models.Settings || model("Settings", settingsSchema);
