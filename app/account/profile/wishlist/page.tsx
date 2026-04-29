"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FiHeart,
  FiShoppingCart,
  FiTrash2,
  FiArrowLeft,
  FiPackage,
} from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WishlistItem {
  _id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  addedAt: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ── Auth guard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/account/wishlist");
    }
  }, [status, router]);

  // ── Fetch wishlist ───────────────────────────────────────────────────────────
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/account/wishlist");
      if (!res.ok) throw new Error("Failed to load wishlist");
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchWishlist();
  }, [status, fetchWishlist]);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ── Remove from wishlist ─────────────────────────────────────────────────────
  const handleRemove = async (itemId: string) => {
    setRemovingId(itemId);
    try {
      const res = await fetch(`/api/account/wishlist/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove item");
      setItems((prev) => prev.filter((i) => i._id !== itemId));
      showToast("Removed from wishlist");
    } catch {
      showToast("Could not remove item. Try again.");
    } finally {
      setRemovingId(null);
    }
  };

  // ── Add to cart ──────────────────────────────────────────────────────────────
  const handleAddToCart = async (item: WishlistItem) => {
    if (!item.inStock) return;
    setAddingToCartId(item._id);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      showToast(`"${item.name}" added to cart`);
    } catch {
      showToast("Could not add to cart. Try again.");
    } finally {
      setAddingToCartId(null);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm tracking-widest uppercase">
            Loading wishlist…
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  // ── Error state ───────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-rose-400 text-lg">{error}</p>
          <button
            onClick={fetchWishlist}
            className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-sm transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-zinc-800 border border-zinc-700 text-white text-sm px-5 py-3 rounded-xl shadow-2xl animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-zinc-800 bg-[#0f0f0f]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link
            href="/account"
            className="text-zinc-400 hover:text-white transition"
            aria-label="Back to account"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <FiHeart className="text-rose-500" size={20} />
            <h1 className="text-lg font-semibold tracking-tight">My Wishlist</h1>
          </div>
          {items.length > 0 && (
            <span className="ml-auto text-xs text-zinc-500">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <FiHeart size={32} className="text-zinc-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-zinc-200">
                Your wishlist is empty
              </h2>
              <p className="text-zinc-500 text-sm max-w-xs">
                Save items you love and come back to them anytime.
              </p>
            </div>
            <Link
              href="/shop"
              className="mt-2 inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-full text-sm font-medium transition"
            >
              <FiPackage size={15} />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <WishlistCard
                key={item._id}
                item={item}
                isRemoving={removingId === item._id}
                isAddingToCart={addingToCartId === item._id}
                onRemove={() => handleRemove(item._id)}
                onAddToCart={() => handleAddToCart(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Wishlist Card ─────────────────────────────────────────────────────────────

interface CardProps {
  item: WishlistItem;
  isRemoving: boolean;
  isAddingToCart: boolean;
  onRemove: () => void;
  onAddToCart: () => void;
}

function WishlistCard({
  item,
  isRemoving,
  isAddingToCart,
  onRemove,
  onAddToCart,
}: CardProps) {
  const discount =
    item.originalPrice && item.originalPrice > item.price
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : null;

  return (
    <div
      className={`group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 ${
        isRemoving ? "opacity-40 scale-95" : "hover:border-zinc-700"
      }`}
    >
      {/* Image */}
      <Link href={`/product/${item.slug}`} className="block relative aspect-square">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Out of stock overlay */}
        {!item.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-xs font-semibold tracking-widest uppercase text-zinc-300 bg-zinc-900/80 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {/* Discount badge */}
        {discount && (
          <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </div>
        )}
        {/* Remove button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
          disabled={isRemoving}
          aria-label="Remove from wishlist"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-zinc-900/80 border border-zinc-700 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-600 hover:border-rose-600 transition-all duration-200"
        >
          <FiTrash2 size={13} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-3">
        <Link href={`/product/${item.slug}`}>
          <h3 className="text-sm font-medium text-zinc-100 line-clamp-2 hover:text-white transition leading-snug">
            {item.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-white">
            ${item.price.toFixed(2)}
          </span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-xs text-zinc-500 line-through">
              ${item.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={onAddToCart}
          disabled={!item.inStock || isAddingToCart}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            item.inStock
              ? "bg-zinc-800 hover:bg-rose-600 text-zinc-200 hover:text-white border border-zinc-700 hover:border-rose-600"
              : "bg-zinc-800/50 text-zinc-600 border border-zinc-800 cursor-not-allowed"
          }`}
        >
          {isAddingToCart ? (
            <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiShoppingCart size={14} />
          )}
          {isAddingToCart
            ? "Adding…"
            : item.inStock
            ? "Add to Cart"
            : "Unavailable"}
        </button>
      </div>
    </div>
  );
}