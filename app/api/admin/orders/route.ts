import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const query = status ? { status } : {};

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .populate("products.product", "title price")
    .lean();

  return NextResponse.json(orders);
}
