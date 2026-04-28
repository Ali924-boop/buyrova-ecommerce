"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
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

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const PAGE_SIZE = 12;

// ── Toast Component ──────────────────────────────────────────────────────────
const ToastContainer: React.FC<{ toasts: Toast[]; remove: (id: number) => void }> = ({
  toasts,
  remove,
}) => (
  <div className="fixed bottom-6 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
    {toasts.map((t) => (
      <div
        key={t.id}
        onClick={() => remove(t.id)}
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white cursor-pointer
          transition-all duration-300 animate-slide-up
          ${t.type === "success" ? "bg-stone-900" : "bg-red-500"}`}
      >
        <span>{t.type === "success" ? "🛒" : "⚠️"}</span>
        {t.message}
        <span className="ml-2 opacity-50 text-xs">✕</span>
      </div>
    ))}
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────
const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const toastId = useRef(0);

  // ── Fetch products ──
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        const filtered = data.filter(
          (p: Product) =>
            (p.images && p.images.length > 0) ||
            (p.variants && p.variants[0]?.images?.length > 0)
        );
        setProducts(filtered);

        // Build categories dynamically from real data
        const cats = Array.from(
          new Set(
            filtered
              .map((p: Product) => p.category)
              .filter(Boolean)
              .map((c: string) => c.trim())
          )
        ) as string[];
        setCategories(["All", ...cats.sort(), "Sale"]);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        showToast("Failed to load products", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ── Sync cart badge ──
  useEffect(() => {
    const syncCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0));
    };
    syncCart();
    window.addEventListener("storage", syncCart);
    return () => window.removeEventListener("storage", syncCart);
  }, []);

  // ── Close sidebar on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node))
        setSidebarOpen(false);
    };
    if (sidebarOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sidebarOpen]);

  // ── Debounced search (300ms) ──
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset page on filter/sort change
  useEffect(() => {
    setPage(1);
  }, [activeCategory, sortBy]);

  // ── Toasts ──
  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  // ── Add to cart ──
  const addToCart = useCallback(
    (product: Product, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existing = cart.find((item: any) => item._id === product._id);
        const image =
          product.images?.[0] ||
          product.variants?.[0]?.images?.[0] ||
          "/products/placeholder.jpg";
        if (existing) {
          existing.quantity += 1;
          showToast(`${product.title} qty updated`);
        } else {
          cart.push({ ...product, quantity: 1, image });
          showToast(`${product.title} added to cart`);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        setCartCount(cart.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0));
      } catch {
        showToast("Could not add to cart", "error");
      }
    },
    []
  );

  // ── Filter → Search → Sort → Paginate ──
  const processedProducts = products
    .filter((p) => {
      if (activeCategory === "Sale") return p.sale;
      if (activeCategory !== "All")
        return p.category?.toLowerCase() === activeCategory.toLowerCase();
      return true;
    })
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      if (sortBy === "name-desc") return b.title.localeCompare(a.title);
      return 0;
    });

  const totalPages = Math.ceil(processedProducts.length / PAGE_SIZE);
  const paginatedProducts = processedProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const clearFilters = () => {
    setActiveCategory("All");
    setSearchInput("");
    setSearch("");
    setSortBy("default");
    setPage(1);
  };

  const hasActiveFilters =
    activeCategory !== "All" || search !== "" || sortBy !== "default";

  // ── Shared category list (desktop sidebar + mobile drawer) ──
  const CategoryList = () => (
    <ul className="space-y-1">
      {categories.map((cat) => (
        <li key={cat}>
          <button
            onClick={() => {
              setActiveCategory(cat);
              setPage(1);
              setSidebarOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
              activeCategory === cat
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <span>{cat}</span>
            {cat === "Sale" && (
              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                HOT
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );

  // ── Loading state ──
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
          <p className="text-stone-400 text-xs tracking-widest uppercase">Loading Collection</p>
        </div>
      </div>
    );

  return (
    <>
      <ToastContainer toasts={toasts} remove={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />

      <div className="bg-stone-50 min-h-screen pt-2 ">

        {/* ── Sticky Header Bar ── */}
        <div className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center gap-3">

            {/* Title + cart badge */}
            <div className="flex items-center gap-3 shrink-0">
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">Shop</h1>
              {cartCount > 0 && (
                <span className="bg-stone-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  🛒 {cartCount}
                </span>
              )}
            </div>

            {/* Search bar */}
            <div className="relative flex-1 max-w-md">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search products…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(""); searchRef.current?.focus(); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-sm"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort + mobile filter toggle */}
            <div className="flex items-center gap-2 ml-auto">
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

              <button
                className="sm:hidden flex items-center gap-1.5 text-sm border border-stone-200 rounded-lg px-3 py-2 bg-white text-stone-700 active:bg-stone-100"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 9h10M11 14h2" />
                </svg>
                Filter
                {activeCategory !== "All" && (
                  <span className="bg-stone-900 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">1</span>
                )}
              </button>
            </div>
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-2 flex flex-wrap items-center gap-2">
              {activeCategory !== "All" && (
                <span className="inline-flex items-center gap-1 text-xs bg-stone-900 text-white px-2.5 py-1 rounded-full">
                  {activeCategory}
                  <button onClick={() => { setActiveCategory("All"); setPage(1); }} className="opacity-70 hover:opacity-100">✕</button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 text-xs bg-stone-700 text-white px-2.5 py-1 rounded-full">
                  "{search}"
                  <button onClick={() => { setSearchInput(""); setSearch(""); }} className="opacity-70 hover:opacity-100">✕</button>
                </span>
              )}
              {sortBy !== "default" && (
                <span className="inline-flex items-center gap-1 text-xs bg-stone-500 text-white px-2.5 py-1 rounded-full">
                  Sorted
                  <button onClick={() => setSortBy("default")} className="opacity-70 hover:opacity-100">✕</button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-stone-400 hover:text-stone-700 underline ml-1">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden sm:block w-48 shrink-0">
            <div className="sticky top-32">
              <p className="text-xs tracking-[0.15em] uppercase text-stone-400 mb-3 font-semibold">
                Categories
              </p>
              <CategoryList />
              <p className="mt-5 text-xs text-stone-400">
                {processedProducts.length} product{processedProducts.length !== 1 ? "s" : ""}
              </p>
            </div>
          </aside>

          {/* Mobile Drawer */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 sm:hidden">
              <div
                ref={sidebarRef}
                className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl p-6 flex flex-col"
              >
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs tracking-[0.15em] uppercase text-stone-400 font-semibold">
                    Categories
                  </p>
                  <button onClick={() => setSidebarOpen(false)} className="text-stone-400 hover:text-stone-800 text-lg">✕</button>
                </div>
                <CategoryList />
                <p className="mt-auto text-xs text-stone-400">
                  {processedProducts.length} product{processedProducts.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {paginatedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-semibold text-stone-700">No products found</p>
                <p className="text-stone-400 text-sm mt-1">
                  {search ? `No results for "${search}"` : "Try a different category"}
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-5 text-sm bg-stone-900 text-white px-5 py-2 rounded-full hover:bg-stone-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {paginatedProducts.map((product) => {
                    const defaultImage =
                      product.images?.[0] ||
                      product.variants?.[0]?.images?.[0] ||
                      "/products/placeholder.jpg";
                    const hoverImage =
                      product.images?.[1] ||
                      product.variants?.[0]?.images?.[1] ||
                      defaultImage;
                    const discount =
                      product.oldPrice
                        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                        : null;

                    return (
                      <div
                        key={product._id}
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-300 relative flex flex-col"
                      >
                        {/* Badges */}
                        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                          {product.sale && discount ? (
                            <span className="bg-red-500 text-white px-2 py-0.5 text-xs font-bold rounded-full">
                              -{discount}%
                            </span>
                          ) : product.sale ? (
                            <span className="bg-red-500 text-white px-2 py-0.5 text-xs font-bold rounded-full">
                              SALE
                            </span>
                          ) : null}
                        </div>

                        {/* Image */}
                        <Link href={`/product/${product.slug}`}>
                          <div className="relative w-full aspect-[3/4] overflow-hidden bg-stone-100">
                            <Image
                              src={defaultImage}
                              alt={product.title}
                              fill
                              className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />
                            <Image
                              src={hoverImage}
                              alt={product.title}
                              fill
                              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />

                            {/* Desktop hover buttons */}
                            <div className="hidden sm:flex absolute bottom-3 left-0 right-0 justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                              <span className="bg-white text-stone-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                                View
                              </span>
                              <button
                                onClick={(e) => addToCart(product, e)}
                                className="bg-stone-900 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md hover:bg-stone-700 transition"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </Link>

                        {/* Product Info */}
                        <div className="p-3 flex flex-col flex-1 gap-1">
                          {product.category && (
                            <p className="text-xs text-stone-400 uppercase tracking-wide">
                              {product.category}
                            </p>
                          )}
                          <h3 className="text-sm font-semibold text-stone-800 line-clamp-2 leading-snug flex-1">
                            {product.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-stone-900 font-bold text-sm">
                              Rs {product.price.toLocaleString()}
                            </span>
                            {product.oldPrice && (
                              <span className="text-stone-400 line-through text-xs">
                                Rs {product.oldPrice.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Mobile add to cart */}
                          <button
                            onClick={(e) => addToCart(product, e)}
                            className="sm:hidden mt-2 w-full bg-stone-900 text-white py-2 rounded-xl text-xs font-semibold hover:bg-stone-700 transition active:scale-95"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
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
                    >
                      ← Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === "..." ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-stone-400">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => { setPage(p as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            className={`w-9 h-9 text-sm rounded-lg border transition font-medium ${
                              page === p
                                ? "bg-stone-900 text-white border-stone-900"
                                : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      Next →
                    </button>

                    <span className="text-xs text-stone-400 w-full text-center mt-1">
                      Page {page} of {totalPages} · {processedProducts.length} products
                    </span>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
    </>
  );
};

export default ShopPage;