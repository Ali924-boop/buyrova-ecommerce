// app/api/admin/stats/route.ts

import { NextResponse } from "next/server";
import connectDB        from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import Order            from "@/models/Order";
import Product          from "@/models/Product";
import User             from "@/models/User";
import Message          from "@/models/Message"; // ✅ added — was missing

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.error;

  try {
    await connectDB();

    const [totalUsers, totalProducts, orders, unreadMessages, recentMsgs] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.find()
          .sort({ createdAt: -1 })
          .populate("user", "name email")
          .lean(),
        Message.countDocuments({ read: false }),   // ✅ was missing
        Message.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),                                  // ✅ was missing
      ]);

    const totalOrders  = orders.length;
    const totalRevenue = orders.reduce(
      (sum: number, o: any) => sum + (o.total ?? 0), 0
    );

    // ── Last 7 days daily revenue ────────────────────────────────────────────
    const now = new Date();
    const dailyRevenue: { date: string; revenue: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const day      = new Date(now);
      day.setDate(now.getDate() - i);

      const dayStart = new Date(day); dayStart.setHours(0,  0,  0,   0);
      const dayEnd   = new Date(day); dayEnd.setHours(23, 59, 59, 999);

      const revenue = orders
        .filter((o: any) => {
          const c = new Date(o.createdAt ?? 0);
          return c >= dayStart && c <= dayEnd;
        })
        .reduce((sum: number, o: any) => sum + (o.total ?? 0), 0);

      dailyRevenue.push({
        date: dayStart.toLocaleDateString("en-US", {
          weekday: "short", month: "short", day: "numeric",
        }),
        revenue,
      });
    }

    // ── Recent 5 orders ──────────────────────────────────────────────────────
    const recentOrders = orders.slice(0, 5).map((o: any) => ({
      _id:       o._id.toString(),
      total:     o.total     ?? 0,
      status:    o.status    ?? "pending",
      createdAt: o.createdAt,
      user:      o.user ? { name: o.user.name, email: o.user.email } : undefined,
    }));

    // ── Recent 5 messages ────────────────────────────────────────────────────
    const recentMessages = recentMsgs.map((m: any) => ({
      _id:        m._id.toString(),
      senderName: m.senderName ?? m.name    ?? "Unknown",
      subject:    m.subject    ?? "(No subject)",
      preview:    m.message
        ? String(m.message).slice(0, 100)
        : (m.preview ?? ""),
      createdAt:  m.createdAt,
      read:       m.read ?? false,
    }));

    return NextResponse.json({
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue,
      unreadMessages,  // ✅ now included
      dailyRevenue,
      recentOrders,
      recentMessages,  // ✅ now included
    });

  } catch (err) {
    console.error("[admin/stats]", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}