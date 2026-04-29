"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  FiShoppingBag,
  FiUsers,
  FiBox,
  FiDollarSign,
  FiTrendingUp,
  FiArrowRight,
  FiArrowLeft,
  FiLogOut,
  FiMessageSquare,
} from "react-icons/fi";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface Stats {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
  unreadMessages?: number;
  dailyRevenue: { date: string; revenue: number }[];
  recentOrders: {
    _id: string;
    total: number;
    status: string;
    createdAt: string;
    user?: { name?: string; email?: string };
  }[];
  recentMessages?: {
    _id: string;
    senderName: string;
    subject: string;
    preview: string;
    createdAt: string;
    read: boolean;
  }[];
}

// FIX 1: Added "default" key so unknown statuses never fall through to undefined
const statusColors: Record<string, string> = {
  pending:    "bg-amber-500/10 text-amber-500 border border-amber-500/25",
  processing: "bg-blue-500/10 text-blue-500 border border-blue-500/25",
  shipped:    "bg-violet-500/10 text-violet-500 border border-violet-500/25",
  delivered:  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
  cancelled:  "bg-red-500/10 text-red-500 border border-red-500/25",
  default:    "bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700",
};

// ─── Component ──────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  // FIX 2: Added error state — previously a failed fetch silently left the UI
  // stuck on the spinner with no feedback to the user.
  const [fetchError, setFetchError] = useState(false);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/account/login?callbackUrl=/admin/dashboard");
      return;
    }
    if (status === "authenticated") {
      const role = (session?.user as { role?: string })?.role;
      if (role !== "admin") {
        router.replace("/");
      }
    }
  }, [status, session, router]);

  // ── Fetch stats ─────────────────────────────────────────────────────────────
  // FIX 3: Wrapped fetchStats in useCallback to safely add it to the dependency
  // array of the useEffect below — previously the effect depended on session &
  // status but called inline logic, causing potential stale-closure bugs and
  // an exhaustive-deps ESLint warning.
  const fetchStats = useCallback(async () => {
    try {
      setFetchError(false);
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Stats = await res.json();
      setStats(data);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin") return;
    fetchStats();
  }, [status, session, fetchStats]);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.replace("/account/login");
  };

  // ── Loading / auth pending ──────────────────────────────────────────────────
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;
  if ((session?.user as { role?: string })?.role !== "admin") return null;

  // FIX 2 (continued): Render a user-facing error state instead of a blank/broken UI
  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm text-red-400">Failed to load dashboard data.</p>
        <button
          onClick={() => { setLoading(true); fetchStats(); }}
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Derived values ──────────────────────────────────────────────────────────
  const maxRevenue = Math.max(
    ...(stats?.dailyRevenue?.map((d) => d.revenue) ?? [1]),
    1
  );

  const kpiCards = [
    {
      label: "Revenue",
      value: `$${stats?.totalRevenue?.toLocaleString() ?? 0}`,
      icon: FiDollarSign,
      gradient: "from-yellow-400 to-orange-500",
      glow: "shadow-yellow-500/20",
    },
    {
      label: "Orders",
      value: stats?.totalOrders ?? 0,
      icon: FiShoppingBag,
      gradient: "from-blue-400 to-indigo-600",
      glow: "shadow-blue-500/20",
    },
    {
      label: "Users",
      value: stats?.totalUsers ?? 0,
      icon: FiUsers,
      gradient: "from-emerald-400 to-teal-600",
      glow: "shadow-emerald-500/20",
    },
    {
      label: "Products",
      value: stats?.totalProducts ?? 0,
      icon: FiBox,
      gradient: "from-violet-400 to-pink-600",
      glow: "shadow-violet-500/20",
    },
  ];

  const unread = stats?.unreadMessages ?? 0;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-8 max-w-screen-xl mx-auto">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-yellow-500 mb-1">
              Admin Panel
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              Dashboard
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              Welcome back, {session?.user?.name ?? "Admin"} · Analytics &amp; Overview
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg
                text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
                bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700
                hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-150"
            >
              <FiArrowLeft className="text-xs" /> Back
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg
                text-red-500 bg-red-50 dark:bg-red-500/10
                border border-red-200 dark:border-red-500/25
                hover:bg-red-500 hover:text-white hover:border-red-500
                transition-all duration-150"
            >
              <FiLogOut className="text-xs" /> Logout
            </button>
          </div>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiCards.map((c) => (
            <div
              key={c.label}
              className={`relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-gray-900/80
                border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md ${c.glow}
                transition-all duration-200 group`}
            >
              <div className={`absolute inset-0 opacity-0 dark:opacity-[0.03] bg-gradient-to-br ${c.gradient} pointer-events-none`} />
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.gradient}
                  flex items-center justify-center text-white text-lg
                  shadow-lg group-hover:scale-105 transition-transform duration-200`}>
                  <c.icon />
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500">
                    {c.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none mt-0.5">
                    {c.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── REVENUE CHART + QUICK ACTIONS ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Chart */}
          <div className="xl:col-span-2 p-6 rounded-2xl bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <FiTrendingUp className="text-yellow-500" />
                Revenue — Last 7 Days
              </h2>
              {stats?.dailyRevenue?.[6] && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Latest:{" "}
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    ${stats.dailyRevenue[6].revenue.toLocaleString()}
                  </span>
                </span>
              )}
            </div>
            {/* FIX 4: Guard against empty dailyRevenue array — previously rendered
                a broken empty chart with no feedback if the API returned [] */}
            {!stats?.dailyRevenue?.length ? (
              <p className="flex items-center justify-center h-44 text-sm text-gray-400 dark:text-gray-600">
                No revenue data available
              </p>
            ) : (
              <div className="flex items-end gap-2 h-44">
                {stats.dailyRevenue.map((d, i) => {
                  const pct = (d.revenue / maxRevenue) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ${d.revenue.toLocaleString()}
                      </span>
                      <div className="w-full flex items-end" style={{ height: "9rem" }}>
                        <div
                          className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-md
                            hover:from-yellow-400 hover:to-yellow-300 transition-colors duration-150"
                          style={{ height: `${pct}%`, minHeight: "4px" }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {d.date.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { href: "/admin/products/add", label: "Add Product",  icon: FiBox },
                { href: "/admin/orders",        label: "View Orders",  icon: FiShoppingBag },
                { href: "/admin/users",          label: "Users",        icon: FiUsers },
                { href: "/admin/messages",       label: "Messages",     icon: FiMessageSquare, badge: unread > 0 ? unread : undefined },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex justify-between items-center p-3 rounded-xl
                    bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50
                    hover:bg-yellow-50 dark:hover:bg-yellow-500/10
                    hover:border-yellow-200 dark:hover:border-yellow-500/30
                    transition-all duration-150 group"
                >
                  <span className="flex items-center gap-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                    <a.icon className="text-base text-gray-400 dark:text-gray-500 group-hover:text-yellow-500 transition-colors" />
                    {a.label}
                    {a.badge !== undefined && (
                      <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                        {a.badge > 99 ? "99+" : a.badge}
                      </span>
                    )}
                  </span>
                  <FiArrowRight className="text-gray-300 dark:text-gray-600 group-hover:text-yellow-500 group-hover:translate-x-0.5 transition-all duration-150" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── RECENT MESSAGES ── */}
        <div className="rounded-2xl bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiMessageSquare className="text-yellow-500" />
              Recent Messages
              {unread > 0 && (
                <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </h2>
            <Link href="/admin/messages" className="text-xs font-medium text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-1">
              View all <FiArrowRight />
            </Link>
          </div>

          {!stats?.recentMessages?.length ? (
            <p className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">No messages yet</p>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {stats.recentMessages.map((m) => (
                <Link
                  key={m._id}
                  href={`/admin/messages/${m._id}`}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  {/* FIX 5: senderName could be empty string — added fallback to "?" safely */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {m.senderName?.trim()?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-semibold truncate ${m.read ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}>
                        {m.senderName || "Unknown Sender"}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-600 flex-shrink-0">
                        {new Date(m.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${m.read ? "text-gray-400 dark:text-gray-600" : "text-gray-700 dark:text-gray-300 font-medium"}`}>
                      {m.subject || <span className="italic text-gray-400">(No subject)</span>}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 truncate mt-0.5">{m.preview}</p>
                  </div>
                  {!m.read && <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0 mt-1.5" />}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── RECENT ORDERS ── */}
        <div className="rounded-2xl bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiShoppingBag className="text-blue-500" />
              Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-xs font-medium text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-1">
              View all <FiArrowRight />
            </Link>
          </div>

          {!stats?.recentOrders?.length ? (
            <p className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">No orders found</p>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      {["Order", "Customer", "Total", "Status", ""].map((h, i) => (
                        // FIX 3 (minor): added index to key to avoid duplicate-key warning
                        // when two header cells have the same label (e.g. empty string "")
                        <th key={`${h}-${i}`} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {stats.recentOrders.map((o) => (
                      <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                          #{o._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {o.user?.name ?? <span className="text-gray-400 italic">Guest</span>}
                        </td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white">
                          ${o.total.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          {/* FIX 1 (continued): use statusColors[o.status] ?? statusColors.default */}
                          <span className={`inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full capitalize ${statusColors[o.status] ?? statusColors.default}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link href={`/admin/orders/${o._id}`} className="text-xs font-medium text-yellow-500 hover:text-yellow-400 transition-colors">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="md:hidden divide-y divide-gray-50 dark:divide-gray-800">
                {stats.recentOrders.map((o) => (
                  <Link
                    key={o._id}
                    href={`/admin/orders/${o._id}`}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {o.user?.name ?? <span className="italic text-gray-400">Guest</span>}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        #{o._id.slice(-6).toUpperCase()} · ${o.total.toLocaleString()}
                      </p>
                    </div>
                    {/* FIX 1 (continued): same fix applied to mobile status badge */}
                    <span className={`inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full capitalize ${statusColors[o.status] ?? statusColors.default}`}>
                      {o.status}
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}