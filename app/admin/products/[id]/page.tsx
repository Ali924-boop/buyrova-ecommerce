// app/admin/products/[id]/page.tsx
"use client"

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";

interface Params {
  params: Promise<{ id: string }>;
}

const EditProductPage = ({ params }: Params) => {
  const unwrappedParams = use(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [product, setProduct] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`/api/products/${unwrappedParams.id}`);
      const data = await res.json();
      setProduct(data);
    };
    fetchProduct();
  }, [unwrappedParams.id]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    await fetch(`/api/products/${unwrappedParams.id}`, {
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
