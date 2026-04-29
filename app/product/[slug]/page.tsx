"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FiHeart } from "react-icons/fi";

interface Variant {
  color: string;
  size: string[];
  images: string[];
  price?: number;
  stock?: number;
}

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  variants: Variant[];
  description?: string;
}

const COLOR_MAP: Record<string, string> = {
  red: "#e24b4a", blue: "#378add", black: "#1a1a1a",
  white: "#ffffff", green: "#639922", yellow: "#ef9f27",
  gray: "#888780", navy: "#0c447c", pink: "#d4537e",
  purple: "#7f77dd", orange: "#d85a30", brown: "#854f0b",
};

const addToCartStorage = (
  product: Product,
  variant: Variant,
  size: string,
  quantity: number
) => {
  const variantIndex = product.variants.findIndex(
    (v) => v.color === variant.color
  );

  const existing = JSON.parse(localStorage.getItem("cart") ?? "[]");

  const idx = existing.findIndex(
    (i: any) =>
      i._id === product._id &&
      i.color === variant.color &&
      i.size === size
  );

  if (idx > -1) {
    existing[idx].quantity += quantity;
  } else {
    existing.push({
      _id:          product._id,
      productId:    product._id,
      title:        product.title,
      slug:         product.slug,
      color:        variant.color,
      size,
      variantIndex,
      quantity,
      price:        variant.price ?? product.price,
      image:        variant.images[0],
    });
  }

  localStorage.setItem("cart", JSON.stringify(existing));
};

// ── Wishlist helpers (localStorage) ─────────────────────────────────────────
const getWishlist = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem("wishlist") ?? "[]");
  } catch {
    return [];
  }
};

