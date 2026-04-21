// app/admin/products/[id]/page.tsx
"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";

interface Params {
  params: { id: string };
}

const EditProductPage = ({ params }: Params) => {
  const [product, setProduct] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`/api/products/${params.id}`);
      const data = await res.json();
      setProduct(data);
    };
    fetchProduct();
  }, [params.id]);

  const handleSubmit = async (data: any) => {
    await fetch(`/api/products/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.push("/admin/products");
  };

  if (!product) return <p>Loading product...</p>;

  return <ProductForm initialData={product} onSubmit={handleSubmit} />;
};

export default EditProductPage;
