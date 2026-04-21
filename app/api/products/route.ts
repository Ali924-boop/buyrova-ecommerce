import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import cloudinary from "@/lib/cloudinary";

// GET all products
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}).lean();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST: Add new product (WITH CLOUDINARY)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const uploadedImages: string[] = [];

    for (const base64Image of body.images) {
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "products",
      });
      uploadedImages.push(result.secure_url);
    }

    const newProduct = await Product.create({
      ...body,
      images: uploadedImages,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
