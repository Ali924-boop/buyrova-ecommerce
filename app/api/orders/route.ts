import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    // ✅ Validate total exists and is a positive number
    const body = await req.json();
    const { items, total } = body;

    if (!items || !items.length) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!total || typeof total !== "number" || total <= 0) {
      return NextResponse.json(
        { error: "Invalid total" },
        { status: 400 }
      );
    }

    const userId = (session?.user as any)?.id || null;

    const order = await Order.create({
      user: userId,
      products: items.map((item: any) => ({
        product: item._id,
        quantity: item.quantity,
      })),
      total,
      status: "pending",
    });

    return NextResponse.json(order, { status: 201 });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// ✅ GET is now protected — only admins or authenticated users can see all orders
export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orders = await Order.find()
      .populate("user", "name email")   // ✅ populate user info
      .populate("products.product", "name price") // ✅ populate product info
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);

  } catch (err) {
    console.error(err); // ✅ log the error, not silent
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}