"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";


interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  description?: string;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data); // now ESLint is happy
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  fetchData(); // safe async call
}, []);


  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure to delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/add"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Add Product
        </Link>
      </div>

      <table className="w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Slug</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="border-b">
              <td className="p-3">{p.title}</td>
              <td className="p-3">{p.slug}</td>
              <td className="p-3">Rs {p.price}</td>
              <td className="p-3 space-x-2">
                <Link
                  href={`/admin/products/${p._id}`}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsPage;
