"use client";

import React, { useState } from "react";
import ProductForm from "@/components/ProductForm";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ✅ ProductForm already builds FormData — just send it directly
  const handleSubmit = async (formData: FormData) => {
    try {
      setLoading(true);

      const res = await fetch("/api/products", {
        method: "POST",
        // ✅ No Content-Type header — browser sets multipart boundary automatically
        body: formData,
      });

     if (!res.ok) {
  let errorMessage = "Failed to add product";
  try {
    const err = await res.json();
    errorMessage = err?.error || errorMessage;
  } catch {
    // ✅ response body was empty or not JSON
    errorMessage = `Server error: ${res.status}`;
  }
  throw new Error(errorMessage);
}

      toast.success("Product added successfully");
      router.push("/admin/products");

    } catch (error: unknown) {
      console.error("Error adding product:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductForm onSubmit={handleSubmit} loading={loading} />
  );
}