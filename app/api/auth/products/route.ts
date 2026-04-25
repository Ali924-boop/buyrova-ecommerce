import { NextResponse } from "next/server";
import Product from "@/models/Product";
import connectDB from "@/lib/db";

// CREATE PRODUCT
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const product = await Product.create({
      title: body.title,
      slug: body.slug,
      price: body.price,
      description: body.description,
      variants: body.variants,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// GET ALL PRODUCTS
export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}