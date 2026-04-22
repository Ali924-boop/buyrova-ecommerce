import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();

    // Fetch orders once with populate — avoids second DB query for recentOrders
    const [totalUsers, totalProducts, orders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.find()
        .sort({ createdAt: -1 })
        .populate("user", "name email")
        .lean(),
    ]);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum: number, o: any) => sum + (o.total || 0),
      0
    );

    // ── Last 7 days daily revenue ─────────────────────────────────────────────
    const now = new Date();
    const dailyRevenue: { date: string; revenue: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);

      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const revenue = orders
        .filter((o: any) => {
          const created = new Date(o.createdAt || 0);
          return created >= dayStart && created <= dayEnd;
        })
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      dailyRevenue.push({
        date: dayStart.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        revenue,
      });
    }

    // ── Recent 5 orders (reuse already-populated orders) ─────────────────────
    const recentOrders = orders.slice(0, 5).map((o: any) => ({
      _id:       o._id.toString(),
      total:     o.total,
      status:    o.status,
      createdAt: o.createdAt,
      user:      o.user
        ? { name: o.user.name, email: o.user.email }
        : undefined,
    }));

    return NextResponse.json({
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue,
      dailyRevenue,
      recentOrders,
    });
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}