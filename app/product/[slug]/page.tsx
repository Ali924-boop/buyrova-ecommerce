"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  variants: Variant[];
  description?: string;
}

const colorMap: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  black: "bg-black",
};

const ProductDetailPage = () => {
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch("/api/products");
        const data: Product[] = await res.json();

        if (data.length > 0) {
          const p = data[0]; // abhi first product
          setProduct(p);

          setSelectedColor(p.variants[0].color);
          setSelectedSize(p.variants[0].size[0]);
          setActiveImage(p.variants[0].images[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  if (loading)
    return <p className="pt-24 text-center">Loading...</p>;

  if (!product)
    return <p className="pt-24 text-center">Product not found</p>;

  const selectedVariant = product.variants.find(
    v => v.color === selectedColor
  )!;

  return (
    <div className="pt-24 px-4 md:px-12 bg-gray-50 min-h-screen">
      <nav className="text-sm text-gray-600 mb-6">
        <Link href="/">Home</Link> /{" "}
        <Link href="/shop">Shop</Link> /{" "}
        <span className="font-semibold">{product.title}</span>
      </nav>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="relative w-full h-[520px] bg-white rounded-xl shadow overflow-hidden">
            <Image
              src={activeImage}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex gap-3 mt-4">
            {selectedVariant.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className="relative w-20 h-20 border rounded-lg overflow-hidden"
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">{product.title}</h1>
          <p className="text-2xl font-semibold">
            Rs {selectedVariant.price ?? product.price}
          </p>

          <p className="text-gray-600">{product.description}</p>

          {/* Colors */}
          <div>
            <p className="font-medium mb-2">Color</p>
            <div className="flex gap-3">
              {product.variants.map(v => (
                <button
                  key={v.color}
                  onClick={() => {
                    setSelectedColor(v.color);
                    setSelectedSize(v.size[0]);
                    setActiveImage(v.images[0]);
                  }}
                  className={`w-9 h-9 rounded-full border-2 ${
                    colorMap[v.color]
                  } ${
                    selectedColor === v.color
                      ? "border-yellow-500 scale-110"
                      : "border-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <p className="font-medium mb-2">Size</p>
            <div className="flex gap-3 flex-wrap">
              {["S", "M", "L", "XL"].map(size => {
                const available = selectedVariant.size.includes(size);
                return (
                  <button
                    key={size}
                    disabled={!available}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg ${
                      selectedSize === size
                        ? "bg-black text-white"
                        : "bg-white"
                    } ${!available && "opacity-40"}`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <p className="font-medium">Quantity</p>
            <div className="flex border rounded-lg">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span className="px-4">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
          </div>

          <button
            onClick={() => router.push("/cart")}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-xl"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
