"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { FiShoppingBag, FiHome, FiPackage, FiCheckCircle } from "react-icons/fi";

const steps = [
  { icon: FiCheckCircle, label: "Order Confirmed", desc: "We've received your order"   },
  { icon: FiPackage,     label: "Being Prepared",  desc: "Your items are being packed" },
  { icon: FiShoppingBag, label: "On The Way",      desc: "Shipped and heading to you"  },
];

// ── FIX: useSearchParams must live inside a Suspense boundary at build time.
// Split into an inner component that uses the hook, wrapped by the exported
// page component which provides the <Suspense> boundary.
// ─────────────────────────────────────────────────────────────────────────────

function SuccessContent() {
  const params         = useSearchParams();
  const orderIdFromUrl = params.get("orderId");

  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const localOrderId = localStorage.getItem("lastOrderId");
        const finalOrderId = orderIdFromUrl || localOrderId;
        if (!finalOrderId) { setLoading(false); return; }

        const res  = await fetch(`/api/orders/${finalOrderId}`, { credentials: "include" });
        const data = res.ok ? await res.json() : null;
        setOrderId(data?._id || finalOrderId);

        localStorage.removeItem("lastOrderId");
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
      <div className="min-h-screen flex items-center justify-center
        bg-gray-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-yellow-500/30
            border-t-yellow-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading your order…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center
      bg-gradient-to-br from-gray-50 via-white to-yellow-50/30
      dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950
      px-4 py-12">

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1     }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl
          border border-gray-100 dark:border-neutral-800 overflow-hidden">

          {/* Accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r
            from-yellow-400 via-yellow-500 to-orange-400" />

          <div className="px-8 py-10 flex flex-col items-center text-center gap-6">

            {/* Animated check */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br
                from-yellow-400 to-orange-500 flex items-center justify-center
                shadow-lg shadow-yellow-200 dark:shadow-yellow-900/30">
                <svg className="w-12 h-12 text-white" fill="none"
                  stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <motion.path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                  />
                </svg>
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-yellow-400/40"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 1.2, delay: 0.4,
                  repeat: Infinity, repeatDelay: 1 }}
              />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-2"
            >
              <h1 className="text-2xl sm:text-3xl font-bold
                text-gray-900 dark:text-white">
                Order Placed Successfully!
              </h1>
              <p className="text-gray-500 dark:text-gray-400
                text-sm sm:text-base leading-relaxed">
                Thank you for shopping with{" "}
                <span className="font-semibold text-yellow-500">BuyRova</span>.
                We&apos;ll process your order shortly.
              </p>
            </motion.div>

            {/* Order ID */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="w-full"
            >
              {orderId ? (
                <div className="bg-gray-50 dark:bg-neutral-800
                  border border-gray-200 dark:border-neutral-700
                  rounded-2xl px-5 py-4">
                  <p className="text-[11px] font-semibold tracking-widest uppercase
                    text-gray-400 dark:text-gray-500 mb-1">
                    Order ID
                  </p>
                  <p className="font-mono text-sm font-bold
                    text-gray-800 dark:text-white break-all select-all">
                    {orderId}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">
                    Save this ID to track your order
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20
                  border border-amber-200 dark:border-amber-500/30
                  rounded-2xl px-5 py-4">
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                    Order placed! Check your email for confirmation details.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Steps */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="w-full"
            >
              <div className="flex items-start justify-between relative">
                <div className="absolute top-4 left-[16%] right-[16%] h-0.5
                  bg-gray-100 dark:bg-neutral-800 z-0" />
                {steps.map((step, i) => (
                  <div key={step.label}
                    className="flex flex-col items-center gap-2 flex-1 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      i === 0
                        ? "bg-yellow-500 text-white shadow-md shadow-yellow-200 dark:shadow-yellow-900/30"
                        : "bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-gray-600"
                    }`}>
                      <step.icon size={14} />
                    </div>
                    <div className="text-center">
                      <p className={`text-[11px] font-semibold ${
                        i === 0
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400 dark:text-gray-600"
                      }`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-600
                        mt-0.5 hidden sm:block">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="w-full flex flex-col sm:flex-row gap-3 pt-2"
            >
              <Link href="/account/orders" className="flex-1">
                <motion.span
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 w-full
                    bg-yellow-500 hover:bg-yellow-600 text-white
                    px-5 py-3 rounded-xl font-semibold text-sm
                    transition-colors duration-150 shadow-sm
                    shadow-yellow-200 dark:shadow-yellow-900/20 cursor-pointer"
                >
                  <FiPackage size={15} /> Track My Order
                </motion.span>
              </Link>

              <Link href="/shop" className="flex-1">
                <motion.span
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 w-full
                    bg-white dark:bg-neutral-800
                    border border-gray-200 dark:border-neutral-700
                    text-gray-700 dark:text-gray-300
                    hover:border-yellow-400 dark:hover:border-yellow-500
                    hover:text-yellow-600 dark:hover:text-yellow-400
                    px-5 py-3 rounded-xl font-semibold text-sm
                    transition-all duration-150 shadow-sm cursor-pointer"
                >
                  <FiShoppingBag size={15} /> Continue Shopping
                </motion.span>
              </Link>
            </motion.div>

            <Link href="/"
              className="flex items-center gap-1.5 text-xs
                text-gray-400 dark:text-gray-600
                hover:text-yellow-500 dark:hover:text-yellow-400
                transition-colors">
              <FiHome size={11} /> Back to Home
            </Link>

          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-xs text-gray-400
            dark:text-gray-600 mt-5"
        >
          A confirmation email will be sent to your registered email address.
        </motion.p>

      </motion.div>
    </div>
  );
}

// ── Fallback shown while useSearchParams resolves during SSR ─────────────────
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center
      bg-gray-50 dark:bg-neutral-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-yellow-500/30
          border-t-yellow-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading your order…</p>
      </div>
    </div>
  );
}

// ── Exported page wraps the content in Suspense ──────────────────────────────
export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}