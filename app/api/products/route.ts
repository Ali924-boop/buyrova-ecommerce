import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json(products, { status: 200 });
  } catch (err: any) {
    console.error("❌ GET /api/products error:", err?.message || err); // see exact error
    return NextResponse.json([], { status: 200 }); // ✅ return [] not 500
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();

    const title       = formData.get("title") as string;
    const slug        = formData.get("slug") as string;
    const category = formData.get("category") as string;
    const price       = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const variantsRaw = formData.get("variants") as string;

    console.log("Received:", { title, slug, price, description, variantsRaw });

    // add to validation:
if (!title || !slug || isNaN(price) || !category) {
  return NextResponse.json({ error: "Title, slug, price and category are required" }, { status: 400 });
}

    if (!variantsRaw) {
      return NextResponse.json(
        { error: "Variants missing" },
        { status: 400 }
      );
    }

    const variantMeta = JSON.parse(variantsRaw);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

   const variants = await Promise.all(
  variantMeta.map(async (meta: any, i: number) => {
    const files = formData.getAll(`variant_${i}_images`) as File[];

    const imagePaths = await Promise.all(
      files.map(async (file) => {
        const bytes    = await file.arrayBuffer();
        const buffer   = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name}`;
        const savePath = path.join(uploadsDir, filename);
        await writeFile(savePath, buffer);
        return `/uploads/${filename}`;
      })
    );

    return {
      color:  meta.color,
      size:   meta.size,
      price:  meta.price,
      stock:  meta.stock ?? 0, // ✅ added
      images: imagePaths,
    };
  })
);

   // add to Product.create():
const product = await Product.create({
  title, slug, price, category, description, variants,
});

    return NextResponse.json(product, { status: 201 });

  } catch (err: any) {
    console.error("Product creation error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Failed to create product" },
      { status: 500 }
    );
  }
}