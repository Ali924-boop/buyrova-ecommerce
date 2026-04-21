"use client";
import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiUser, FiPackage, FiHeart, FiLogOut, FiEdit2, FiSave, FiX,
} from "react-icons/fi";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  products?: { quantity: number; product?: { title?: string } }[];
}

function ProfileInner() {
  const { data: session, update } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;

  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setOrders(d.slice(0, 5)); })
      .catch(() => {});
  }, [user]);

  const saveName = async () => {
    if (!user?.id) return;
    setSaving(true);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await update({ name });
    setSaving(false);
    setEditing(false);
  };

  const navItems = [
    { href: "/account/profile", label: "Profile", icon: FiUser },
    { href: "/account/orders", label: "My Orders", icon: FiPackage },
    { href: "/account/wishlist", label: "Wishlist", icon: FiHeart },
  ];
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-950 px-4 sm:px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">My Account</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-1">
              <div className="flex items-center gap-3 pb-4 mb-3 border-b border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{user?.name || "User"}</p>
                  <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                </div>
              </div>
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${pathname === href ? "bg-yellow-500/10 text-yellow-400" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
                  <Icon size={14} /> {label}
                </Link>
              ))}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-gray-800 transition mt-2"
              >
                <FiLogOut size={14} /> Sign Out
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3 space-y-5">
            {/* Profile Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">Profile Information</h2>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs text-yellow-400 border border-yellow-500/30 hover:border-yellow-500/60 rounded-lg px-3 py-1.5 transition">
                    <FiEdit2 size={12} /> Edit
                  </button>
                ) : (
                  <button onClick={() => setEditing(false)} className="text-gray-500 hover:text-white transition">
                    <FiX size={16} />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                  {editing ? (
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-yellow-500 transition" />
                  ) : (
                    <p className="text-white text-sm">{user?.name || "—"}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                  <p className="text-white text-sm">{user?.email || "—"}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Role</label>
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${user?.role === "admin" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-gray-800 text-gray-400 border-gray-700"}`}>
                    {user?.role === "admin" ? "Admin" : "Customer"}
                  </span>
                </div>
                {editing && (
                  <button onClick={saveName} disabled={saving} className="flex items-center gap-1.5 text-xs bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg transition disabled:opacity-50">
                    <FiSave size={12} /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                <h2 className="text-base font-semibold text-white">Recent Orders</h2>
                <Link href="/account/orders" className="text-xs text-yellow-400 hover:text-yellow-300 transition">View all →</Link>
              </div>
              {orders.length === 0 ? (
                <div className="px-5 py-10 text-center text-gray-600 text-sm">No orders yet</div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {orders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-white text-sm font-mono">#{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColors[order.status] || "bg-gray-800 text-gray-400 border-gray-700"}`}>
                        {order.status}
                      </span>
                      <p className="text-white text-sm font-bold">${order.total}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <SessionProvider>
      <ProfileInner />
    </SessionProvider>
  );
}
