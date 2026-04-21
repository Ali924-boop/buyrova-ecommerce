"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiShoppingBag,
  FiUsers,
  FiBox,
  FiDollarSign,
  FiTrendingUp,
  FiArrowRight,
  FiActivity,
} from "react-icons/fi";

interface Stats {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
  dailyRevenue: { date: string; revenue: number }[];
  recentOrders: {
    _id: string;
    total: number;
    status: string;
    createdAt: string;
    user?: { name?: string; email?: string };
  }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );

  const maxRevenue = Math.max(...(stats?.dailyRevenue.map((d) => d.revenue) || [1]), 1);

  const kpiCards = [
    { label: "Total Revenue", value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: FiDollarSign, color: "from-yellow-500 to-orange-500", textColor: "text-yellow-400" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: FiShoppingBag, color: "from-blue-500 to-indigo-500", textColor: "text-blue-400" },
    { label: "Registered Users", value: stats?.totalUsers ?? 0, icon: FiUsers, color: "from-green-500 to-emerald-500", textColor: "text-green-400" },
    { label: "Products Listed", value: stats?.totalProducts ?? 0, icon: FiBox, color: "from-purple-500 to-pink-500", textColor: "text-purple-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FiActivity className="text-yellow-400" />
          Live Data
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color, textColor }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4 hover:border-gray-700 transition">
            <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 opacity-90`}>
              <Icon className="text-white text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
              <p className={`text-2xl font-bold ${textColor} mt-0.5`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FiTrendingUp className="text-yellow-400" /> 7-Day Revenue
            </h2>
          </div>
          <div className="flex items-end gap-2 h-44">
            {stats?.dailyRevenue.map((d, i) => {
              const pct = (d.revenue / maxRevenue) * 100;
              return (
                <div key={i} className="flex flex-col items-center flex-1 gap-1 group">
                  <div className="relative w-full flex flex-col justify-end" style={{ height: "160px" }}>
                    <div
                      className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-md transition-all duration-500 relative"
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 text-yellow-400 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                        ${d.revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 text-center leading-tight">
                    {d.date.split(",")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-white">Quick Actions</h2>
          {[
            { href: "/admin/products/add", label: "Add New Product", desc: "List a new product" },
            { href: "/admin/orders", label: "View All Orders", desc: "Manage customer orders" },
            { href: "/admin/users", label: "Manage Users", desc: "View registered users" },
            { href: "/admin/messages", label: "Check Messages", desc: "Customer inquiries" },
            { href: "/admin/settings", label: "Site Settings", desc: "Configure your store" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-yellow-500/40 transition group"
            >
              <div>
                <p className="text-sm font-medium text-white">{a.label}</p>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </div>
              <FiArrowRight className="text-gray-600 group-hover:text-yellow-400 transition" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition">
            View all <FiArrowRight />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wide bg-gray-800/50">
                <th className="text-left px-6 py-3">Order ID</th>
                <th className="text-left px-6 py-3">Customer</th>
                <th className="text-left px-6 py-3">Amount</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {stats?.recentOrders?.length ? stats.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-800/40 transition">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">
                    <Link href={`/admin/orders/${order._id}`} className="hover:text-yellow-400 transition">
                      #{order._id.slice(-6).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{order.user?.name || order.user?.email || "—"}</td>
                  <td className="px-6 py-4 font-semibold text-white">${order.total?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[order.status] || "bg-gray-800 text-gray-400 border-gray-700"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-600">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
