"use client";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import { FiLogOut, FiUser } from "react-icons/fi";

const AdminTopbar = () => {
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <div className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="font-bold text-lg text-white">Admin Dashboard</h1>

      <div className="flex items-center gap-4">
        {/* Admin info */}
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
            <FiUser className="text-gray-900 text-sm" />
          </div>
          <div className="hidden sm:block">
            <p className="text-white font-medium leading-none">
              {session?.user?.name || "Admin"}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {session?.user?.email || ""}
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
        >
          <FiLogOut className="text-sm" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminTopbar;