"use client";
import React, { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import { FiPackage, FiArrowRight } from "react-icons/fi";

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  products?: { quantity: number; product?: { title?: string; price?: number } }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

function OrdersInner() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setOrders(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 px-4 sm:px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center">
              <FiPackage className="text-gray-600 text-2xl" />
            </div>
            <p className="text-gray-500 text-sm">No orders yet</p>
            <Link href="/shop" className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-1 transition">
              Start Shopping <FiArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order._id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-white font-semibold font-mono text-sm">#{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${statusColors[order.status] || "bg-gray-800 text-gray-400 border-gray-700"}`}>
                      {order.status}
                    </span>
                    <span className="text-white font-bold text-sm">${order.total.toLocaleString()}</span>
                  </div>
                </div>
                {order.products && order.products.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <p className="text-gray-500 text-xs">
                      {order.products.map((p) => p.product?.title || "Product").join(", ")}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <SessionProvider>
      <OrdersInner />
    </SessionProvider>
  );
}
