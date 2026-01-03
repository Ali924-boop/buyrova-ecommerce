"use client";
import React from "react";

const AdminTopbar = () => {
  return (
    <div className="h-16 bg-white flex items-center justify-between px-6 shadow-md sticky top-0 z-20">
      <h1 className="font-bold text-lg text-gray-900">Admin Dashboard</h1>
      <div className="flex items-center gap-4">
        <span className="text-gray-700">Admin</span>
        <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminTopbar;
