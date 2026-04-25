"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiSearch, FiEye, FiFilter, FiArrowLeft } from "react-icons/fi";

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  user?: { name?: string; email?: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  processing: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  shipped: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  delivered: "bg-green-500/10 text-green-500 border-green-500/30",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/30",
};

const ALL_STATUSES = [
  "all",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const url =
      statusFilter === "all"
        ? "/api/admin/orders"
        : `/api/admin/orders?status=${statusFilter}`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setOrders(Array.isArray(d) ? d : []);
        setLoading(false);
      })
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

  const isEmpty = !loading && filtered.length === 0;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} total orders
          </p>
        </div>

        {/* BACK BUTTON */}
        <Link
          href="/admin"
          className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <FiArrowLeft /> Back
        </Link>

      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">

        {/* SEARCH */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search order ID, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-sm"
          />
        </div>

        {/* FILTER */}
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-sm capitalize"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* LOADING */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-lg bg-gray-200 dark:bg-gray-900 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {isEmpty && (
        <div className="text-center py-20 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
          <p className="text-gray-500">Orders not found</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 dark:bg-gray-950 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4 text-left">Order ID</th>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-left">Amount</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">

              {filtered.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-950 transition"
                >

                  {/* ORDER ID */}
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>

                  {/* CUSTOMER */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.user?.name || "Guest"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.user?.email || "—"}
                    </p>
                  </td>

                  {/* AMOUNT */}
                  <td className="px-6 py-4 font-semibold">
                    ${order.total}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs rounded-full border capitalize ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>

                  {/* DATE */}
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="inline-flex items-center gap-1 text-yellow-500 text-xs"
                    >
                      <FiEye /> View
                    </Link>
                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}