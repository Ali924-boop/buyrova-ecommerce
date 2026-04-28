import mongoose, { Schema, model, models } from "mongoose";

const orderSchema = new Schema({
  user:          { type: Schema.Types.ObjectId, ref: "User", required: false },
  name:          { type: String },
  email:         { type: String },
  address:       { type: String },
  city:          { type: String },
  zip:           { type: String },
  country:       { type: String },
  paymentMethod: { type: String },
  qrReference:   { type: String },

  products: [
    {
      product:      { type: Schema.Types.ObjectId, ref: "Product" },
      quantity:     { type: Number, default: 1 },
      color:        { type: String, default: "" },
      size:         { type: String, default: "" },
      variantIndex: { type: Number, default: -1 },
    },
  ],

  total:     { type: Number, required: true },
  status:    { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default models.Order || model("Order", orderSchema);