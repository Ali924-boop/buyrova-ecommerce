import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: String,
  slug: String,
  price: Number,
  images: [String],
  description: String,
  stock: Number,
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
