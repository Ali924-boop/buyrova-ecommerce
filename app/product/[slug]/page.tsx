"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Variant {
  color: string;
  size: string[];
  images: string[];
  price?: number; // optional: variant-specific price
}

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  variants: Variant[];
  description?: string;
}

// Dummy product with variants
const dummyProduct: Product = {
  _id: "1",
  title: "Summer T-shirt",
  slug: "summer-t-shirt",
  price: 1399,
  description: "Elegant and comfortable t-shirt perfect for any summer day.",
  variants: [
    {
      color: "Red",
      size: ["S", "M", "L", "XL"],
      images: ["/products/f1.jpg", "/products/f2.jpg"],
      price: 1399,
    },
    {
      color: "Blue",
      size: ["M", "L", "XL"],
      images: ["/products/f3.jpg", "/products/f4.jpg"],
      price: 1499,
    },
  ],
};

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(dummyProduct.variants[0].color);
  const [selectedSize, setSelectedSize] = useState(dummyProduct.variants[0].size[0]);
  const [activeImage, setActiveImage] = useState(dummyProduct.variants[0].images[0]);

  const selectedVariant = dummyProduct.variants.find(v => v.color === selectedColor)!;

  const handleAddToCart = () => {
    alert(`Added ${quantity} x ${dummyProduct.title} (${selectedColor}, ${selectedSize}) to cart!`);
    router.push("/cart");
  };

  return (
    <div className="pt-24 px-4 md:px-12 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <nav className="text-gray-600 text-sm mb-4">
        <Link href="/" className="hover:underline">Home</Link> /{" "}
        <Link href="/shop" className="hover:underline">Shop</Link> /{" "}
        <span className="font-semibold text-gray-900">{dummyProduct.title}</span>
      </nav>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Product Images */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <div className="w-full h-[500px] rounded-lg overflow-hidden shadow">
            <Image
              src={activeImage}
              alt={dummyProduct.title}
              width={600}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex gap-4 mt-2 overflow-x-auto">
            {selectedVariant.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`flex-shrink-0 border rounded-lg overflow-hidden transition-all duration-200 ${
                  activeImage === img ? "ring-2 ring-yellow-500" : "border-gray-200"
                }`}
              >
                <Image
                  src={img}
                  alt={`${dummyProduct.title}-${idx}`}
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="md:w-1/2 flex flex-col gap-6">
          <h1 className="text-4xl font-bold text-gray-900">{dummyProduct.title}</h1>
          <p className="text-gray-700 text-2xl font-semibold">${selectedVariant.price || dummyProduct.price}</p>
          <p className="text-gray-600">{dummyProduct.description}</p>

          {/* Color Selector */}
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700">Color:</span>
            {dummyProduct.variants.map(variant => (
              <button
                key={variant.color}
                onClick={() => {
                  setSelectedColor(variant.color);
                  setSelectedSize(variant.size[0]);
                  setActiveImage(variant.images[0]);
                }}
                className={`px-3 py-1 rounded border ${
                  selectedColor === variant.color ? "border-yellow-500" : "border-gray-300"
                }`}
              >
                {variant.color}
              </button>
            ))}
          </div>

          {/* Size Selector */}
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700">Size:</span>
            {selectedVariant.size.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-1 rounded border ${
                  selectedSize === size ? "border-yellow-500" : "border-gray-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Quantity selector */}
          <div className="flex items-center gap-4 mt-2">
            <span className="font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border rounded">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
              >−</button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-12 text-center border-x border-gray-300 px-1 py-1"
              />
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
              >+</button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-xl shadow transition transform hover:scale-105"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="max-w-6xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
              <Image
                src={`/products/f${i}.jpg`}
                alt={`Related Product ${i}`}
                width={300}
                height={300}
                className="w-full h-48 object-cover rounded"
              />
              <h3 className="mt-2 font-semibold text-gray-900">Product {i}</h3>
              <p className="text-gray-700 font-medium">${i * 499}</p>
              <Link href="/product/summer-t-shirt" className="mt-2 inline-block text-yellow-500 hover:underline">
                View Product
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
