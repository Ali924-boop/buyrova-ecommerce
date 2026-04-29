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
  FiShare2,
  FiCheck,
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

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/2" />
        <div className="h-9 bg-gray-100 dark:bg-gray-800 rounded-xl mt-2" />
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  msg: string;
  type: "success" | "error";
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [items, setItems]               = useState<WishlistItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [removingId, setRemovingId]     = useState<string | null>(null);
  const [addingId, setAddingId]         = useState<string | null>(null);
  const [addedIds, setAddedIds]         = useState<Set<string>>(new Set());
  const [toasts, setToasts]             = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  // ── Auth guard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/account/login?callbackUrl=/account/wishlist");
    }
  }, [status, router]);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    const id = toastCounter + 1;
    setToastCounter(id);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, [toastCounter]);

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

  // ── Remove ───────────────────────────────────────────────────────────────────
  const handleRemove = async (itemId: string, name: string) => {
    setRemovingId(itemId);
    try {
      const res = await fetch(`/api/account/wishlist/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems(prev => prev.filter(i => i._id !== itemId));
      showToast(`"${name}" removed from wishlist`);
    } catch {
      showToast("Could not remove item. Try again.", "error");
    } finally {
      setRemovingId(null);
    }
  };

  // ── Add to cart ──────────────────────────────────────────────────────────────
  const handleAddToCart = async (item: WishlistItem) => {
    if (!item.inStock || addedIds.has(item._id)) return;
    setAddingId(item._id);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId, quantity: 1 }),
      });
      if (!res.ok) throw new Error();
      setAddedIds(prev => new Set([...prev, item._id]));
      showToast(`"${item.name}" added to cart ✓`);
      setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(item._id); return n; }), 3000);
    } catch {
      showToast("Could not add to cart. Try again.", "error");
    } finally {
      setAddingId(null);
    }
  };

  // ── Clear all ─────────────────────────────────────────────────────────────────
  const handleClearAll = async () => {
    if (!confirm("Remove all items from your wishlist?")) return;
    try {
      await fetch("/api/account/wishlist", { method: "DELETE" });
      setItems([]);
      showToast("Wishlist cleared");
    } catch {
      showToast("Could not clear wishlist.", "error");
    }
  };

  // ── States ────────────────────────────────────────────────────────────────────

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          {/* Header skeleton */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <FiHeart size={24} className="text-red-400" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">{error}</p>
          <button
            onClick={fetchWishlist}
            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:opacity-80 transition"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const inStockCount = items.filter(i => i.inStock).length;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Toast stack ── */}
      <div className="fixed top-5 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
              border backdrop-blur-sm transition-all duration-300
              ${t.type === "success"
                ? "bg-white/95 dark:bg-gray-900/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
                : "bg-red-50/95 dark:bg-red-950/95 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
              }
            `}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs
              ${t.type === "success" ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400" : "bg-red-100 dark:bg-red-900/40 text-red-500"}`}>
              {t.type === "success" ? "✓" : "!"}
            </span>
            {t.msg}
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-20">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-3">
              <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-300 transition">Home</Link>
              <span>/</span>
              <Link href="/account" className="hover:text-gray-600 dark:hover:text-gray-300 transition">Account</Link>
              <span>/</span>
              <span className="text-gray-600 dark:text-gray-300">Wishlist</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="w-9 h-9 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800
                  flex items-center justify-center text-gray-500 dark:text-gray-400
                  hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200
                  transition-all flex-shrink-0"
                aria-label="Back to account"
              >
                <FiArrowLeft size={16} />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white tracking-tight"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  My Wishlist
                </h1>
                {items.length > 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                    {items.length} saved {items.length === 1 ? "item" : "items"}
                    {inStockCount < items.length && (
                      <span className="ml-2 text-amber-500 dark:text-amber-400">
                        · {items.length - inStockCount} out of stock
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {items.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                  border border-gray-200 dark:border-gray-800
                  text-xs font-medium text-gray-500 dark:text-gray-400
                  hover:border-red-200 dark:hover:border-red-900 hover:text-red-500 dark:hover:text-red-400
                  bg-white dark:bg-gray-900 transition-all"
              >
                <FiTrash2 size={12} />
                Clear all
              </button>
              <Link
                href="/shop"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl
                  bg-gray-900 dark:bg-white text-white dark:text-gray-900
                  text-xs font-medium hover:opacity-85 transition-all"
              >
                <FiPackage size={12} />
                Continue shopping
              </Link>
            </div>
          )}
        </div>

        {/* ── Empty state ── */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 sm:py-36 gap-6 text-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800
                flex items-center justify-center shadow-sm">
                <FiHeart size={36} className="text-gray-200 dark:text-gray-700" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40
                flex items-center justify-center text-red-400 text-xs font-bold border-2 border-gray-50 dark:border-gray-950">
                0
              </div>
            </div>
            <div className="space-y-2 max-w-xs">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100"
                style={{ fontFamily: "Georgia, serif" }}>
                Nothing saved yet
              </h2>
              <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed">
                Tap the heart icon on any product to save it here for later.
              </p>
            </div>
            <Link
              href="/shop"
              className="mt-2 inline-flex items-center gap-2 bg-gray-900 dark:bg-white
                hover:opacity-80 text-white dark:text-gray-900 px-7 py-3 rounded-xl
                text-sm font-medium transition shadow-sm"
            >
              <FiPackage size={15} />
              Explore Products
            </Link>
          </div>
        ) : (
          <>
            {/* ── Grid ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {items.map((item, idx) => (
                <WishlistCard
                  key={item._id}
                  item={item}
                  index={idx}
                  isRemoving={removingId === item._id}
                  isAddingToCart={addingId === item._id}
                  isAdded={addedIds.has(item._id)}
                  onRemove={() => handleRemove(item._id, item.name)}
                  onAddToCart={() => handleAddToCart(item)}
                />
              ))}
            </div>

            {/* ── Add all in-stock to cart ── */}
            {inStockCount > 1 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={async () => {
                    for (const item of items.filter(i => i.inStock)) {
                      await handleAddToCart(item);
                    }
                  }}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl
                    bg-yellow-500 hover:bg-yellow-400 text-white font-medium text-sm
                    transition-all shadow-md shadow-yellow-200 dark:shadow-yellow-900/20
                    active:scale-[0.98]"
                >
                  <FiShoppingCart size={15} />
                  Add all {inStockCount} in-stock items to cart
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Wishlist Card ─────────────────────────────────────────────────────────────

interface CardProps {
  item: WishlistItem;
  index: number;
  isRemoving: boolean;
  isAddingToCart: boolean;
  isAdded: boolean;
  onRemove: () => void;
  onAddToCart: () => void;
}

function WishlistCard({ item, index, isRemoving, isAddingToCart, isAdded, onRemove, onAddToCart }: CardProps) {
  const discount =
    item.originalPrice && item.originalPrice > item.price
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : null;

  const addedAt = new Date(item.addedAt).toLocaleDateString("en-PK", {
    day: "numeric", month: "short",
  });

  return (
    <div
      className={`
        group relative bg-white dark:bg-gray-900
        rounded-2xl overflow-hidden
        border border-gray-100 dark:border-gray-800
        transition-all duration-300 ease-out
        ${isRemoving
          ? "opacity-0 scale-95 pointer-events-none"
          : "hover:shadow-lg hover:shadow-gray-100 dark:hover:shadow-gray-900/50 hover:-translate-y-0.5"
        }
      `}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* ── Image ── */}
      <Link href={`/product/${item.slug}`} className="block relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Dark gradient for badge readability */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

        {/* Out of stock overlay */}
        {!item.inStock && (
          <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/70 flex items-center justify-center backdrop-blur-[1px]">
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-500 dark:text-gray-400
              bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Discount badge */}
        {discount && (
          <div className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold
            px-2 py-0.5 rounded-full tracking-wide shadow-sm">
            −{discount}%
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={e => { e.preventDefault(); onRemove(); }}
          disabled={isRemoving}
          aria-label="Remove from wishlist"
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full
            bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700
            flex items-center justify-center
            opacity-0 group-hover:opacity-100
            hover:bg-red-500 hover:border-red-500 hover:text-white
            text-gray-400 dark:text-gray-500
            transition-all duration-200 shadow-sm"
        >
          <FiTrash2 size={11} />
        </button>

        {/* Added at */}
        <div className="absolute bottom-2 left-2.5
          opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-[10px] text-white/80 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
            Saved {addedAt}
          </span>
        </div>
      </Link>

      {/* ── Info ── */}
      <div className="p-3 sm:p-4 space-y-2.5">
        <Link href={`/product/${item.slug}`}>
          <h3 className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100
            line-clamp-2 leading-snug hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            {item.name}
          </h3>
        </Link>

        {/* Price row */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            Rs {item.price.toLocaleString()}
          </span>
          {item.originalPrice && item.originalPrice > item.price && (
            <span className="text-[11px] text-gray-400 line-through">
              Rs {item.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={onAddToCart}
          disabled={!item.inStock || isAddingToCart || isAdded}
          className={`
            w-full flex items-center justify-center gap-1.5
            py-2 sm:py-2.5 rounded-xl
            text-xs sm:text-sm font-medium
            transition-all duration-200 active:scale-[0.98]
            ${isAdded
              ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
              : item.inStock
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80 shadow-sm"
              : "bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600 border border-gray-100 dark:border-gray-800 cursor-not-allowed"
            }
          `}
        >
          {isAddingToCart ? (
            <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
          ) : isAdded ? (
            <FiCheck size={13} />
          ) : (
            <FiShoppingCart size={13} />
          )}
          <span>
            {isAddingToCart ? "Adding…" : isAdded ? "Added!" : item.inStock ? "Add to Cart" : "Unavailable"}
          </span>
        </button>
      </div>
    </div>
  );
}