// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth";
import dbConnect                     from "@/lib/db";   // FIX #1: was `db`, should match your lib/db export name (dbConnect)
import Order                         from "@/models/Order";
import mongoose                      from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // FIX #1: use dbConnect() to match your other routes (api/orders/route.ts uses dbConnect)
    await dbConnect();

    const isAdmin = (session.user as { role?: string }).role === "admin";
    const query   = isAdmin ? { _id: id } : { _id: id, user: session.user.id };

    const order = await Order.findOne(query)
      .populate("user", "name email")
      // FIX #2: populate "title" not "name" — your Product model uses `title` (seen in api/orders)
      .populate("products.product", "title price images")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // FIX #3: always return 200 explicitly for consistency (was implicit)
    return NextResponse.json(order, { status: 200 });

  } catch (err) {
    console.error("[GET /api/orders/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}