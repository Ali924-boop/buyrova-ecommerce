import mongoose, { Schema, model, models } from "mongoose";

interface Variant {
  color: string;
  size: string[];
  images: string[];
  price?: number;
}

interface ProductDocument extends mongoose.Document {
  title: string;
  slug: string;
  price: number;
  variants: Variant[];
  description?: string;
  section?: "featured" | "new" | "all"; // <-- NEW FIELD
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<Variant>({
  color: { type: String, required: true },
  size: [{ type: String }],
  images: [{ type: String }],
  price: { type: Number },
});

const productSchema = new Schema<ProductDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    variants: [variantSchema],
    description: { type: String },
    section: { type: String, enum: ["featured", "new", "all"], default: "all" }, // <-- NEW
  },
  { timestamps: true }
);

const Product = models.Product || model<ProductDocument>("Product", productSchema);
export default Product;
