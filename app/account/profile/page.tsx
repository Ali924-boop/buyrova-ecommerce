"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiUser, FiPackage, FiHeart, FiSettings,
  FiMessageSquare, FiChevronRight, FiArrowLeft, FiShoppingBag,
} from "react-icons/fi";

interface Order {
  _id: string;
  createdAt: string;
  total: number;
  status?: string;
}

interface User {
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  createdAt?: string;  // FIX: added so "Member since" is dynamic
}

const STATUS_STYLES: Record<string, string> = {
  delivered:  "bg-green-50 text-green-700",
  shipped:    "bg-blue-50 text-blue-700",
  processing: "bg-yellow-50 text-yellow-700",
  pending:    "bg-yellow-50 text-yellow-700",
  cancelled:  "bg-red-50 text-red-600",
};

export default function AccountPage() {
  const [user,    setUser]    = useState<User | null>(null);
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // FIX: use relative URLs — no need for window.location.origin in Next.js
        const [userRes, orderRes] = await Promise.all([
          fetch("/api/user",   { credentials: "include" }),
          fetch("/api/orders", { credentials: "include" }),
        ]);

        if (userRes.status  === 401) throw new Error("Please sign in to view your account");
        if (orderRes.status === 401) throw new Error("Please sign in to view your account");
        if (!userRes.ok)  throw new Error(`Failed to load user (${userRes.status})`);
        if (!orderRes.ok) throw new Error(`Failed to load orders (${orderRes.status})`);

        const userData  = await userRes.json();
        const orderData = await orderRes.json();

        setUser(userData?.user ?? userData ?? null);
        // FIX: handle both { orders: [] } and plain [] response shapes
        setOrders(Array.isArray(orderData) ? orderData : orderData?.orders ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-yellow-200 border-t-yellow-500
            rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading your account…</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen
        bg-gray-50 gap-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <FiShoppingBag size={24} className="text-red-400" />
        </div>
        <p className="text-gray-900 font-semibold">Something went wrong</p>
        <p className="text-sm text-gray-400 text-center max-w-xs">{error}</p>
        {error.includes("sign in") ? (
          <Link href="/account/login"
            className="px-5 py-2.5 bg-yellow-500 text-white rounded-xl
              font-semibold text-sm hover:bg-yellow-600 transition">
            Sign in
          </Link>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-yellow-500 text-white rounded-xl
              font-semibold text-sm hover:bg-yellow-600 transition"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  // FIX: dynamic "Member since" from user.createdAt
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long", year: "numeric",
      })
    : "—";

  const recentOrders = orders.slice(0, 3);

  const quickLinks = [
    { href: "/account/orders",   icon: <FiPackage size={18} />,       label: "My Orders", desc: `${orders.length} order${orders.length !== 1 ? "s" : ""}` },
    { href: "/account/wishlist", icon: <FiHeart size={18} />,         label: "Wishlist",  desc: "Saved items"        },
    { href: "/account/messages", icon: <FiMessageSquare size={18} />, label: "Messages",  desc: "Support & updates"  },
    { href: "/account/settings", icon: <FiSettings size={18} />,      label: "Settings",  desc: "Account & privacy"  },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2
        flex items-center justify-between">
        <p className="text-sm text-gray-400">
          <Link href="/" className="hover:text-yellow-500 transition">Home</Link>
          {" / "}
          <span className="text-gray-700 font-medium">Account</span>
        </p>
        <Link href="/"
          className="flex items-center gap-1.5 text-sm text-gray-500
            hover:text-yellow-500 transition font-medium">
          <FiArrowLeft size={15} /> Back to shop
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* ── Hero card ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover
                  ring-4 ring-yellow-200 flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-yellow-500
                ring-4 ring-yellow-200 flex items-center justify-center
                text-white font-bold text-2xl select-none flex-shrink-0">
                {initials}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {user?.name || "Welcome back"}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5 truncate">{user?.email}</p>
              {user?.phone && (
                <p className="text-sm text-gray-400 mt-0.5">{user.phone}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs bg-yellow-50 text-yellow-700
                  border border-yellow-200 rounded-full px-3 py-1 font-semibold">
                  BuyRova Member
                </span>
                <span className="text-xs bg-gray-100 text-gray-600
                  rounded-full px-3 py-1 font-medium">
                  {orders.length} order{orders.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <Link href="/account/settings"
              className="flex-shrink-0 px-4 py-2 rounded-xl border border-gray-200
                text-sm font-semibold text-gray-700 hover:border-yellow-400
                hover:text-yellow-500 transition flex items-center gap-2">
              <FiSettings size={15} /> Edit profile
            </Link>
          </div>
        </div>

        {/* ── Quick links ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map(({ href, icon, label, desc }) => (
            <Link key={href} href={href}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100
                p-5 flex flex-col gap-3 hover:border-yellow-300
                hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-500
                flex items-center justify-center group-hover:bg-yellow-500
                group-hover:text-white transition-colors duration-200">
                {icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <FiChevronRight size={14}
                className="text-gray-300 group-hover:text-yellow-400
                  transition-colors mt-auto self-end" />
            </Link>
          ))}
        </div>

        {/* ── Recent orders ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-100
            flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-500
                flex items-center justify-center">
                <FiPackage size={15} />
              </div>
              <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
            </div>
            {orders.length > 3 && (
              <Link href="/account/orders"
                className="text-sm text-yellow-500 hover:text-yellow-600
                  font-semibold transition flex items-center gap-1">
                View all <FiChevronRight size={13} />
              </Link>
            )}
          </div>

          {recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => {
                const status      = order.status || "processing";
                const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.processing;
                return (
                  // FIX: link goes to orders page (expand by ID if you add deep-link support)
                  <Link key={order._id} href="/account/orders"
                    className="flex items-center justify-between px-6 py-4
                      hover:bg-gray-50 transition group">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-gray-100
                        flex items-center justify-center flex-shrink-0">
                        <FiShoppingBag size={15} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 font-mono">
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-PK", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-semibold px-2.5 py-1
                        rounded-full capitalize ${statusStyle}`}>
                        {status}
                      </span>
                      <p className="text-sm font-bold text-gray-900
                        min-w-[80px] text-right">
                        Rs. {order.total.toLocaleString()}
                      </p>
                      <FiChevronRight size={15}
                        className="text-gray-300 group-hover:text-yellow-400
                          transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-50
                flex items-center justify-center">
                <FiShoppingBag size={22} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">No orders yet</p>
              <p className="text-xs text-gray-400">
                Your orders will appear here once you shop
              </p>
              <Link href="/shop"
                className="mt-2 px-5 py-2.5 rounded-xl bg-yellow-500 text-white
                  text-sm font-semibold hover:bg-yellow-600 transition shadow-sm">
                Start shopping
              </Link>
            </div>
          )}
        </div>

        {/* ── Profile details ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-500
                flex items-center justify-center">
                <FiUser size={15} />
              </div>
              <h2 className="text-base font-bold text-gray-900">Profile Details</h2>
            </div>
            <Link href="/account/settings"
              className="text-sm text-yellow-500 hover:text-yellow-600
                font-semibold transition flex items-center gap-1">
              Edit <FiChevronRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Full name",      value: user?.name           },
              { label: "Email address",  value: user?.email          },
              { label: "Phone",          value: user?.phone || "—"   },
              { label: "Member since",   value: memberSince          }, // FIX: dynamic
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-gray-400
                  uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}