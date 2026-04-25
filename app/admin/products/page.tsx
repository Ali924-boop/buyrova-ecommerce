"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Variant {
  color?: string;
  size?: string[];  // ✅ fixed: was "sizes", should be "size"
  images?: string[];
  price?: number;
  stock?: number;   // ✅ added stock
}

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  description?: string;
  variants?: Variant[];
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res  = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) fetchProducts();
    else alert("Failed to delete product");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border
            bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700
            text-gray-700 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
        </div>
        <Link
          href="/admin/products/add"
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold transition"
        >
          + Add Product
        </Link>
      </div>

      {/* Empty state */}
      {products.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No products found. Add your first product.
        </div>
      )}

      {/* Table */}
      {products.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-white dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Slug</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Variants</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800 transition">

                  {/* Image */}
                  <td className="p-3">
                    <img
                      src={p.variants?.[0]?.images?.[0] || "/placeholder.png"}
                      alt={p.title}
                      className="w-14 h-14 object-cover rounded-lg border"
                    />
                  </td>

                  {/* Title */}
                  <td className="p-3 font-medium">{p.title}</td>

                  {/* Slug */}
                  <td className="p-3 text-gray-500">{p.slug}</td>

                  {/* Price */}
                  <td className="p-3 font-semibold text-yellow-600">
                    Rs {p.price}
                  </td>

                  {/* Variants */}
                  <td className="p-3 text-xs space-y-2">
                    {p.variants?.length ? (
                      p.variants.map((v, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 border p-2 rounded-md flex-wrap"
                        >
                          {/* Color */}
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: v.color }}
                              title={v.color}
                            />
                            <span className="text-gray-600 capitalize">{v.color}</span>
                          </div>

                          {/* Sizes ✅ fixed: v.size not v.sizes */}
                          <div className="text-gray-500">
                            {v.size?.length ? v.size.join(", ") : "No sizes"}
                          </div>

                          {/* Stock */}
                          <div className={`font-semibold ${
                            (v.stock ?? 0) > 5  ? "text-green-600" :
                            (v.stock ?? 0) > 0  ? "text-yellow-600" :
                                                  "text-red-600"
                          }`}>
                            {v.stock ?? 0} pcs
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400">No variants</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-3 space-x-2 whitespace-nowrap">
                    <Link
                      href={`/admin/products/${p._id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;