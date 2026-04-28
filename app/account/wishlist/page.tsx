"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link  from "next/link";
import {
  FiHeart, FiShoppingCart, FiTrash2,
  FiArrowLeft, FiLoader,
} from "react-icons/fi";

interface WishlistProduct {
  _id:    string;
  title:  string;
  slug:   string;
  price:  number;
  images: string[];
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [removing, setRemoving] = useState<string | null>(null);  // track which item is being removed
  const [carting,  setCarting]  = useState<string | null>(null);  // track which item is being carted

  // ── Load wishlist from API ──────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/wishlist", { credentials: "include" })
      .then(async (r) => {
        if (r.status === 401) throw new Error("Unauthorized");
        if (!r.ok)            throw new Error("Failed to load wishlist");
        return r.json();
      })
      .then((d) => setWishlist(d.products ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Remove from wishlist ────────────────────────────────────────────────

  const remove = async (productId: string) => {
    setRemoving(productId);
    try {
      const res = await fetch("/api/wishlist", {
        method:      "DELETE",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      // optimistic UI update
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
    } catch {
      alert("Could not remove item. Please try again.");
    } finally {
      setRemoving(null);
    }
  };

  // ── Move to cart ────────────────────────────────────────────────────────
  // Cart is still localStorage-based here — swap with /api/cart if you have one

  const moveToCart = async (item: WishlistProduct) => {
    setCarting(item._id);
    try {
      const cart     = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = cart.find((i: { _id: string }) => i._id === item._id);
      if (existing) existing.quantity = (existing.quantity || 1) + 1;
      else cart.push({
        _id:      item._id,
        title:    item.title,
        slug:     item.slug,
        price:    item.price,
        image:    item.images?.[0] ?? "",
        quantity: 1,
      });
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));

      // remove from wishlist after moving
      await remove(item._id);
    } finally {
      setCarting(null);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-yellow-500/20
            border-t-yellow-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading your wishlist…</p>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center
        justify-center gap-4">
        <FiHeart size={32} className="text-gray-700" />
        <p className="text-gray-400 text-sm">{error}</p>
        {error === "Unauthorized" ? (
          <Link href="/account/login"
            className="text-yellow-500 hover:text-yellow-400 text-sm transition">
            Sign in to view wishlist →
          </Link>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="text-yellow-500 hover:text-yellow-400 text-sm transition"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  // ── Page ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 px-4 sm:px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/account/profile"
            className="w-9 h-9 rounded-xl bg-gray-900 border border-gray-800
              flex items-center justify-center text-gray-500
              hover:text-white hover:border-gray-700 transition-all">
            <FiArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Wishlist</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Empty state */}
        {wishlist.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl
            flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 bg-gray-800 rounded-2xl
              flex items-center justify-center">
              <FiHeart className="text-gray-600 text-2xl" />
            </div>
            <div className="text-center">
              <p className="text-gray-400 font-medium">Your wishlist is empty</p>
              <p className="text-gray-600 text-sm mt-1">
                Save items you love and find them here
              </p>
            </div>
            <Link href="/shop"
              className="px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400
                text-gray-900 text-sm font-bold transition">
              Browse Products
            </Link>
          </div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {wishlist.map((item) => {
              const isRemoving = removing === item._id;
              const isCarting  = carting  === item._id;
              const busy       = isRemoving || isCarting;

              return (
                <div key={item._id}
                  className={`bg-gray-900 border rounded-2xl overflow-hidden
                    transition-all duration-200 group
                    ${busy
                      ? "border-gray-700 opacity-60 pointer-events-none"
                      : "border-gray-800 hover:border-gray-700"
                    }`}>

                  {/* Image */}
                  <div className="relative h-48 bg-gray-800">
                    <Image
                      src={item.images?.[0] || "/placeholder.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />

                    {/* Remove button */}
                    <button
                      onClick={() => remove(item._id)}
                      disabled={busy}
                      className="absolute top-3 right-3 w-8 h-8
                        bg-gray-950/80 border border-gray-700 rounded-lg
                        flex items-center justify-center
                        text-gray-500 hover:text-red-400
                        hover:border-red-500/40 transition
                        opacity-0 group-hover:opacity-100"
                      aria-label="Remove from wishlist"
                    >
                      {isRemoving
                        ? <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        : <FiTrash2 size={13} />
                      }
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <Link href={`/shop/${item.slug}`}>
                      <h3 className="text-white text-sm font-semibold truncate
                        hover:text-yellow-400 transition">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-yellow-400 font-bold mt-1">
                      ${item.price.toLocaleString()}
                    </p>

                    {/* Move to cart */}
                    <button
                      onClick={() => moveToCart(item)}
                      disabled={busy}
                      className="mt-3 w-full flex items-center justify-center gap-1.5
                        text-xs bg-yellow-500 hover:bg-yellow-400
                        text-gray-900 font-bold py-2 rounded-lg transition"
                    >
                      {isCarting ? (
                        <div className="w-3 h-3 border-2 border-gray-900/30
                          border-t-gray-900 rounded-full animate-spin" />
                      ) : (
                        <><FiShoppingCart size={12} /> Move to Cart</>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}