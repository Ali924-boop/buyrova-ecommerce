"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Variant {
  color: string;
  size: string[];
  images: string[];
  price?: number;
}

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  oldPrice?: number;
  images?: string[];
  sale?: boolean;
  variants?: Variant[];
  description?: string;
  category?: string;
}

interface CartItem extends Product {
  quantity: number;
  image: string;
}

// ── Toast notification (replaces alert) ──────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
      bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full
      shadow-xl flex items-center gap-2 animate-fade-in">
      🛒 {message}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const ShopPage: React.FC = () => {
  const [products,  setProducts]  = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [toastMsg,  setToastMsg]  = useState<string | null>(null);

  // ── Fetch products ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res  = await fetch("/api/products");
        const data: unknown = await res.json();

        // Safety check — API must return an array
        if (!Array.isArray(data)) {
          console.error("Expected array from /api/products, got:", data);
          setProducts([]);
          return;
        }

        // Keep only products that have at least one displayable image
        const filtered = (data as Product[]).filter(
          (p) =>
            (p.images && p.images.length > 0) ||
            (p.variants && p.variants[0]?.images?.length > 0)
        );

        setProducts(filtered);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ── Add to cart ─────────────────────────────────────────────────────────────
  // FIX: localStorage is only safe inside callbacks (client-side events),
  // never during render or SSR. useCallback keeps the reference stable.
  const addToCart = useCallback((product: Product) => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("cart");
    const cart: CartItem[] = stored ? (JSON.parse(stored) as CartItem[]) : [];

    const image =
      product.images?.[0] ??
      product.variants?.[0]?.images?.[0] ??
      "/products/placeholder.jpg";

    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1, image });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    // Notify other tabs / Navbar cart counter
    window.dispatchEvent(new Event("storage"));
    // FIX: replace browser alert() with a non-blocking toast
    setToastMsg("Product added to cart!");
  }, []);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!products.length)
    return (
      <p className="text-center py-24 text-gray-400">No products found.</p>
    );

  // ── Product grid ────────────────────────────────────────────────────────────
  return (
    <>
      {toastMsg && (
        <Toast message={toastMsg} onDone={() => setToastMsg(null)} />
      )}

      <div className="pt-24 px-6 md:px-12 bg-gray-50 min-h-screen">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          Shop Collection
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            const defaultImage =
              product.images?.[0] ??
              product.variants?.[0]?.images?.[0] ??
              "/products/placeholder.jpg";

            const hoverImage =
              product.images?.[1] ??
              product.variants?.[0]?.images?.[1] ??
              defaultImage;

            return (
              <div
                key={product._id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl overflow-hidden transition cursor-pointer relative"
              >
                {/* Sale badge */}
                {product.sale && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded z-10">
                    SALE
                  </span>
                )}

                {/* Category badge */}
                {product.category && (
                  <span className="absolute top-3 right-3 bg-yellow-500 text-black px-2 py-1 text-xs font-bold rounded z-10 capitalize">
                    {product.category}
                  </span>
                )}

                {/* Images */}
                {/* FIX: added sizes prop — required by Next.js <Image fill> to
                    generate correct srcset and avoid console warnings */}
                <div className="relative w-full h-64 overflow-hidden">
                  <Image
                    src={defaultImage}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                  />
                  <Image
                    src={hoverImage}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  {/* Hover action buttons */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition">
                    <Link
                      href={`/product/${product.slug}`}
                      className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow hover:bg-gray-100"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow hover:bg-yellow-600"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* Product info */}
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {product.title}
                  </h3>
                  <div className="flex justify-center items-center gap-2 mt-1">
                    <span className="text-gray-900 font-bold">
                      Rs {product.price.toLocaleString()}
                    </span>
                    {product.oldPrice && (
                      <span className="text-gray-400 line-through text-sm">
                        Rs {product.oldPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ShopPage;