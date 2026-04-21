"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiShoppingCart, FiEye, FiHeart } from "react-icons/fi";

interface Variant { images?: string[]; price?: number }

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  oldPrice?: number;
  images?: string[];
  sale?: boolean;
  variants?: Variant[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const defaultImg = product.images?.[0] || product.variants?.[0]?.images?.[0] || "/placeholder.jpg";
  const hoverImg = product.images?.[1] || product.variants?.[0]?.images?.[1] || defaultImg;

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((i: { _id: string }) => i._id === product._id);
    if (existing) existing.quantity = (existing.quantity || 1) + 1;
    else cart.push({ ...product, quantity: 1, image: defaultImg });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    if (onAddToCart) onAddToCart(product);
  };

  const handleWishlist = () => {
    const list = JSON.parse(localStorage.getItem("wishlist") || "[]");
    if (!list.find((i: { _id: string }) => i._id === product._id)) {
      list.push({ ...product, image: defaultImg });
      localStorage.setItem("wishlist", JSON.stringify(list));
      window.dispatchEvent(new Event("storage"));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 relative flex flex-col"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.sale && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">SALE</span>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={handleWishlist}
        className="absolute top-3 right-3 z-10 w-8 h-8 bg-gray-950/80 backdrop-blur border border-gray-700 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-500/40 transition opacity-0 group-hover:opacity-100"
        aria-label="Add to wishlist"
      >
        <FiHeart size={14} />
      </button>

      {/* Image */}
      <div className="relative h-60 overflow-hidden bg-gray-800">
        <Image
          src={defaultImg}
          alt={product.title}
          fill
          className="object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <Image
          src={hoverImg}
          alt={`${product.title} alternate`}
          fill
          className="object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Link
            href={`/product/${product.slug}`}
            className="flex items-center gap-1.5 bg-white text-gray-900 text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-gray-100 transition shadow-lg"
          >
            <FiEye size={13} /> View
          </Link>
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 bg-yellow-500 text-gray-900 text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-yellow-400 transition shadow-lg"
          >
            <FiShoppingCart size={13} /> Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/product/${product.slug}`} className="hover:text-yellow-400 transition">
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">{product.title}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-yellow-400 font-bold text-base">${product.price.toLocaleString()}</span>
          {product.oldPrice && (
            <span className="text-gray-600 line-through text-sm">${product.oldPrice.toLocaleString()}</span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          className="mt-3 w-full text-xs font-semibold bg-gray-800 hover:bg-yellow-500/20 border border-gray-700 hover:border-yellow-500/40 text-gray-300 hover:text-yellow-400 py-2 rounded-lg transition flex items-center justify-center gap-1.5"
        >
          <FiShoppingCart size={12} /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
