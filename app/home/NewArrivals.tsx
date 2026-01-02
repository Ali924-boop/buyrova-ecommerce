"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  oldPrice?: number;
  images: string[];
  sale?: boolean;
}

interface NewArrivalsProps {
  products?: Product[];
}

const NewArrivals: React.FC<NewArrivalsProps> = ({ products }) => {
  // Internal dummy products if none provided
  const dummyProducts: Product[] = products || [
    {
      _id: "1",
      title: "Summer Hoodie",
      slug: "summer-hoodie",
      price: 1599,
      oldPrice: 1999,
      images: ["/products/f1.jpg", "/products/f1b.jpg"],
      sale: true,
    },
    {
      _id: "2",
      title: "T-shirt Grapes",
      slug: "t-shirt-grapes",
      price: 4999,
      images: ["/products/f2.jpg", "/products/f2b.jpg"],
    },
    {
      _id: "3",
      title: "T-shirt Flower",
      slug: "t-shirt-flower",
      price: 1299,
      oldPrice: 1499,
      images: ["/products/f3.jpg", "/products/f3b.jpg"],
      sale: true,
    },
    {
      _id: "4",
      title: "Luxury Sofa",
      slug: "luxury-sofa",
      price: 4999,
      images: ["/products/f4.jpg", "/products/f4b.jpg"],
    },
  ];

  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">New Arrivals</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {dummyProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 relative group cursor-pointer overflow-hidden"
          >
            {/* Sale Badge */}
            {product.sale && (
              <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded z-10">
                SALE
              </span>
            )}

            {/* Image Swap on Hover */}
            <div className="relative w-full h-48">
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105 group-hover:opacity-0"
              />
              <Image
                src={product.images[1] || product.images[0]}
                alt={product.title}
                fill
                className="object-cover absolute top-0 left-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
              />
            </div>

            {/* Hover Buttons */}
            <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 z-10">
              <Link
                href={`/product/${product.slug}`}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded font-semibold text-sm"
              >
                Quick View
              </Link>
              <button className="bg-white hover:bg-gray-200 text-gray-900 px-3 py-2 rounded font-semibold text-sm">
                Add to Cart
              </button>
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col gap-1">
              <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
              <div className="flex items-center gap-2">
                <p className="text-gray-900 font-bold">${product.price}</p>
                {product.oldPrice && (
                  <p className="text-gray-500 line-through text-sm">${product.oldPrice}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;
