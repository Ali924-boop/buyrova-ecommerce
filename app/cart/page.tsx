"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import CartItem from "@/components/CartItem";
import {
  FiShoppingCart,
  FiArrowRight,
  FiArrowLeft,
  FiTrash2,
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
const SHIPPING_COST = 250;

// ✅ Fix 1: safe integer formatter — avoids float artifacts like 349.9999
const formatRs = (value: number) =>
  Math.round(value).toLocaleString("en-PK");

const CartPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [clearConfirm, setClearConfirm] = useState(false);

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
    window.addEventListener("storage", syncCart);
    window.addEventListener("cartUpdated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
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
    const updated = cart.map((item) => {
      const match = item._id === id || item.productId === id;
      return match
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item;
    });
    persistCart(updated);
  };

  const handleRemove = (id: string) => {
    persistCart(
      cart.filter((item) => item._id !== id && item.productId !== id)
    );
  };

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
    if (promo.trim().toLowerCase() === "buyrova10") {
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

  // ✅ Fix 1: all values rounded to avoid float display artifacts
  const subtotal = Array.isArray(cart)
    ? Math.round(cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0))
    : 0;

  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;

  const shipping =
    subtotal === 0 ? 0 : subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  const total = subtotal - discount + shipping;

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const shippingProgress = Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);

  // ✅ Fix 3: build checkout URL with order summary as query params
  const checkoutHref =
    cart.length > 0
      ? `/checkout?subtotal=${subtotal}&discount=${discount}&shipping=${shipping}&total=${total}`
      : "#";

  // ── Loading ──
  if (loading) {
    return (
      // ✅ Fix 4: pt-20 so content clears fixed navbar
      <div className="pt-20 min-h-screen flex items-center justify-center
        bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading cart...</p>
        </div>
      </div>
    );
  }

  // ── Empty cart ──
  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4
        bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-5"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center
            bg-gray-100 dark:bg-gray-900
            border border-gray-200 dark:border-gray-800">
            <FiShoppingCart className="text-gray-400 dark:text-gray-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your cart is empty
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
            Add items to your cart and they'll appear here.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400
              text-black font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Continue Shopping <FiArrowRight />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    // ✅ Fix 4: pt-20 on main wrapper so navbar doesn't overlap
    <div className="pt-20 min-h-screen transition-colors duration-300
      bg-gray-50 dark:bg-gray-950">

      {/* Theme toggle */}
      <div className="flex justify-end px-4 sm:px-6 pt-4">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all
              bg-white dark:bg-gray-800
              border-gray-200 dark:border-gray-700
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === "dark" ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        )}
      </div>

      <div className="px-4 sm:px-6 py-6 pb-16 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              aria-label="Back to shop"
              className="p-2 rounded-lg transition-colors
                text-gray-500 dark:text-gray-500
                hover:text-gray-900 dark:hover:text-white
                hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FiArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Shopping Cart
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
                {cart.length !== totalItems &&
                  ` (${cart.length} product${cart.length !== 1 ? "s" : ""})`}
              </p>
            </div>
          </div>

          <button
            onClick={handleClearCart}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              clearConfirm
                ? "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-800 hover:text-red-500 dark:hover:text-red-400"
            }`}
          >
            <FiTrash2 size={14} />
            {clearConfirm ? "Tap again to confirm" : "Clear cart"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {/* ✅ Fix 5: mode="popLayout" prevents layout jump on item removal */}
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div
                  key={item._id || item.productId}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, paddingBottom: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
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
          </div>

          {/* Order Summary — sticky on desktop */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="rounded-xl border p-5 space-y-4 transition-colors
              bg-white dark:bg-gray-900
              border-gray-100 dark:border-gray-800">

              <h2 className="font-semibold text-gray-900 dark:text-white">
                Order Summary
              </h2>

              {/* Free shipping progress */}
              {subtotal < SHIPPING_THRESHOLD && (
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add{" "}
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                      Rs {formatRs(amountToFreeShipping)}
                    </span>{" "}
                    more for free shipping
                  </p>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {subtotal >= SHIPPING_THRESHOLD && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                  You've unlocked free shipping!
                </div>
              )}

              {/* Line items */}
              <div className="text-sm space-y-2.5">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    Rs {formatRs(subtotal)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount (10%)</span>
                    <span>−Rs {formatRs(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className={
                    shipping === 0
                      ? "text-green-600 dark:text-green-400 font-medium"
                      : "text-gray-900 dark:text-white font-medium"
                  }>
                    {shipping === 0 ? "FREE" : `Rs ${formatRs(shipping)}`}
                  </span>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5 flex justify-between
                  text-gray-900 dark:text-white font-bold text-base">
                  <span>Total</span>
                  <span>Rs {formatRs(total)}</span>
                </div>
              </div>

              {/* Promo code */}
              <div className="space-y-2">
                {!promoApplied ? (
                  <>
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      <input
                        value={promo}
                        onChange={(e) => {
                          setPromo(e.target.value);
                          setPromoError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                        placeholder="Promo code"
                        className="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm border outline-none transition-colors
                          bg-gray-50 dark:bg-gray-800
                          border-gray-200 dark:border-gray-700
                          text-gray-900 dark:text-white
                          placeholder-gray-400 dark:placeholder-gray-600
                          focus:border-yellow-500 dark:focus:border-yellow-500"
                      />
                      <button
                        onClick={applyPromo}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                          bg-gray-100 dark:bg-gray-800
                          border border-gray-200 dark:border-gray-700
                          text-gray-700 dark:text-gray-300
                          hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-red-500 dark:text-red-400">{promoError}</p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg
                    bg-green-50 dark:bg-green-950
                    border border-green-200 dark:border-green-900">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        BUYROVA10 applied
                      </span>
                    </div>
                    <button
                      onClick={removePromo}
                      className="text-xs text-green-600 dark:text-green-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* ✅ Fix 3: passes order data to checkout via query params */}
              <Link
                href={checkoutHref}
                aria-disabled={cart.length === 0}
                className={`w-full py-3.5 rounded-xl text-center font-bold text-sm block transition-all ${
                  cart.length > 0
                    ? "bg-yellow-500 hover:bg-yellow-400 text-black"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed pointer-events-none"
                }`}
              >
                Proceed to Checkout →
              </Link>

              <Link
                href="/shop"
                className="w-full py-2.5 rounded-xl text-center text-sm font-medium block transition-colors
                  text-gray-500 dark:text-gray-400
                  hover:text-gray-900 dark:hover:text-white
                  hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;