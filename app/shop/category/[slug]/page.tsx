// app/shop/category/[slug]/page.tsx
// Place this file at: src/app/shop/category/[slug]/page.tsx
// Each category in the navbar links to: /shop/category/<slug>

"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiSearch, FiX, FiShoppingCart, FiHeart, FiEye } from "react-icons/fi";

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

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "wishlist";
}

const PAGE_SIZE = 12;

// ── Toast ─────────────────────────────────────────────────────────────────────
const ToastContainer: React.FC<{ toasts: Toast[]; remove: (id: number) => void }> = ({ toasts, remove }) => (
  <div className="fixed bottom-6 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={() => remove(t.id)}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white cursor-pointer
            ${t.type === "success" ? "bg-stone-900" : t.type === "wishlist" ? "bg-red-500" : "bg-red-600"}`}
        >
          <span>{t.type === "success" ? "🛒" : t.type === "wishlist" ? "❤️" : "⚠️"}</span>
          {t.message}
          <span className="ml-1 opacity-50 text-xs">✕</span>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = decodeURIComponent((params?.slug as string) || "");

  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Fetch ──
  useEffect(() => {
    setLoading(true);
    setPage(1);
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data.filter((p: Product) =>
          (p.images && p.images.length > 0) ||
          (p.variants && p.variants[0]?.images?.length > 0)
        ));
        const cats = Array.from(
          new Set(data.map((p: Product) => p.category).filter(Boolean).map((c: string) => c.trim()))
        ) as string[];
        setAllCategories(cats.sort());
      } catch {
        showToast("Failed to load products", "error");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  // ── Debounced search ──
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [sortBy, slug]);

  // ── Toast ──
  const showToast = (message: string, type: Toast["type"] = "success") => {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  };

  // ── Cart ──
  const addToCart = useCallback((product: Product, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = cart.find((i: any) => i._id === product._id);
      const image = product.images?.[0] || product.variants?.[0]?.images?.[0] || "/products/placeholder.jpg";
      if (existing) { existing.quantity += 1; showToast(`${product.title} qty updated`); }
      else { cart.push({ ...product, quantity: 1, image }); showToast(`${product.title} added to cart`); }
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch { showToast("Could not add to cart", "error"); }
  }, []);

  // ── Wishlist ──
  const addToWishlist = useCallback((product: Product, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const exists = wishlist.some((i: any) => i._id === product._id);
      if (exists) {
        const updated = wishlist.filter((i: any) => i._id !== product._id);
        localStorage.setItem("wishlist", JSON.stringify(updated));
        showToast(`Removed from wishlist`, "wishlist");
      } else {
        wishlist.push(product);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        showToast(`${product.title} wishlisted`, "wishlist");
      }
    } catch { showToast("Could not update wishlist", "error"); }
  }, []);

  const isWishlisted = (id: string) => {
    try {
      return JSON.parse(localStorage.getItem("wishlist") || "[]").some((i: any) => i._id === id);
    } catch { return false; }
  };

  // ── Filter/sort/paginate ──
  const isSaleSlug = slug === "sale";
  const displayName = isSaleSlug ? "Sale" : slug.charAt(0).toUpperCase() + slug.slice(1);

  const processed = products
    .filter((p) => isSaleSlug ? p.sale : p.category?.toLowerCase() === slug.toLowerCase())
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      if (sortBy === "name-desc") return b.title.localeCompare(a.title);
      return 0;
    });

  const totalPages = Math.ceil(processed.length / PAGE_SIZE);
  const paginated = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Loading ──
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
          <p className="text-stone-400 text-xs tracking-widest uppercase">Loading {displayName}</p>
        </div>
      </div>
    );

  return (
    <>
      <ToastContainer toasts={toasts} remove={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />

      <div className="bg-stone-50 min-h-screen pt-20">

        {/* ── Hero Banner ── */}
        <div className="bg-white border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
            <button
              onClick={() => router.push("/shop")}
              className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-700 transition mb-4 group"
            >
              <FiArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Shop
            </button>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                {isSaleSlug && (
                  <span className="inline-block mb-2 text-xs font-bold bg-red-500 text-white px-2.5 py-1 rounded-full">
                    🔥 LIMITED TIME
                  </span>
                )}
                <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                  {displayName}
                </h1>
                <p className="text-stone-400 text-sm mt-1">
                  {processed.length} product{processed.length !== 1 ? "s" : ""} available
                </p>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/shop"
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-stone-200 text-stone-500 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition"
                >
                  All
                </Link>
                {allCategories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/shop/category/${encodeURIComponent(cat.toLowerCase())}`}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      cat.toLowerCase() === slug.toLowerCase()
                        ? "bg-stone-900 text-white border border-stone-900"
                        : "border border-stone-200 text-stone-500 hover:bg-stone-900 hover:text-white hover:border-stone-900"
                    }`}
                  >
                    {cat}
                  </Link>
                ))}
                <Link
                  href="/shop/category/sale"
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    isSaleSlug
                      ? "bg-red-500 text-white border border-red-500"
                      : "border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500"
                  }`}
                >
                  Sale 🔥
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="sticky top-0 z-40 bg-white border-b border-stone-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder={`Search in ${displayName}…`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
              />
              {searchInput && (
                <button onClick={() => setSearchInput("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                  <FiX size={13} />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-stone-200 rounded-lg px-3 py-2 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-300 cursor-pointer"
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name-asc">Name: A → Z</option>
              <option value="name-desc">Name: Z → A</option>
            </select>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-5xl mb-4">{search ? "🔍" : "🛍️"}</p>
              <p className="text-lg font-semibold text-stone-700">
                {search ? `No results for "${search}"` : `No products in ${displayName}`}
              </p>
              <p className="text-stone-400 text-sm mt-1">Try a different category or search term</p>
              <div className="flex gap-3 mt-5">
                {search && (
                  <button onClick={() => setSearchInput("")}
                    className="text-sm border border-stone-200 text-stone-600 px-4 py-2 rounded-full hover:bg-stone-100 transition">
                    Clear Search
                  </button>
                )}
                <Link href="/shop" className="text-sm bg-stone-900 text-white px-5 py-2 rounded-full hover:bg-stone-700 transition">
                  All Products
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {paginated.map((product) => {
                  const defaultImage = product.images?.[0] || product.variants?.[0]?.images?.[0] || "/products/placeholder.jpg";
                  const hoverImage = product.images?.[1] || product.variants?.[0]?.images?.[1] || defaultImage;
                  const discount = product.oldPrice
                    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null;

                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="group bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-300 relative flex flex-col"
                    >
                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                        {discount ? (
                          <span className="bg-red-500 text-white px-2 py-0.5 text-xs font-bold rounded-full">-{discount}%</span>
                        ) : product.sale ? (
                          <span className="bg-red-500 text-white px-2 py-0.5 text-xs font-bold rounded-full">SALE</span>
                        ) : null}
                      </div>

                      {/* Wishlist button */}
                      <button
                        onClick={(e) => addToWishlist(product, e)}
                        className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        title="Add to Wishlist"
                      >
                        <FiHeart size={14} className={isWishlisted(product._id) ? "fill-red-500 text-red-500" : "text-stone-500"} />
                      </button>

                      {/* Image */}
                      <Link href={`/product/${product.slug}`}>
                        <div className="relative w-full aspect-[3/4] overflow-hidden bg-stone-100">
                          <Image src={defaultImage} alt={product.title} fill
                            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                          <Image src={hoverImage} alt={product.title} fill
                            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />

                          {/* Desktop hover CTA */}
                          <div className="hidden sm:flex absolute bottom-3 inset-x-0 justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <span className="flex items-center gap-1.5 bg-white text-stone-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow">
                              <FiEye size={12} /> View
                            </span>
                            <button onClick={(e) => addToCart(product, e)}
                              className="flex items-center gap-1.5 bg-stone-900 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow hover:bg-stone-700 transition">
                              <FiShoppingCart size={12} /> Add
                            </button>
                          </div>
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="p-3 flex flex-col flex-1 gap-1">
                        {product.category && (
                          <p className="text-xs text-stone-400 uppercase tracking-wide">{product.category}</p>
                        )}
                        <h3 className="text-sm font-semibold text-stone-800 line-clamp-2 leading-snug flex-1">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-stone-900 font-bold text-sm">Rs {product.price.toLocaleString()}</span>
                          {product.oldPrice && (
                            <span className="text-stone-400 line-through text-xs">Rs {product.oldPrice.toLocaleString()}</span>
                          )}
                        </div>

                        {/* Mobile add to cart */}
                        <button onClick={(e) => addToCart(product, e)}
                          className="sm:hidden mt-2 w-full bg-stone-900 text-white py-2 rounded-xl text-xs font-semibold hover:bg-stone-700 transition active:scale-95">
                          Add to Cart
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >← Prev</button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | "...")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                      acc.push(p); return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span key={`e${i}`} className="px-2 text-stone-400">…</span>
                      ) : (
                        <button key={p}
                          onClick={() => { setPage(p as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className={`w-9 h-9 text-sm rounded-lg border transition font-medium ${page === p ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"}`}>
                          {p}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >Next →</button>

                  <span className="text-xs text-stone-400 w-full text-center mt-1">
                    Page {page} of {totalPages} · {processed.length} products
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}