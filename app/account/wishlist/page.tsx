"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiShoppingCart, FiTrash2 } from "react-icons/fi";

interface WishlistItem {
  _id: string;
  title: string;
  slug: string;
  price: number;
  image: string;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const load = () => {
    const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(stored);
  };

  useEffect(() => { load(); }, []);

  const remove = (id: string) => {
    const updated = wishlist.filter((i) => i._id !== id);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  const addToCart = (item: WishlistItem) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((i: { _id: string }) => i._id === item._id);
    if (existing) existing.quantity = (existing.quantity || 1) + 1;
    else cart.push({ ...item, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    remove(item._id);
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 sm:px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Wishlist</h1>
          <p className="text-gray-400 text-sm mt-1">{wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center">
              <FiHeart className="text-gray-600 text-2xl" />
            </div>
            <p className="text-gray-500 text-sm">Your wishlist is empty</p>
            <Link href="/shop" className="text-yellow-400 hover:text-yellow-300 text-sm transition">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {wishlist.map((item) => (
              <div key={item._id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition group">
                <div className="relative h-48 bg-gray-800">
                  <Image
                    src={item.image || "/placeholder.jpg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <button
                    onClick={() => remove(item._id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-gray-950/80 border border-gray-700 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-500/40 transition opacity-0 group-hover:opacity-100"
                    aria-label="Remove from wishlist"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-white text-sm font-semibold truncate">{item.title}</h3>
                  <p className="text-yellow-400 font-bold mt-1">${item.price.toLocaleString()}</p>
                  <button
                    onClick={() => addToCart(item)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-2 rounded-lg transition"
                  >
                    <FiShoppingCart size={12} /> Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
