"use client";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import { FiBell, FiLogOut, FiUser } from "react-icons/fi";

const AdminTopbar = () => {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;

  return (
    <header className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-yellow-500 rounded-full" />
        <h1 className="font-semibold text-white text-sm hidden sm:block">Admin Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell placeholder */}
        <button className="relative w-9 h-9 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-700 transition">
          <FiBell size={16} />
        </button>

        {/* Admin info */}
        <div className="flex items-center gap-2.5 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5">
          <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <FiUser className="text-yellow-400 text-xs" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-white leading-tight">{user?.name || "Admin"}</p>
            <p className="text-xs text-gray-500 leading-tight capitalize">{user?.role || "admin"}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-1.5 text-xs text-red-400 border border-red-500/30 hover:border-red-500/60 hover:text-red-300 rounded-lg px-3 py-1.5 transition"
        >
          <FiLogOut size={13} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
