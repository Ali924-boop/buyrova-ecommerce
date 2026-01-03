"use client";

import React, { useEffect, useState } from "react";
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
  createdAt?: string;
}

const NewArrivals: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        // Sort by createdAt descending (latest first)
        const sorted = data
          .sort((a: Product, b: Product) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
          .slice(0, 4)
          .filter((p: Product) => (p.images && p.images.length > 0) || (p.variants && p.variants[0]?.images?.length > 0));

        setProducts(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <p className="text-center py-12">Loading new arrivals...</p>;
  if (!products.length) return <p className="text-center py-12">No new arrivals.</p>;

  const addToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const image = product.images?.[0] || product.variants?.[0]?.images?.[0] || "/products/placeholder.jpg";
    const existing = cart.find((item: any) => item._id === product._id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1, image });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Product added to cart 🛒");
  };

  return (
    <section className="max-w-6xl mx-auto py-14 px-4">
      <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">
        New Arrivals
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => {
          const defaultImage = product.images?.[0] || product.variants?.[0]?.images?.[0] || "/products/placeholder.jpg";
          const hoverImage = product.images?.[1] || product.variants?.[0]?.images?.[1] || defaultImage;

          return (
            <div key={product._id} className="group bg-white rounded-xl shadow-sm hover:shadow-xl overflow-hidden transition cursor-pointer relative">
              {product.sale && (
                <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded z-10">
                  SALE
                </span>
              )}

              <div className="relative w-full h-64 overflow-hidden">
                <Image src={defaultImage} alt={product.title} fill className="object-cover transition-opacity duration-500 group-hover:opacity-0"/>
                <Image src={hoverImage} alt={product.title} fill className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"/>
                
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition">
                  <Link href={`/product/${product.slug}`} className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow hover:bg-gray-100">
                    View
                  </Link>
                  <button onClick={() => addToCart(product)} className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow hover:bg-yellow-600">
                    Add to Cart
                  </button>
                </div>
              </div>

              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
                <div className="flex justify-center items-center gap-2 mt-1">
                  <span className="text-gray-900 font-bold">Rs {product.price}</span>
                  {product.oldPrice && (
                    <span className="text-gray-400 line-through text-sm">Rs {product.oldPrice}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default NewArrivals;
