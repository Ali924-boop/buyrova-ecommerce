"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  images: string[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition"
    >
      <Link href={`/product/${product.slug}`}>
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-64 object-cover"
        />
        <div className="p-4">
          <h3 className="text-gray-900 font-semibold text-lg">{product.title}</h3>
          <p className="text-gray-600 mt-2">${product.price}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
