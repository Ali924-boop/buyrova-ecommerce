"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ FETCH PRODUCT BY ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();

        setProduct(data.product);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // ✅ UPDATE PRODUCT
  const handleUpdate = async (updatedProduct: any) => {
    setSaving(true);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!res.ok) {
        throw new Error("Failed to update product");
      }

      alert("Product updated successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      alert("Error updating product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Product not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* TITLE */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Edit Product
        </h1>

        {/* PRODUCT FORM */}
        <ProductForm
          initialData={product}
          onSubmit={handleUpdate}
          loading={saving}
        />
      </div>
    </div>
  );
}