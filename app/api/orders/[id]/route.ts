// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth";
import db                            from "@/lib/db";
import Order                         from "@/models/Order";
import mongoose                      from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← params is now a Promise in Next.js 15+
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;  // ← must await params

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    await db();

    const isAdmin = (session.user as { role?: string }).role === "admin";
    const query   = isAdmin ? { _id: id } : { _id: id, user: session.user.id };

    const order = await Order.findOne(query)
      .populate("user", "name email")
      .populate("products.product", "name price images")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });

  } catch (err) {
    console.error("[GET /api/orders/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}