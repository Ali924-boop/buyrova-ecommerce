import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session.user as any).id;

  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("products.product", "title price")
    .lean();

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const session = await getServerSession(authOptions);

  const { items, total, name, email, address, city, zip, country, paymentMethod } = body;

  if (!items?.length || !total) {
    return NextResponse.json({ error: "Missing order data" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session?.user as any)?.id;

  const products = items.map((item: { _id: string; quantity: number }) => ({
    product: item._id,
    quantity: item.quantity || 1,
  }));

  const order = await Order.create({
    user: userId || null,
    products,
    total,
    status: "pending",
    shippingAddress: { name, email, address, city, zip, country },
    paymentMethod: paymentMethod || "cod",
  });

  return NextResponse.json(order, { status: 201 });
}
