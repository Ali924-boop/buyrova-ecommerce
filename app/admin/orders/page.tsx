"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiSearch, FiEye, FiFilter } from "react-icons/fi";

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  user?: { name?: string; email?: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

const ALL_STATUSES = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const url = statusFilter !== "all" ? `/api/admin/orders?status=${statusFilter}` : "/api/admin/orders";
    fetch(url)
      .then((r) => r.json())
      .then((d) => { setOrders(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [statusFilter]);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by order ID, customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-600 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-yellow-500 transition text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition capitalize"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide bg-gray-800/60">
                  <th className="text-left px-6 py-3">Order ID</th>
                  <th className="text-left px-6 py-3">Customer</th>
                  <th className="text-left px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.length ? filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-800/40 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{order.user?.name || "Guest"}</p>
                      <p className="text-gray-500 text-xs">{order.user?.email || "—"}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">${order.total?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${statusColors[order.status] || "bg-gray-800 text-gray-400 border-gray-700"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="inline-flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 border border-yellow-500/30 hover:border-yellow-500/60 rounded-lg px-3 py-1.5 transition"
                      >
                        <FiEye /> View
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-600">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
