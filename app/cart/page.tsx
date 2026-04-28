"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import CartItem from "@/components/CartItem";
import {
  FiShoppingCart, FiArrowRight, FiArrowLeft,
  FiTrash2, FiTag, FiTruck, FiShield, FiRefreshCw,
} from "react-icons/fi";

interface CartItemType {
  _id: string;
  productId?: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
}

const SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST      = 250;
const PROMO_CODE         = "buyrova10";
const PROMO_DISCOUNT     = 0.1;

const formatRs = (value: number) =>
  Math.round(value).toLocaleString("en-PK");

export default function CartPage() {
  const { theme, setTheme } = useTheme();
  const [mounted,       setMounted]       = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [cart,          setCart]          = useState<CartItemType[]>([]);
  const [promo,         setPromo]         = useState("");
  const [promoApplied,  setPromoApplied]  = useState(false);
  const [promoError,    setPromoError]    = useState("");
  const [clearConfirm,  setClearConfirm]  = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const syncCart = () => {
      try {
        const stored = localStorage.getItem("cart");
        const parsed = stored ? JSON.parse(stored) : [];
        setCart(Array.isArray(parsed) ? parsed : []);
      } catch {
        setCart([]);
      } finally {
        setLoading(false);
      }
    };
    syncCart();
    window.addEventListener("storage",     syncCart);
    window.addEventListener("cartUpdated", syncCart);
    return () => {
      window.removeEventListener("storage",     syncCart);
      window.removeEventListener("cartUpdated", syncCart);
    };
  }, []);

  const persistCart = (updated: CartItemType[]) => {
    const safe = Array.isArray(updated) ? updated : [];
    setCart(safe);
    localStorage.setItem("cart", JSON.stringify(safe));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleQuantityChange = (id: string, delta: number) => {
    persistCart(cart.map((item) => {
      const match = item._id === id || item.productId === id;
      return match ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item;
    }));
  };

  const handleRemove = (id: string) =>
    persistCart(cart.filter((item) => item._id !== id && item.productId !== id));

  const handleClearCart = () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 3000);
      return;
    }
    persistCart([]);
    setClearConfirm(false);
    setPromoApplied(false);
    setPromo("");
    setPromoError("");
  };

  const applyPromo = () => {
    if (promo.trim().toLowerCase() === PROMO_CODE) {
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoApplied(false);
      setPromoError("Invalid promo code. Try BUYROVA10.");
    }
  };

  const removePromo = () => {
    setPromoApplied(false);
    setPromo("");
    setPromoError("");
  };

  const subtotal           = Math.round(cart.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0));
  const discount           = promoApplied ? Math.round(subtotal * PROMO_DISCOUNT) : 0;
  const shipping           = subtotal === 0 ? 0 : subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total              = subtotal - discount + shipping;
  const totalItems         = cart.reduce((s, i) => s + (i.quantity || 1), 0);
  const shippingProgress   = Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100);
  const amountToFree       = Math.max(0, SHIPPING_THRESHOLD - subtotal);
  const checkoutHref       = cart.length > 0
    ? `/checkout?subtotal=${subtotal}&discount=${discount}&shipping=${shipping}&total=${total}`
    : "#";

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center
        bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-yellow-500
            border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading cart…</p>
        </div>
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center px-4
        bg-gray-50 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-sm w-full"
        >
          <div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center
            bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800
            shadow-sm">
            <FiShoppingCart className="text-gray-300 dark:text-gray-700" size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Looks like you haven&apos;t added anything yet.
            </p>
          </div>
          <Link href="/shop"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400
              text-black font-bold px-8 py-3.5 rounded-xl transition-colors shadow-sm
              shadow-yellow-200 dark:shadow-yellow-900/20">
            Browse Products <FiArrowRight size={16} />
          </Link>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              { icon: FiTruck,      label: "Free Shipping",  sub: "Over Rs 5,000" },
              { icon: FiShield,     label: "Secure Payment", sub: "100% safe"     },
              { icon: FiRefreshCw,  label: "Easy Returns",   sub: "30-day policy" },
            ].map((b) => (
              <div key={b.label}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl
                  bg-white dark:bg-gray-900 border border-gray-100
                  dark:border-gray-800 text-center">
                <b.icon size={16} className="text-yellow-500" />
                <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  {b.label}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-600">{b.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950
      transition-colors duration-300">

      {/* Theme toggle */}
      {mounted && (
        <div className="flex justify-end px-4 sm:px-6 pt-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm
              font-medium border transition-all
              bg-white dark:bg-gray-800
              border-gray-200 dark:border-gray-700
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === "dark" ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                strokeWidth={2} viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      )}

      <div className="px-4 sm:px-6 py-6 pb-24 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/shop" aria-label="Back to shop"
              className="w-9 h-9 rounded-xl flex items-center justify-center
                text-gray-500 dark:text-gray-400
                hover:text-gray-900 dark:hover:text-white
                bg-white dark:bg-gray-900
                border border-gray-200 dark:border-gray-800
                hover:border-gray-300 dark:hover:border-gray-700 transition-all">
              <FiArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Shopping Cart
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button onClick={handleClearCart}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl
              text-xs sm:text-sm font-medium border transition-all
              ${clearConfirm
                ? "bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-800 hover:text-red-500"
              }`}>
            <FiTrash2 size={13} />
            {clearConfirm ? "Tap again to confirm" : "Clear cart"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Cart items ───────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div
                  key={item._id || item.productId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" as const }}
                  layout
                >
                  <CartItem
                    {...item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Trust badges — desktop only below items */}
            <div className="hidden sm:grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: FiTruck,     label: "Free Shipping",  sub: "Orders over Rs 5,000" },
                { icon: FiShield,    label: "Secure Payment", sub: "Encrypted & safe"      },
                { icon: FiRefreshCw, label: "Easy Returns",   sub: "30-day return policy"  },
              ].map((b) => (
                <div key={b.label}
                  className="flex items-center gap-3 p-3 rounded-xl
                    bg-white dark:bg-gray-900
                    border border-gray-100 dark:border-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-500/10
                    flex items-center justify-center shrink-0">
                    <b.icon size={14} className="text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {b.label}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-600">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Order summary ────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="rounded-2xl border p-5 space-y-4
              bg-white dark:bg-gray-900
              border-gray-100 dark:border-gray-800 shadow-sm">

              <h2 className="font-bold text-gray-900 dark:text-white">
                Order Summary
              </h2>

              {/* Free shipping progress */}
              {subtotal < SHIPPING_THRESHOLD && subtotal > 0 && (
                <div className="space-y-2 bg-yellow-50 dark:bg-yellow-500/5
                  border border-yellow-200 dark:border-yellow-500/20
                  rounded-xl px-3 py-3">
                  <div className="flex items-center gap-2">
                    <FiTruck size={13} className="text-yellow-600 dark:text-yellow-400 shrink-0" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Add{" "}
                      <span className="font-bold text-yellow-600 dark:text-yellow-400">
                        Rs {formatRs(amountToFree)}
                      </span>{" "}
                      more for free shipping
                    </p>
                  </div>
                  <div className="h-1.5 bg-yellow-100 dark:bg-yellow-500/20
                    rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {subtotal >= SHIPPING_THRESHOLD && (
                <div className="flex items-center gap-2 text-green-600
                  dark:text-green-400 text-xs font-semibold
                  bg-green-50 dark:bg-green-500/10
                  border border-green-200 dark:border-green-500/20
                  rounded-xl px-3 py-2.5">
                  <svg className="w-4 h-4 shrink-0" fill="none"
                    stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  You&apos;ve unlocked free shipping! 🎉
                </div>
              )}

              {/* Line items */}
              <div className="text-sm space-y-2.5">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    Rs {formatRs(subtotal)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount (10%)</span>
                    <span className="font-medium">−Rs {formatRs(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className={shipping === 0
                    ? "text-green-600 dark:text-green-400 font-medium"
                    : "text-gray-900 dark:text-white font-medium"}>
                    {shipping === 0 ? "FREE" : `Rs ${formatRs(shipping)}`}
                  </span>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800
                  pt-2.5 flex justify-between
                  text-gray-900 dark:text-white font-bold text-base">
                  <span>Total</span>
                  <span className="text-yellow-500">Rs {formatRs(total)}</span>
                </div>
              </div>

              {/* Promo code */}
              <div className="space-y-2">
                {!promoApplied ? (
                  <>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <FiTag size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2
                            text-gray-400 dark:text-gray-600" />
                        <input
                          value={promo}
                          onChange={(e) => {
                            setPromo(e.target.value);
                            setPromoError("");
                          }}
                          onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                          placeholder="Promo code"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border
                            outline-none transition-colors
                            bg-gray-50 dark:bg-gray-800
                            border-gray-200 dark:border-gray-700
                            text-gray-900 dark:text-white
                            placeholder-gray-400 dark:placeholder-gray-600
                            focus:border-yellow-500 dark:focus:border-yellow-500"
                        />
                      </div>
                      <button onClick={applyPromo}
                        className="px-4 py-2 rounded-xl text-sm font-semibold
                          transition-colors whitespace-nowrap
                          bg-gray-100 dark:bg-gray-800
                          border border-gray-200 dark:border-gray-700
                          text-gray-700 dark:text-gray-300
                          hover:bg-gray-200 dark:hover:bg-gray-700">
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-red-500 dark:text-red-400 pl-1">
                        {promoError}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl
                    bg-green-50 dark:bg-green-950/50
                    border border-green-200 dark:border-green-900">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0"
                        fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                        BUYROVA10 applied — 10% off!
                      </span>
                    </div>
                    <button onClick={removePromo}
                      className="text-xs text-green-600 dark:text-green-500
                        hover:underline ml-2 shrink-0">
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Checkout button */}
              <Link href={checkoutHref} aria-disabled={cart.length === 0}
                className={`w-full py-3.5 rounded-xl text-center font-bold text-sm
                  flex items-center justify-center gap-2 transition-all
                  ${cart.length > 0
                    ? "bg-yellow-500 hover:bg-yellow-400 text-black shadow-sm shadow-yellow-200 dark:shadow-yellow-900/20"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed pointer-events-none"
                  }`}>
                Proceed to Checkout <FiArrowRight size={15} />
              </Link>

              <Link href="/shop"
                className="w-full py-2.5 rounded-xl text-center text-sm font-medium
                  flex items-center justify-center gap-1.5 transition-colors
                  text-gray-500 dark:text-gray-400
                  hover:text-gray-900 dark:hover:text-white
                  hover:bg-gray-50 dark:hover:bg-gray-800">
                <FiArrowLeft size={13} /> Continue Shopping
              </Link>

              {/* Security note */}
              <div className="flex items-center justify-center gap-1.5
                text-[11px] text-gray-400 dark:text-gray-600">
                <FiShield size={11} />
                Secure checkout — encrypted & safe
              </div>
            </div>

            {/* Mobile trust badges */}
            <div className="grid grid-cols-3 gap-2 sm:hidden">
              {[
                { icon: FiTruck,     label: "Free Shipping" },
                { icon: FiShield,    label: "Secure Pay"    },
                { icon: FiRefreshCw, label: "Easy Returns"  },
              ].map((b) => (
                <div key={b.label}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center
                    bg-white dark:bg-gray-900
                    border border-gray-100 dark:border-gray-800">
                  <b.icon size={14} className="text-yellow-500" />
                  <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                    {b.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}