"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPackage, FiArrowRight, FiArrowLeft, FiChevronDown,
  FiChevronUp, FiShoppingBag, FiClock, FiTruck,
  FiCheckCircle, FiXCircle, FiRefreshCw,
} from "react-icons/fi";

interface Product {
  _id: string;
  title?: string;
  price?: number;
  images?: string[];
}

interface OrderProduct {
  quantity: number;
  product?: Product;
}

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  products?: OrderProduct[];
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  step: number;
}> = {
  pending: {
    label: "Pending",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/25",
    icon: <FiClock size={11} />,
    step: 0,
  },
  processing: {
    label: "Processing",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    icon: <FiRefreshCw size={11} />,
    step: 1,
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/25",
    icon: <FiTruck size={11} />,
    step: 2,
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    icon: <FiCheckCircle size={11} />,
    step: 3,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
    icon: <FiXCircle size={11} />,
    step: -1,
  },
};

const TRACK_STEPS = [
  { key: "pending",    label: "Order Placed", icon: FiShoppingBag },
  { key: "processing", label: "Processing",   icon: FiRefreshCw   },
  { key: "shipped",    label: "Shipped",      icon: FiTruck       },
  { key: "delivered",  label: "Delivered",    icon: FiCheckCircle },
];

// ── Tracker bar ───────────────────────────────────────────────────────────────

function TrackingBar({ status }: { status: string }) {
  // BUG FIX #1: Use nullish coalescing with explicit fallback step value (0)
  const cfg = STATUS_CFG[status];
  const currentStep = cfg?.step ?? 0;
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl
        bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
        <FiXCircle size={14} /> This order was cancelled.
      </div>
    );
  }

  // BUG FIX #2: Removed bogus `calc` variable hack. Use the literal 100 directly,
  // and guard against division by zero (TRACK_STEPS.length - 1 = 3, always safe here).
  const progressPercent = (currentStep / (TRACK_STEPS.length - 1)) * 100;

  return (
    <div className="flex items-center justify-between relative">
      {/* Background connector line */}
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-800 z-0" />

      {/* BUG FIX #3: Progress fill — was referencing undefined `calc` variable */}
      <div
        className="absolute top-4 left-4 h-0.5 bg-yellow-500 z-0 transition-all duration-500"
        style={{ width: `calc(${progressPercent}% * (100% - 2rem) / 100%)` }}
      />

      {TRACK_STEPS.map((step, i) => {
        const done    = i <= currentStep;
        const current = i === currentStep;
        const Icon    = step.icon;
        return (
          <div key={step.key} className="flex flex-col items-center gap-2 flex-1 relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              done
                ? "bg-yellow-500 text-white shadow-md shadow-yellow-500/20"
                : "bg-gray-800 text-gray-600"
            } ${current ? "ring-4 ring-yellow-500/20" : ""}`}>
              <Icon size={13} />
            </div>
            <span className={`text-[10px] font-semibold text-center ${
              done ? "text-yellow-500" : "text-gray-600"
            }`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Order card ────────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  // BUG FIX #4: Fallback to `pending` config for any unknown status string
  const cfg = STATUS_CFG[order.status] ?? STATUS_CFG.pending;
  const itemCount = order.products?.reduce((s, p) => s + p.quantity, 0) ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden
        hover:border-gray-700 transition-colors duration-200"
    >
      {/* ── ROW ── */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center
          justify-center shrink-0 text-gray-500">
          <FiPackage size={18} />
        </div>

        {/* Meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold font-mono text-sm">
              #{order._id.slice(-8).toUpperCase()}
            </span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold
              px-2.5 py-0.5 rounded-full border capitalize
              ${cfg.color} ${cfg.bg} ${cfg.border}`}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
            {itemCount > 0 && ` · ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* BUG FIX #5: Guard against undefined `total` before calling toLocaleString */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-white font-bold text-sm">
            ${(order.total ?? 0).toLocaleString()}
          </span>
          {expanded
            ? <FiChevronUp size={14} className="text-gray-600" />
            : <FiChevronDown size={14} className="text-gray-600" />
          }
        </div>
      </div>

      {/* ── EXPANDED ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-gray-800 pt-4">

              {/* Tracking bar */}
              <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase
                  text-gray-600 mb-3">
                  Order Status
                </p>
                <TrackingBar status={order.status} />
              </div>

              {/* Products */}
              {order.products && order.products.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold tracking-widest uppercase
                    text-gray-600 mb-3">
                    Items
                  </p>
                  <div className="space-y-2">
                    {order.products.map((p, i) => (
                      <div key={i}
                        className="flex items-center gap-3 bg-gray-800/50
                          rounded-xl px-4 py-3">
                        {/* BUG FIX #6: Next.js <Image> requires width + height props */}
                        <div className="w-10 h-10 rounded-lg bg-gray-700
                          overflow-hidden shrink-0 flex items-center justify-center">
                          {p.product?.images?.[0] ? (
                            <Image
                              src={p.product.images[0]}
                              alt={p.product?.title ?? "Product"}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiPackage size={14} className="text-gray-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {p.product?.title ?? "Product"}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            Qty: {p.quantity}
                            {/* BUG FIX #7: Safe optional chaining already present,
                                but ensure price display is safe */}
                            {p.product?.price != null && ` · $${p.product.price}`}
                          </p>
                        </div>

                        {/* BUG FIX #8: Guard `price * quantity` with null check */}
                        {p.product?.price != null && (
                          <span className="text-white text-sm font-semibold shrink-0">
                            ${(p.product.price * p.quantity).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order total */}
              <div className="flex items-center justify-between pt-2
                border-t border-gray-800">
                <span className="text-gray-500 text-sm">Order Total</span>
                {/* BUG FIX #9: Guard total here too */}
                <span className="text-white font-bold text-base">
                  ${(order.total ?? 0).toLocaleString()}
                </span>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch("/api/orders", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((d) => {
        setOrders(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch((e: Error) => {
        // BUG FIX #10: Typed catch parameter as Error for proper message access
        setError(e.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 px-4 sm:px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/account/profile"
            className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800
              flex items-center justify-center text-gray-500
              hover:text-white hover:border-gray-700 transition-all">
            <FiArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">My Orders</h1>
            {!loading && (
              <p className="text-gray-500 text-sm mt-0.5">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-yellow-500/20
              border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl
            flex flex-col items-center justify-center py-16 gap-3">
            <FiXCircle size={28} className="text-red-400" />
            <p className="text-red-400 text-sm font-medium">{error}</p>
            <Link href="/account/login"
              className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors">
              Sign in to view orders →
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl
            flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl
              flex items-center justify-center">
              <FiPackage className="text-gray-600 text-2xl" />
            </div>
            <div className="text-center">
              <p className="text-gray-400 font-medium">No orders yet</p>
              <p className="text-gray-600 text-sm mt-1">
                Your orders will appear here once placed
              </p>
            </div>
            <Link href="/shop"
              className="flex items-center gap-1.5 text-yellow-500
                hover:text-yellow-400 text-sm font-medium transition-colors">
              Start Shopping <FiArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}