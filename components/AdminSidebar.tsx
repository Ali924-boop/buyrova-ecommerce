"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiBox, FiShoppingCart, FiUsers, FiChevronDown, FiHome, FiPlus } from "react-icons/fi";

const AdminSidebar: React.FC = () => {
  const [openProducts, setOpenProducts] = useState(false);
  const [openOrders, setOpenOrders] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4 }}
      className="w-64 bg-gray-900 text-white p-6 flex flex-col h-screen fixed shadow-md overflow-y-auto"
    >
      <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
      <ul className="flex flex-col gap-2">

        {/* Dashboard */}
        <li>
          <Link
            href="/admin/products"
            className="flex items-center gap-2 hover:text-yellow-400 px-2 py-1 rounded"
          >
            <FiHome /> Dashboard
          </Link>
        </li>

        {/* Products Section */}
        <li>
          <button
            onClick={() => setOpenProducts(!openProducts)}
            className="flex items-center justify-between w-full gap-2 px-2 py-1 rounded hover:text-yellow-400"
          >
            <span className="flex items-center gap-2">
              <FiBox /> Products
            </span>
            <FiChevronDown
              className={`transition-transform ${openProducts ? "rotate-180" : ""}`}
            />
          </button>
          {openProducts && (
            <ul className="ml-6 flex flex-col gap-1 mt-1">
              <li>
                <Link
                  href="/admin/products"
                  className="flex items-center gap-1 text-sm hover:text-yellow-300"
                >
                  List Products
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/products/add"
                  className="flex items-center gap-1 text-sm hover:text-yellow-300"
                >
                  <FiPlus /> Add Product
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Orders Section */}
        <li>
          <button
            onClick={() => setOpenOrders(!openOrders)}
            className="flex items-center justify-between w-full gap-2 px-2 py-1 rounded hover:text-yellow-400"
          >
            <span className="flex items-center gap-2">
              <FiShoppingCart /> Orders
            </span>
            <FiChevronDown
              className={`transition-transform ${openOrders ? "rotate-180" : ""}`}
            />
          </button>
          {openOrders && (
            <ul className="ml-6 flex flex-col gap-1 mt-1">
              <li>
                <Link
                  href="/admin/orders"
                  className="text-sm hover:text-yellow-300"
                >
                  List Orders
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Users Section */}
        <li>
          <button
            onClick={() => setOpenUsers(!openUsers)}
            className="flex items-center justify-between w-full gap-2 px-2 py-1 rounded hover:text-yellow-400"
          >
            <span className="flex items-center gap-2">
              <FiUsers /> Users
            </span>
            <FiChevronDown
              className={`transition-transform ${openUsers ? "rotate-180" : ""}`}
            />
          </button>
          {openUsers && (
            <ul className="ml-6 flex flex-col gap-1 mt-1">
              <li>
                <Link
                  href="/admin/users"
                  className="text-sm hover:text-yellow-300"
                >
                  List Users
                </Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </motion.div>
  );
};

export default AdminSidebar;
