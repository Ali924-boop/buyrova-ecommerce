"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  FiUser, FiPackage, FiHeart, FiSettings,
  FiMessageSquare, FiChevronRight, FiArrowLeft,
  FiShoppingBag, FiLogOut, FiEdit2, FiShield,
} from "react-icons/fi";

interface Order {
  _id: string;
  createdAt: string;
  total: number;
  status?: string;
}

const STATUS_STYLES: Record<string, string> = {
  delivered:  "bg-green-50 text-green-700 border border-green-200",
  shipped:    "bg-blue-50 text-blue-700 border border-blue-200",
  processing: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  pending:    "bg-yellow-50 text-yellow-700 border border-yellow-200",
  cancelled:  "bg-red-50 text-red-600 border border-red-200",
};

const QUICK_LINKS = [
  { href: "/account/orders",   icon: <FiPackage size={16} />,     label: "My Orders", descKey: "orders" as const },
  { href: "/account/wishlist", icon: <FiHeart size={16} />,       label: "Wishlist",  desc: "Saved items"        },
  { href: "/account/messages", icon: <FiMessageSquare size={16}/>, label: "Messages",  desc: "Support & updates"  },
  { href: "/account/settings", icon: <FiSettings size={16} />,    label: "Settings",  desc: "Account & privacy"  },
];

export default function AccountPage() {
  const router = useRouter();

  // ✅ NextAuth session
  const { data: session, status } = useSession();

  const [orders,  setOrders]  = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // ✅ Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/account/login");
    }
  }, [status, router]);

  // ✅ Fetch orders once session is ready
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders", { credentials: "include" });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data?.orders ?? []);
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [status]);

  // ✅ Loading screen while session resolves
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading your account…</p>
        </div>
      </div>
    );
  }

  // ✅ Guard — never render without session
  if (!session?.user) return null;

  const user = session.user;

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const recentOrders = orders.slice(0, 3);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/account/login" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Background refresh bar */}
      {ordersLoading && (
        <div className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-yellow-100 dark:bg-yellow-900/30">
          <div className="h-full w-1/3 bg-yellow-500 animate-pulse" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-16 space-y-4">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            <Link href="/" className="hover:text-yellow-500 transition">Home</Link>
            {" / "}
            <span className="text-gray-700 dark:text-gray-300 font-medium">Account</span>
          </p>
          <Link href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-yellow-500
              transition font-medium border border-gray-200 dark:border-gray-700
              px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900">
            <FiArrowLeft size={13} /> Back to shop
          </Link>
        </div>

        {/* ── Hero card ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800
          rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">

          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name ?? "User"}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-yellow-300 flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-yellow-500 ring-2 ring-yellow-200
              flex items-center justify-center text-white font-medium text-xl
              flex-shrink-0 select-none">
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {user.name}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5 truncate">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700
                dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800
                rounded-full px-3 py-1 font-medium">
                BuyRova Member
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600
                dark:text-gray-400 rounded-full px-3 py-1 font-medium">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1 text-xs bg-green-50 dark:bg-green-900/20
                text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800
                rounded-full px-3 py-1 font-medium">
                <FiShield size={10} /> Verified
              </span>
            </div>
          </div>

          <Link href="/account/settings"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl
              border border-gray-200 dark:border-gray-700 text-sm font-medium
              text-gray-700 dark:text-gray-300 hover:border-yellow-400
              hover:text-yellow-500 transition bg-white dark:bg-gray-900">
            <FiEdit2 size={13} /> Edit profile
          </Link>
        </div>

        {/* ── Quick links ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_LINKS.map(({ href, icon, label, desc, descKey }) => (
            <Link key={href} href={href}
              className="group bg-white dark:bg-gray-900 rounded-2xl border
                border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-3
                hover:border-yellow-300 dark:hover:border-yellow-600
                hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-yellow-50 dark:bg-yellow-900/20
                text-yellow-500 flex items-center justify-center
                group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                {icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {descKey === "orders"
                    ? `${orders.length} order${orders.length !== 1 ? "s" : ""}`
                    : desc}
                </p>
              </div>
              <FiChevronRight size={13}
                className="text-gray-300 group-hover:text-yellow-400 transition-colors mt-auto self-end" />
            </Link>
          ))}
        </div>

        {/* ── Recent orders ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500 flex items-center justify-center">
                <FiPackage size={13} />
              </div>
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">Recent Orders</h2>
            </div>
            {orders.length > 3 && (
              <Link href="/account/orders"
                className="text-xs text-yellow-500 hover:text-yellow-600 font-medium transition flex items-center gap-1">
                View all <FiChevronRight size={11} />
              </Link>
            )}
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-14">
              <div className="w-6 h-6 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {recentOrders.map((order) => {
                const status      = order.status || "processing";
                const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.processing;
                return (
                  <Link key={order._id} href="/account/orders"
                    className="flex items-center justify-between px-5 py-3.5
                      hover:bg-gray-50 dark:hover:bg-gray-800/40 transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <FiShoppingBag size={13} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-PK", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyle}`}>
                        {status}
                      </span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white min-w-[72px] text-right">
                        Rs. {order.total.toLocaleString()}
                      </p>
                      <FiChevronRight size={13} className="text-gray-300 group-hover:text-yellow-400 transition flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <FiShoppingBag size={20} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">No orders yet</p>
              <p className="text-xs text-gray-400">Your orders will appear here once you shop</p>
              <Link href="/shop"
                className="mt-2 px-5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-medium transition">
                Start shopping
              </Link>
            </div>
          )}
        </div>

        {/* ── Profile details ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500 flex items-center justify-center">
                <FiUser size={13} />
              </div>
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">Profile Details</h2>
            </div>
            <Link href="/account/settings"
              className="text-xs text-yellow-500 hover:text-yellow-600 font-medium transition flex items-center gap-1">
              Edit <FiChevronRight size={11} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
            {[
              { label: "Full name",     value: user.name  ?? "—" },
              { label: "Email address", value: user.email ?? "—" },
              { label: "Phone", value: user.phone || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800/60 rounded-xl px-4 py-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sign out ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800
          px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Sign out of your account</p>
            <p className="text-xs text-gray-400 mt-0.5">You'll need to log in again to access your orders and profile.</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border
              border-red-200 dark:border-red-900/50 text-red-500 text-sm font-medium
              hover:bg-red-50 dark:hover:bg-red-900/20 transition">
            <FiLogOut size={14} /> Sign out
          </button>
        </div>

      </div>
    </div>
  );
}