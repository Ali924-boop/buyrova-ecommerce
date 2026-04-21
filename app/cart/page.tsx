"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import CartItem from "@/components/CartItem";
import {
  FiShoppingCart,
  FiArrowRight,
  FiTag,
  FiArrowLeft,
  FiCheck,
} from "react-icons/fi";

interface CartItemType {
  _id: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
}

const CartPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const SHIPPING_THRESHOLD = 100;
  const SHIPPING_COST = 9.99;

  // ✅ SAFE CART LOADER + SYNC FIX
  // 📍 FILE: app/cart/page.tsx

  useEffect(() => {
    const syncCart = () => {
      try {
        const stored = localStorage.getItem("cart");
        const parsed = stored ? JSON.parse(stored) : [];

        setCart(Array.isArray(parsed) ? parsed : []);
      } catch {
        setCart([]);
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

  // ✅ SAFE PERSIST
  const persistCart = (updated: CartItemType[]) => {
    const safe = Array.isArray(updated) ? updated : [];

    setCart(safe);
    localStorage.setItem("cart", JSON.stringify(safe));

    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleQuantityChange = (id: string, delta: number) => {
    const updated = cart.map((item) =>
      item._id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );

    persistCart(updated);
  };

  const handleRemove = (id: string) => {
    persistCart(cart.filter((item) => item._id !== id));
  };

  // ✅ SAFE REDUCE (NO CRASH EVER)
  // 📍 FILE: app/cart/page.tsx

  const subtotal = Array.isArray(cart)
    ? cart.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 1);
    }, 0)
    : 0;

  const discount = promoApplied ? subtotal * 0.1 : 0;

  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= SHIPPING_THRESHOLD
        ? 0
        : SHIPPING_COST;

  const total = subtotal - discount + shipping;

  const applyPromo = () => {
    if (promo.toLowerCase() === "buyrova10") {
      setPromoApplied(true);
    } else {
      setPromoApplied(false);
    }
  };

  // ✅ LOADING FIX
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // EMPTY CART UI
  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-5"
        >
          <div className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mx-auto">
            <FiShoppingCart className="text-gray-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Your cart is empty</h1>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Start shopping now!
          </p>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl"
          >
            Continue Shopping <FiArrowRight />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/shop" className="text-gray-500 hover:text-white">
            <FiArrowLeft size={20} />
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
            <p className="text-gray-400 text-sm">
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
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

          {/* SUMMARY */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">

              <h2 className="text-white font-semibold">Order Summary</h2>

              <div className="text-sm space-y-2">

                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className="text-white">
                    {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t border-gray-800 pt-2 flex justify-between text-white font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

              </div>

              {/* PROMO */}
              <div className="flex gap-2">
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Promo code"
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm"
                />

                <button
                  onClick={applyPromo}
                  className="bg-gray-800 px-3 py-2 rounded-lg text-sm text-white"
                >
                  Apply
                </button>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl text-center block"
              >
                Checkout
              </Link>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;