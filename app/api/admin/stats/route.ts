import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();

  const [totalOrders, totalUsers, totalProducts, orders] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments(),
    Product.countDocuments(),
    Order.find().sort({ createdAt: -1 }).lean(),
  ]);

  const totalRevenue = orders.reduce((sum: number, o: { total?: number }) => sum + (o.total || 0), 0);

  // Last 7 days daily revenue
  const today = new Date();
  const dailyRevenue: { date: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dayStart = new Date(day.setHours(0, 0, 0, 0));
    const dayEnd = new Date(day.setHours(23, 59, 59, 999));

    const dayOrders = orders.filter((o: { createdAt?: Date | string }) => {
      const created = new Date(o.createdAt || 0);
      return created >= dayStart && created <= dayEnd;
    });
    const revenue = dayOrders.reduce((sum: number, o: { total?: number }) => sum + (o.total || 0), 0);
    dailyRevenue.push({
      date: dayStart.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      revenue,
    });
  }

  // Recent orders (last 5)
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name email")
    .lean();

  return NextResponse.json({
    totalOrders,
    totalUsers,
    totalProducts,
    totalRevenue,
    dailyRevenue,
    recentOrders,
  });
}