const toggleWishlistStorage = (productId: string): boolean => {
  const list = getWishlist();
  const idx  = list.indexOf(productId);
  if (idx > -1) {
    list.splice(idx, 1);
  } else {
    list.push(productId);
  }
  localStorage.setItem("wishlist", JSON.stringify(list));
  return idx === -1; // true = now wishlisted
};

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug   = params?.slug as string;
  const { data: session } = useSession();

  const [product, setProduct]             = useState<Product | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize]   = useState("");
  const [activeImage, setActiveImage]     = useState("");
  const [quantity, setQuantity]           = useState(1);
  const [addedToCart, setAddedToCart]     = useState(false);
  const [sizeError, setSizeError]         = useState(false);

  // ── Wishlist state ──────────────────────────────────────────────────────
  const [wishlisted, setWishlisted]       = useState(false);
  const [wishlistAnim, setWishlistAnim]   = useState(false); // pop animation

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!slug) return;
        const res = await fetch(`/api/products/slug/${slug}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        const p: Product = Array.isArray(data) ? data[0] : data;
        if (!p) throw new Error("Product not found");
        setProduct(p);
        setSelectedColor(p.variants[0]?.color ?? "");
        setSelectedSize(p.variants[0]?.size[0] ?? "");
        setActiveImage(p.variants[0]?.images[0] ?? "");

        // Restore wishlist state from localStorage
        setWishlisted(getWishlist().includes(p._id));
      } catch (err: any) {
        setError(err.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const selectedVariant = product?.variants.find(v => v.color === selectedColor) ?? product?.variants[0];

  const handleColorChange = (variant: Variant) => {
    setSelectedColor(variant.color);
    setSelectedSize(variant.size[0] ?? "");
    setActiveImage(variant.images[0] ?? "");
  };

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return; }
    if (!product || !selectedVariant) return;
    addToCartStorage(product, selectedVariant, selectedSize, quantity);
    setAddedToCart(true);
    setTimeout(() => router.push("/cart"), 800);
  };

  // ── Wishlist toggle ────────────────────────────────────────────────────
  const handleWishlist = useCallback(async () => {
    if (!product) return;

    // If not logged in — redirect to login
    if (!session?.user) {
      router.push("/account/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
      return;
    }

    // Optimistic UI update
    const nowWishlisted = toggleWishlistStorage(product._id);
    setWishlisted(nowWishlisted);

    // Pop animation
    setWishlistAnim(true);
    setTimeout(() => setWishlistAnim(false), 400);

    // Sync with API (optional — fires silently)
    try {
      await fetch("/api/wishlist", {
        method:  nowWishlisted ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ productId: product._id }),
      });
    } catch {
      // API sync failure is non-critical; localStorage is source of truth
    }
  }, [product, session, router]);

  if (loading) return (
    <div className="pt-24 min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !product || !selectedVariant) return (
    <div className="pt-24 min-h-screen flex items-center justify-center text-center space-y-4">
      <div>
        <p className="text-xl text-gray-700">{error || "Product not found"}</p>
        <Link href="/shop" className="text-yellow-600 underline text-sm mt-2 inline-block">← Back to Shop</Link>
      </div>
    </div>
  );

  const displayPrice = selectedVariant.price ?? product.price;
  const stock        = selectedVariant.stock ?? 99;

  return (
    <div className="pt-24 px-4 md:px-12 min-h-screen" style={{ background: "var(--color-background-tertiary, #f5f4f0)" }}>
      <div className="max-w-5xl mx-auto pb-16">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-gray-700">Shop</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* ── Images ── */}
          <div>
            <div className="relative w-full rounded-2xl overflow-hidden border border-gray-100 bg-white" style={{ aspectRatio: "4/5" }}>
              {activeImage ? (
                <Image src={activeImage} alt={product.title} fill className="object-cover" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No image</div>
              )}

              {/* ── Wishlist button (overlaid on image) ── */}
              <button
                onClick={handleWishlist}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`
                  absolute top-3 right-3 z-10
                  w-10 h-10 rounded-full flex items-center justify-center
                  shadow-md transition-all duration-200
                  ${wishlisted
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white/90 text-gray-400 border border-gray-200 hover:border-red-300 hover:text-red-400"
                  }
                  ${wishlistAnim ? "scale-125" : "scale-100"}
                `}
              >
                <FiHeart
                  size={17}
                  className={wishlisted ? "fill-white" : ""}
                />
              </button>
            </div>

            {selectedVariant.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {selectedVariant.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === img ? "border-yellow-500" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col gap-5">

            {/* Stock badge */}
            <div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wider ${
                stock > 5 ? "bg-green-50 text-green-700" :
                stock > 0 ? "bg-yellow-50 text-yellow-700" :
                "bg-red-50 text-red-600"
              }`}>
                {stock > 10 ? "In Stock" : stock > 0 ? `Only ${stock} left` : "Out of Stock"}
              </span>
            </div>

            {/* Title + Price + Wishlist */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 style={{ fontFamily: "Georgia, serif" }} className="text-3xl font-semibold text-gray-900 leading-tight">
                  {product.title}
                </h1>
                <p className="text-2xl font-medium text-gray-800 mt-2">
                  Rs {displayPrice.toLocaleString()}
                </p>
              </div>

              {/* ── Wishlist button (beside title, for desktop clarity) ── */}
              <button
                onClick={handleWishlist}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`
                  flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl
                  border text-sm font-medium transition-all duration-200 mt-1
                  ${wishlisted
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "bg-white border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400"
                  }
                  ${wishlistAnim ? "scale-105" : "scale-100"}
                `}
              >
                <FiHeart
                  size={14}
                  className={`transition-all ${wishlisted ? "fill-red-500 text-red-500" : ""}`}
                />
                <span className="hidden sm:inline">
                  {wishlisted ? "Saved" : "Save"}
                </span>
              </button>
            </div>

            {product.description && (
              <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
            )}

            {/* Colors */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                Color: <span className="capitalize font-normal text-gray-600">{selectedColor}</span>
              </p>
              <div className="flex gap-3 flex-wrap">
                {product.variants.map(v => (
                  <button
                    key={v.color}
                    title={v.color}
                    onClick={() => handleColorChange(v)}
                    style={{ background: COLOR_MAP[v.color.toLowerCase()] ?? "#ccc" }}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === v.color
                        ? "border-yellow-500 scale-110 shadow"
                        : "border-gray-300 hover:border-gray-500"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">Size</p>
              <div className="flex gap-2 flex-wrap">
                {ALL_SIZES.map(size => {
                  const available  = selectedVariant.size.includes(size);
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      disabled={!available}
                      onClick={() => { if (available) { setSelectedSize(size); setSizeError(false); } }}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-gray-900 text-white border-gray-900"
                          : available
                          ? "bg-white text-gray-700 border-gray-300 hover:border-yellow-500 hover:text-yellow-600"
                          : "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed line-through"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {sizeError && <p className="text-xs text-red-500 mt-2">Please select a size to continue.</p>}
            </div>

            {/* Quantity */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors"
                  >−</button>
                  <span className="w-10 text-center font-medium text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(stock || 99, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors"
                  >+</button>
                </div>
                {stock > 0 && (
                  <span className="text-xs text-gray-400">{stock} in stock</span>
                )}
              </div>
            </div>

            {/* Add to Cart + Wishlist row */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={stock === 0 || addedToCart}
                className={`flex-1 py-4 rounded-xl font-medium text-white text-base transition-all ${
                  addedToCart
                    ? "bg-green-500"
                    : stock === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600 active:scale-[0.98]"
                }`}
              >
                {addedToCart ? "✓ Added! Redirecting..." : stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              {/* ── Wishlist icon-only button (CTA row) ── */}
              <button
                onClick={handleWishlist}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`
                  w-14 rounded-xl border flex items-center justify-center flex-shrink-0
                  transition-all duration-200
                  ${wishlisted
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "bg-white border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400"
                  }
                  ${wishlistAnim ? "scale-110" : "scale-100"}
                `}
              >
                <FiHeart
                  size={18}
                  className={wishlisted ? "fill-red-500 text-red-500" : ""}
                />
              </button>
            </div>

            {/* Wishlist feedback text */}
            {wishlisted && (
              <p className="text-xs text-red-400 -mt-2 flex items-center gap-1">
                <FiHeart size={11} className="fill-red-400" />
                Saved to your{" "}
                <Link href="/account/wishlist" className="underline hover:text-red-500 transition">
                  wishlist
                </Link>
              </p>
            )}

            {/* Meta */}
            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-3 text-xs text-gray-400">
              <div><span>Material</span><p className="text-gray-700 font-medium mt-0.5">100% Cotton</p></div>
              <div><span>Delivery</span><p className="text-gray-700 font-medium mt-0.5">3–5 business days</p></div>
              <div><span>SKU</span><p className="text-gray-700 font-medium mt-0.5">{product.slug}</p></div>
              <div><span>Section</span><p className="text-gray-700 font-medium mt-0.5 capitalize">{(product as any).section ?? "All"}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}