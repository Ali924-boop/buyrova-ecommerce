"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiArrowLeft, FiPackage, FiTruck, FiCheckCircle,
  FiXCircle, FiClock, FiRefreshCw, FiShoppingBag,
  FiMapPin, FiCreditCard, FiCalendar, FiHash,
} from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  _id:    string;
  title?: string;
  price?: number;
  images?: string[];
}

interface OrderProduct {
  product?:     Product;
  quantity:     number;
  color?:       string;
  size?:        string;
}

interface Order {
  _id:            string;
  status:         string;
  total:          number;
  createdAt:      string;
  updatedAt?:     string;
  products?:      OrderProduct[];
  name?:          string;
  email?:         string;
  phone?:         string;
  address?:       string;
  city?:          string;
  zip?:           string;
  country?:       string;
  paymentMethod?: string;
  qrReference?:   string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, {
  label:  string;
  color:  string;
  bg:     string;
  border: string;
  icon:   React.ReactNode;
  step:   number;
}> = {
  pending: {
    label: "Pending",   color: "text-yellow-500",
    bg: "bg-yellow-500/10", border: "border-yellow-500/25",
    icon: <FiClock size={12} />, step: 0,
  },
  processing: {
    label: "Processing", color: "text-blue-400",
    bg: "bg-blue-500/10", border: "border-blue-500/25",
    icon: <FiRefreshCw size={12} />, step: 1,
  },
  shipped: {
    label: "Shipped",   color: "text-purple-400",
    bg: "bg-purple-500/10", border: "border-purple-500/25",
    icon: <FiTruck size={12} />, step: 2,
  },
  delivered: {
    label: "Delivered", color: "text-emerald-400",
    bg: "bg-emerald-500/10", border: "border-emerald-500/25",
    icon: <FiCheckCircle size={12} />, step: 3,
  },
  cancelled: {
    label: "Cancelled", color: "text-red-400",
    bg: "bg-red-500/10", border: "border-red-500/25",
    icon: <FiXCircle size={12} />, step: -1,
  },
};

const TRACK_STEPS = [
  { key: "pending",    label: "Order Placed", icon: FiShoppingBag },
  { key: "processing", label: "Processing",   icon: FiRefreshCw   },
  { key: "shipped",    label: "Shipped",      icon: FiTruck       },
  { key: "delivered",  label: "Delivered",    icon: FiCheckCircle },
];

// ─── Tracking Bar ─────────────────────────────────────────────────────────────

function TrackingBar({ status }: { status: string }) {
  const cfg         = STATUS_CFG[status];
  const currentStep = cfg?.step ?? 0;

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl
        bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
        <FiXCircle size={14} /> This order was cancelled.
      </div>
    );
  }

  const progressPercent = (currentStep / (TRACK_STEPS.length - 1)) * 100;

  return (
    <div className="flex items-center justify-between relative py-2">
      {/* Track background */}
      <div className="absolute top-6 left-4 right-4 h-0.5 bg-gray-800 z-0" />
      {/* Track fill */}
      <div
        className="absolute top-6 left-4 h-0.5 bg-yellow-500 z-0 transition-all duration-700"
        style={{ width: `calc(${progressPercent}% * (100% - 2rem) / 100%)` }}
      />
      {TRACK_STEPS.map((step, i) => {
        const done    = i <= currentStep;
        const current = i === currentStep;
        const Icon    = step.icon;
        return (
          <div key={step.key} className="flex flex-col items-center gap-2 flex-1 relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center
              transition-all duration-300
              ${done ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30" : "bg-gray-800 text-gray-600"}
              ${current ? "ring-4 ring-yellow-500/20 scale-110" : ""}`}>
              <Icon size={13} />
            </div>
            <span className={`text-[10px] font-semibold text-center leading-tight
              ${done ? "text-yellow-500" : "text-gray-600"}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: {
  icon: React.ReactNode; label: string; value?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center
        shrink-0 text-gray-500 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-600 mb-0.5">
          {label}
        </p>
        <p className="text-sm text-gray-300">{value}</p>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-600 mb-3">
      {children}
    </p>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params                    = useParams();
  const id                        = params?.id as string;
  const [order,   setOrder]       = useState<Order | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error,   setError]       = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "Order not found." : "Failed to load order.");
        return r.json();
      })
      .then((d) => { setOrder(d); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, [id]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500
          rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center
            justify-center mx-auto">
            <FiPackage size={28} className="text-gray-600" />
          </div>
          <p className="text-gray-400 font-medium">{error || "Order not found."}</p>
          <Link href="/account/orders"
            className="inline-flex items-center gap-2 text-yellow-500
              hover:text-yellow-400 text-sm font-medium transition-colors">
            <FiArrowLeft size={13} /> Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const cfg       = STATUS_CFG[order.status] ?? STATUS_CFG.pending;
  const itemCount = order.products?.reduce((s, p) => s + p.quantity, 0) ?? 0;

  // Build shipping address string
  const addressParts = [order.address, order.city, order.zip, order.country].filter(Boolean);
  const fullAddress  = addressParts.join(", ");

  return (
    <div className="min-h-screen bg-gray-950 px-4 sm:px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <Link href="/account/orders"
            className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800
              flex items-center justify-center text-gray-500
              hover:text-white hover:border-gray-700 transition-all">
            <FiArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">
              Order{" "}
              <span className="font-mono text-yellow-500">
                #{order._id.slice(-8).toUpperCase()}
              </span>
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}
              {" · "}
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Status badge */}
          <span className={`ml-auto inline-flex items-center gap-1.5 text-[11px]
            font-semibold px-3 py-1 rounded-full border capitalize shrink-0
            ${cfg.color} ${cfg.bg} ${cfg.border}`}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        {/* ── Tracking ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
        >
          <SectionLabel>Order Status</SectionLabel>
          <TrackingBar status={order.status} />
        </motion.div>

        {/* ── Products ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
        >
          <SectionLabel>Items ({itemCount})</SectionLabel>
          <div className="space-y-3">
            {order.products?.map((p, i) => (
              <div key={i}
                className="flex items-center gap-4 bg-gray-800/50 rounded-xl px-4 py-3">
                {/* Image */}
                <div className="w-14 h-14 rounded-xl bg-gray-700 overflow-hidden
                  shrink-0 flex items-center justify-center">
                  {p.product?.images?.[0] ? (
                    <Image
                      src={p.product.images[0]}
                      alt={p.product?.title ?? "Product"}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiPackage size={18} className="text-gray-600" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {p.product?.title ?? "Product"}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-gray-500 text-xs">Qty: {p.quantity}</span>
                    {p.color && (
                      <span className="text-gray-600 text-xs">· {p.color}</span>
                    )}
                    {p.size && (
                      <span className="text-gray-600 text-xs">· Size {p.size}</span>
                    )}
                    {p.product?.price != null && (
                      <span className="text-gray-500 text-xs">
                        · ${p.product.price} each
                      </span>
                    )}
                  </div>
                </div>

                {/* Line total */}
                {p.product?.price != null && (
                  <span className="text-white font-bold text-sm shrink-0">
                    ${(p.product.price * p.quantity).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Order total */}
          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-gray-500 text-sm">Order Total</span>
            <span className="text-white font-bold text-lg">
              ${(order.total ?? 0).toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* ── Shipping + Payment ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Shipping */}
          {(order.name || fullAddress) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4"
            >
              <SectionLabel>Shipping Details</SectionLabel>
              <InfoRow icon={<FiPackage  size={14} />} label="Recipient" value={order.name}  />
              <InfoRow icon={<FiMapPin   size={14} />} label="Address"   value={fullAddress || undefined} />
            </motion.div>
          )}

          {/* Payment + Meta */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4"
          >
            <SectionLabel>Order Info</SectionLabel>
            <InfoRow
              icon={<FiHash size={14} />}
              label="Order ID"
              value={order._id.slice(-8).toUpperCase()}
            />
            <InfoRow
              icon={<FiCalendar size={14} />}
              label="Placed On"
              value={new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}
            />
            <InfoRow
              icon={<FiCreditCard size={14} />}
              label="Payment"
              value={
                order.paymentMethod
                  ? order.paymentMethod.charAt(0).toUpperCase() +
                    order.paymentMethod.slice(1)
                  : undefined
              }
            />
            {order.qrReference && (
              <InfoRow
                icon={<FiHash size={14} />}
                label="Reference"
                value={order.qrReference}
              />
            )}
          </motion.div>
        </div>

        {/* ── Footer actions ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center justify-between pt-2"
        >
          <Link
            href="/account/orders"
            className="flex items-center gap-2 text-gray-500 hover:text-white
              text-sm transition-colors"
          >
            <FiArrowLeft size={13} /> All Orders
          </Link>

          <Link
            href="/shop"
            className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400
              text-sm font-medium transition-colors"
          >
            Continue Shopping →
          </Link>
        </motion.div>

      </div>
    </div>
  );
}