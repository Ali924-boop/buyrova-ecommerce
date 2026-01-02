"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const AdminSidebar: React.FC = () => {
  return (
    <motion.div
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-64 h-screen bg-gray-100 text-gray-900 p-6 fixed shadow-md"
    >
      <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
      <ul className="flex flex-col gap-4">
        <li>
          <Link href="/admin/dashboard" className="hover:text-yellow-500 transition">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/admin/products" className="hover:text-yellow-500 transition">
            Products
          </Link>
        </li>
        <li>
          <Link href="/admin/orders" className="hover:text-yellow-500 transition">
            Orders
          </Link>
        </li>
        <li>
          <Link href="/admin/users" className="hover:text-yellow-500 transition">
            Users
          </Link>
        </li>
      </ul>
    </motion.div>
  );
};

export default AdminSidebar;
