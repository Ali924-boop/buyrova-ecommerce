"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

export default function AdminOrderDetailPage() {
  const { id } = useParams(); // ✅ FIXED

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // FETCH ORDER
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${id}`);
        const data = await res.json();

        setOrder(data);
        setNewStatus(data.status);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  // UPDATE STATUS
  const updateStatus = async () => {
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const updated = await res.json();
      setOrder(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center text-gray-500 py-12">
        Order not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-white">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-gray-400 hover:text-white">
          <FiArrowLeft size={20} />
        </Link>

        <div>
          <h1 className="text-xl font-bold">
            Order #{order._id.slice(-6).toUpperCase()}
          </h1>

          <p className="text-gray-500 text-sm flex items-center gap-1">
            <FiCalendar />
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <span
          className={`ml-auto px-3 py-1 text-sm rounded-full border capitalize ${
            statusColors[order.status]
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* CUSTOMER */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-gray-400 text-sm flex items-center gap-2 mb-3">
            <FiUser /> Customer
          </h2>
          <p className="font-semibold">{order.user?.name || "Guest"}</p>
          <p className="text-gray-500 text-sm">{order.user?.email || "—"}</p>
        </div>

        {/* STATUS UPDATE */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-gray-400 text-sm mb-3">
            Update Status
          </h2>

          <div className="flex gap-2">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <button
              onClick={updateStatus}
              disabled={updating || newStatus === order.status}
              className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {updating ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* ITEMS */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
          <FiPackage />
          <h2 className="text-sm">Order Items</h2>
        </div>

        <div className="divide-y divide-gray-800">
          {order.products?.map((item, i) => (
            <div key={i} className="flex justify-between px-5 py-4">
              <div>
                <p>{item.product?.title}</p>
                <p className="text-gray-500 text-xs">
                  Qty: {item.quantity}
                </p>
              </div>

              <p className="font-semibold">
                ${((item.product?.price || 0) * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-gray-800 flex justify-between">
          <span className="text-gray-400">Total</span>
          <span className="text-yellow-400 font-bold">
            ${order.total?.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}