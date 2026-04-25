"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { toast } from "react-toastify";

const EditProductPage = () => {
  const router  = useRouter();
  const params  = useParams();
  const id      = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) { setError("Product not found or failed to load."); return; }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError("Something went wrong while fetching the product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ✅ FormData comes directly from ProductForm — send it to PUT route
  const handleSubmit = async (formData: FormData) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: formData, // ✅ no Content-Type header — browser sets multipart boundary
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err?.error || "Update failed");
        return;
      }

      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading product...</div>;
  if (error)   return <div className="p-6 text-red-500">{error}</div>;
  if (!product) return <div className="p-6 text-gray-500">Product not found.</div>;

  return <ProductForm initialData={product} onSubmit={handleSubmit} loading={saving} />;
};

export default EditProductPage;