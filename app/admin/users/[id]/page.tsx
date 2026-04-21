"use client";
import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiUser, FiCalendar, FiShoppingBag } from "react-icons/fi";

interface UserDetail {
  _id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((r) => r.json())
      .then((d) => { setUser(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading)
    return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" /></div>;
  if (!user)
    return <div className="text-center text-gray-500 py-12">User not found.</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="text-gray-500 hover:text-white transition">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-white">User Details</h1>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <FiUser className="text-yellow-400 text-2xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user.name}</h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
          <span className={`ml-auto px-3 py-1 text-xs font-semibold rounded-full border ${user.role === "admin" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-gray-800 text-gray-400 border-gray-700"}`}>
            {user.role === "admin" ? "Admin" : "Customer"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <FiCalendar size={11} /> User ID
            </div>
            <p className="text-white text-sm font-mono">{user._id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <FiShoppingBag size={11} /> Role
            </div>
            <p className="text-white text-sm capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
