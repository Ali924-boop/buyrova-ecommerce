"use client";
import React, { useState } from "react";
import Link from "next/link";

interface CartItem {
  _id: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
}

const initialCart: CartItem[] = [
  {
    _id: "1",
    title: "Summer Hoodie",
    slug: "summer-hoodie",
    price: 1599,
    quantity: 1,
    image: "/products/f1.jpg",
  },
  {
    _id: "2",
    title: "Luxury Sofa",
    slug: "luxury-sofa",
    price: 4999,
    quantity: 2,
    image: "/products/f2.jpg",
  },
  {
    _id: "3",
    title: "Ergonomic Chair",
    slug: "ergonomic-chair",
    price: 1299,
    quantity: 1,
    image: "/products/f3.jpg",
  },
];

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>(initialCart);

  const handleQuantityChange = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemove = (id: string) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="pt-24 px-4 md:px-12 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Your Cart
      </h1>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Cart Items */}
        <div className="flex-1 flex flex-col gap-4">
          {cart.length === 0 && (
            <p className="text-center text-gray-600 mt-8">
              Your cart is empty.
            </p>
          )}

          {cart.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex flex-col">
                  <h2 className="text-gray-900 font-semibold">{item.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleQuantityChange(item._id, -1)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                    >
                      -
                    </button>
                    <span className="px-3">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item._id, 1)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-gray-900 font-semibold">
                  ${item.price * item.quantity}
                </p>
                <button
                  onClick={() => handleRemove(item._id)}
                  className="text-red-500 hover:underline text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

       {/* Summary / Checkout */}
<div className="lg:w-1/3 bg-white p-6 rounded-xl shadow flex flex-col gap-4">
  <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
  <div className="flex justify-between text-gray-700 font-medium">
    <span>Subtotal</span>
    <span>${total}</span>
  </div>
  <div className="flex justify-between text-gray-700 font-medium">
    <span>Shipping</span>
    <span>${cart.length === 0 ? 0 : 99}</span>
  </div>
  <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-xl">
    <span>Total</span>
    <span>${total + (cart.length === 0 ? 0 : 99)}</span>
  </div>

  <Link
    href="/checkout"
    className="mt-4 block text-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded transition"
  >
    Proceed to Checkout
  </Link>
</div>
      </div>
    </div>
  );
};

export default CartPage;
