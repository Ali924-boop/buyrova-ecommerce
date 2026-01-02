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

const dummyProducts: Product[] = [
  {
    _id: "1",
    title: "Summer Hoodie",
    slug: "summer-hoodie",
    price: 1599,
    oldPrice: 1999,
    images: ["/products/f1.jpg"],
    sale: true,
  },
  {
    _id: "2",
    title: "T-shirt Grapes",
    slug: "t-shirt-grapes",
    price: 4999,
    images: ["/products/f2.jpg"],
  },
  {
    _id: "3",
    title: "T-shirt Flower",
    slug: "t-shirt-flower",
    price: 1299,
    oldPrice: 1499,
    images: ["/products/f3.jpg"],
    sale: true,
  },
  {
    _id: "4",
    title: "Luxury Sofa",
    slug: "luxury-sofa",
    price: 4999,
    images: ["/products/f4.jpg"],
  },
  {
    _id: "5",
    title: "Modern Chair",
    slug: "modern-chair",
    price: 1999,
    images: ["/products/f5.jpg"],
  },
  {
    _id: "6",
    title: "Designer Lamp",
    slug: "designer-lamp",
    price: 899,
    images: ["/products/f6.jpg"],
  },
  {
    _id: "7",
    title: "T-shirt Grapes",
    slug: "t-shirt-grapes",
    price: 4999,
    images: ["/products/f7.jpg"],
  },
  {
    _id: "8",
    title: "T-shirt Flower",
    slug: "t-shirt-flower",
    price: 1299,
    images: ["/products/n1.jpg"],
  },
  {
    _id: "9",
    title: "Luxury Sofa",
    slug: "luxury-sofa",
    price: 4999,
    images: ["/products/n2.jpg"],
  },
  {
    _id: "10",
    title: "Modern Chair",
    slug: "modern-chair",
    price: 1999,
    images: ["/products/n3.jpg"],
  },
  {
    _id: "11",
    title: "Summer Hoodie",
    slug: "summer-hoodie",
    price: 1599,
    images: ["/products/n4.jpg"],
  },
  {
    _id: "12",
    title: "T-shirt Grapes",
    slug: "t-shirt-grapes",
    price: 4999,
    images: ["/products/n5.jpg"],
  },
  {
    _id: "13",
    title: "T-shirt Flower",
    slug: "t-shirt-flower",
    price: 1299,
    images: ["/products/n6.jpg"],
  },
  {
    _id: "14",
    title: "Luxury Sofa",
    slug: "luxury-sofa",
    price: 4999,
    images: ["/products/n7.jpg"],
  },
  {
    _id: "15",
    title: "Modern Chair",
    slug: "modern-chair",
    price: 1999,
    images: ["/products/n8.jpg"],
  },
];

const ShopPage: React.FC = () => {
  return (
    <div className="pt-24 px-6 md:px-12 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
        Shop Collection
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {dummyProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden relative group cursor-pointer"
          >
            {/* Sale Badge */}
            {product.sale && (
              <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded z-10">
                SALE
              </span>
            )}

            {/* Product Image */}
            <div className="relative w-full h-64 overflow-hidden">
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Overlay on Hover */}
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
              <h3 className="text-lg font-semibold text-gray-900">
                {product.title}
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-gray-900 font-bold">${product.price}</p>
                {product.oldPrice && (
                  <p className="text-gray-500 line-through text-sm">
                    ${product.oldPrice}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;
