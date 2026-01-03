"use client";
import React from "react";
import Link from "next/link";

const AdminHome = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Welcome to Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/products" className="p-6 bg-white shadow rounded hover:shadow-lg transition">
          <h3 className="font-bold text-lg">Products</h3>
        </Link>
        <Link href="/admin/orders" className="p-6 bg-white shadow rounded hover:shadow-lg transition">
          <h3 className="font-bold text-lg">Orders</h3>
        </Link>
        <Link href="/admin/users" className="p-6 bg-white shadow rounded hover:shadow-lg transition">
          <h3 className="font-bold text-lg">Users</h3>
        </Link>
      </div>
    </div>
  );
};

export default AdminHome;
