import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  const resolvedParams = await params;
  const product = await Product.findOne({ slug: resolvedParams.slug }).lean();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
