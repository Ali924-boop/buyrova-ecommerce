"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const params = useSearchParams();
  const orderIdFromUrl = params.get("orderId");

  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // fallback priority:
        // 1. URL orderId
        // 2. localStorage lastOrderId (safe backup)

        const localOrderId = localStorage.getItem("lastOrderId");

        const finalOrderId = orderIdFromUrl || localOrderId;

        if (!finalOrderId) {
          setOrderId(null);
          setLoading(false);
          return;
        }

        // optional verification (safe API check)
        const res = await fetch(`/api/orders/${finalOrderId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          setOrderId(finalOrderId); // still show it
        } else {
          const data = await res.json();
          setOrderId(data?._id || finalOrderId);
        }
      } catch {
        setOrderId(orderIdFromUrl);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderIdFromUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500">Loading order...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-8 max-w-md w-full text-center space-y-5"
      >

        {/* Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Order Placed Successfully
        </h1>

        <p className="text-gray-500 text-sm">
          Thank you for your order. We’ve received it and will process it shortly.
        </p>

        {/* Order ID */}
        {orderId ? (
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
            Order ID: <span className="font-mono">{orderId}</span>
          </div>
        ) : (
          <div className="bg-red-100 dark:bg-red-900 p-3 rounded text-sm text-red-600">
            Order ID not found
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/shop"
            className="bg-yellow-500 hover:bg-yellow-400 text-black py-2 rounded font-semibold"
          >
            Continue Shopping
          </Link>

          <Link
            href="/"
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm"
          >
            Go to Home
          </Link>
        </div>

      </motion.div>
    </div>
  );
}