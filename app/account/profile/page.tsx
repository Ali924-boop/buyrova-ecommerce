"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiUser, FiPackage } from "react-icons/fi";

interface Order {
  _id: string;
  createdAt: string;
  total: number;
}

interface User {
  name: string;
  email: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ BASE URL FIX (IMPORTANT)
        const baseUrl =
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000";

        // 👤 USER API
        const userRes = await fetch(`${baseUrl}/api/user`);

        if (!userRes.ok) {
          throw new Error(`User API Error: ${userRes.status}`);
        }

        const userData = await userRes.json();

        // 📦 ORDERS API
        const orderRes = await fetch(`${baseUrl}/api/orders`);

        if (!orderRes.ok) {
          throw new Error(`Orders API Error: ${orderRes.status}`);
        }

        const orderData = await orderRes.json();

        // ✅ SAFE DATA SET
        setUser(userData?.user || null);
        setOrders(orderData?.orders || []);

      } catch (err: unknown) {
        console.error("Account page error:", err);
        const errorMessage = err instanceof Error ? err.message : "Something went wrong";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔄 LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  // ❌ ERROR
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <p className="text-red-500 font-semibold mb-2">Error</p>
        <p className="text-gray-500">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 sm:px-6 lg:px-12 py-24">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          My Account
        </h1>

        <Link href="/" className="flex items-center gap-2 text-sm text-yellow-500">
          <FiArrowLeft /> Back
        </Link>
      </div>

      <div className="max-w-5xl mx-auto grid gap-6">

        {/* PROFILE */}
        <section className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <FiUser className="text-yellow-500" />
            <h2 className="text-xl font-semibold">Profile Info</h2>
          </div>

          {user ? (
            <div className="space-y-1">
              <p><span className="font-medium">Name:</span> {user.name}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
            </div>
          ) : (
            <p className="text-gray-500">No user found</p>
          )}
        </section>

        {/* ORDERS */}
        <section className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <FiPackage className="text-yellow-500" />
            <h2 className="text-xl font-semibold">Orders</h2>
          </div>

          {orders.length ? (
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o._id}
                  className="flex justify-between items-center p-3 border rounded dark:border-gray-800"
                >
                  <div>
                    <p className="font-mono text-xs">#{o._id.slice(-6)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="font-semibold text-yellow-500">
                    Rs. {o.total}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No orders found</p>
          )}
        </section>
      </div>
    </div>
  );
}