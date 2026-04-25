"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FiShoppingBag,
  FiUsers,
  FiBox,
  FiDollarSign,
  FiTrendingUp,
  FiArrowRight,
  FiArrowLeft,
  FiLogOut,
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
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  processing: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  shipped: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  delivered: "bg-green-500/10 text-green-500 border-green-500/30",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/30",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  const maxRevenue = Math.max(
    ...(stats?.dailyRevenue?.map((d) => d.revenue) || [1]),
    1
  );

  const kpiCards = [
    {
      label: "Revenue",
      value: `$${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: FiDollarSign,
      color: "from-yellow-500 to-orange-500",
    },
    {
      label: "Orders",
      value: stats?.totalOrders || 0,
      icon: FiShoppingBag,
      color: "from-blue-500 to-indigo-500",
    },
    {
      label: "Users",
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Products",
      value: stats?.totalProducts || 0,
      icon: FiBox,
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 space-y-8 text-black dark:text-white">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Analytics & Overview
          </p>
        </div>

        {/* ✅ Right side buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400 transition"
          >
            <FiArrowLeft /> Back
          </Link>

          {/* ✅ Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition font-medium"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpiCards.map((c) => (
          <div
            key={c.label}
            className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white`}
            >
              <c.icon />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">{c.label}</p>
              <p className="text-xl font-bold">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* GRAPH + QUICK ACTIONS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* GRAPH */}
        <div className="xl:col-span-2 p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h2 className="flex items-center gap-2 font-semibold mb-5">
            <FiTrendingUp /> Revenue
          </h2>
          <div className="flex items-end gap-2 h-40">
            {stats?.dailyRevenue?.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full h-40 flex items-end">
                  <div
                    className="w-full bg-yellow-500 rounded-t-md"
                    style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {d.date.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
          <h2 className="font-semibold">Quick Actions</h2>
          {[
            { href: "/admin/products/add", label: "Add Product" },
            { href: "/admin/orders", label: "View Orders" },
            { href: "/admin/users", label: "Users" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex justify-between items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {a.label}
              <FiArrowRight />
            </Link>
          ))}
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-semibold">
          Recent Orders
        </div>

        {!stats?.recentOrders?.length ? (
          <p className="p-6 text-center text-gray-500">No orders found</p>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {stats.recentOrders.map((o) => (
                    <tr key={o._id} className="border-b dark:border-gray-800">
                      <td className="p-3 font-mono text-xs">#{o._id.slice(-6)}</td>
                      <td>{o.user?.name}</td>
                      <td>${o.total}</td>
                      <td>
                        <span className={`px-2 py-1 text-xs rounded ${statusColors[o.status]}`}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/orders/${o._id}`} className="text-yellow-500">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="md:hidden space-y-3 p-3">
              {stats.recentOrders.map((o) => (
                <div
                  key={o._id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-800"
                >
                  <p className="font-semibold">{o.user?.name}</p>
                  <p className="text-sm text-gray-500">#{o._id.slice(-6)}</p>
                  <p className="text-sm">${o.total}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}