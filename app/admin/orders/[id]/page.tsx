"use client";
import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiPackage, FiUser, FiCalendar } from "react-icons/fi";

interface OrderItem {
  product?: { title?: string; price?: number };
  quantity: number;
}

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  user?: { name?: string; email?: string };
  products?: OrderItem[];
}

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((d) => { setOrder(d); setNewStatus(d.status); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const updateStatus = async () => {
    setUpdating(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const updated = await res.json();
    setOrder(updated);
    setUpdating(false);
  };

  if (loading)
    return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" /></div>;

  if (!order)
    return <div className="text-center text-gray-500 py-12">Order not found.</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-gray-500 hover:text-white transition">
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Order #{order._id.slice(-6).toUpperCase()}</h1>
          <p className="text-gray-500 text-sm">
            <FiCalendar className="inline mr-1" />
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span className={`ml-auto px-3 py-1.5 text-sm font-semibold rounded-full border capitalize ${statusColors[order.status] || "bg-gray-800 text-gray-400 border-gray-700"}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <FiUser className="text-yellow-400" /> Customer
          </h2>
          <p className="text-white font-semibold">{order.user?.name || "Guest"}</p>
          <p className="text-gray-400 text-sm mt-0.5">{order.user?.email || "—"}</p>
        </div>

        {/* Update Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Update Status</h2>
          <div className="flex gap-2">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500 transition capitalize text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
            <button
              onClick={updateStatus}
              disabled={updating || newStatus === order.status}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-gray-900 font-semibold rounded-lg transition text-sm"
            >
              {updating ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-800">
          <FiPackage className="text-yellow-400" />
          <h2 className="text-sm font-semibold text-gray-300">Order Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wide bg-gray-800/50">
              <th className="text-left px-5 py-3">Product</th>
              <th className="text-left px-5 py-3">Price</th>
              <th className="text-left px-5 py-3">Qty</th>
              <th className="text-left px-5 py-3">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {order.products?.map((item, i) => (
              <tr key={i} className="hover:bg-gray-800/30 transition">
                <td className="px-5 py-4 text-white">{item.product?.title || "Unknown product"}</td>
                <td className="px-5 py-4 text-gray-400">${item.product?.price?.toLocaleString() || 0}</td>
                <td className="px-5 py-4 text-gray-400">{item.quantity}</td>
                <td className="px-5 py-4 font-semibold text-white">${((item.product?.price || 0) * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-700">
              <td colSpan={3} className="px-5 py-4 text-right text-gray-400 font-medium text-sm">Order Total</td>
              <td className="px-5 py-4 font-bold text-yellow-400 text-lg">${order.total?.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
