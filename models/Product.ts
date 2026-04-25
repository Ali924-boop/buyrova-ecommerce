import mongoose, { Schema, model, models } from "mongoose";

interface Variant {
  color: string;
  size: string[];
  images: string[];
  price?: number;
  stock?: number;
}

interface ProductDocument extends mongoose.Document {
  title: string;
  slug: string;
  price: number;
  category: string;          // ✅ added
  variants: Variant[];
  description?: string;
  section?: "featured" | "new" | "all";
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<Variant>({
  color:  { type: String, required: true },
  size:   [{ type: String }],
  images: [{ type: String }],
  price:  { type: Number, default: 0 },
  stock:  { type: Number, default: 0 },
});

const productSchema = new Schema<ProductDocument>(
  {
    title: { type: String, required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    price:       { type: Number, required: true },
    category: { type: String, required: false, trim: true }, // ✅ not required
    variants:    [variantSchema],
    description: { type: String },
    section: {
      type: String,
      enum: ["featured", "new", "all"],
      default: "all",
    },
  },
  { timestamps: true }
);

// Fix: clear cached model in dev to avoid stale schema issues
if (process.env.NODE_ENV === "development" && models.Product) {
  mongoose.deleteModel("Product");
}

const Product = models.Product || model<ProductDocument>("Product", productSchema);

export default Product;