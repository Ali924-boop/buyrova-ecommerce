"use client";

import React, { useState } from "react";

interface Variant {
  color: string;
  size: string[];
  images: string[];
  price?: number;
}

interface ProductFormProps {
  onSubmit: (product: {
    title: string;
    slug: string;
    price: number;
    variants: Variant[];
    description?: string;
  }) => void;
  loading?: boolean;
  initialData?: {
    title: string;
    slug: string;
    price: number;
    variants: Variant[];
    description?: string;
  };
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, loading, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [price, setPrice] = useState(initialData?.price || 0);
  const [description, setDescription] = useState(initialData?.description || "");
  const [variants, setVariants] = useState<Variant[]>(initialData?.variants || [
    { color: "", size: [], images: [], price: 0 },
  ]);

  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    // @ts-ignore
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { color: "", size: [], images: [], price: 0 }]);
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, slug, price, description, variants });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4">
      <div>
        <label className="block font-semibold">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block font-semibold">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block font-semibold">Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block font-semibold">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <h3 className="font-semibold mb-2">Variants</h3>
        {variants.map((variant, index) => (
          <div key={index} className="border p-3 rounded mb-2 relative">
            <button
              type="button"
              onClick={() => removeVariant(index)}
              className="absolute top-1 right-1 text-red-500 hover:text-red-700"
            >
              Remove
            </button>

            <div>
              <label className="block">Color</label>
              <input
                type="text"
                value={variant.color}
                onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
            </div>

            <div>
              <label className="block">Price</label>
              <input
                type="number"
                value={variant.price}
                onChange={(e) => handleVariantChange(index, "price", Number(e.target.value))}
                className="w-full border rounded px-2 py-1"
              />
            </div>

            <div>
              <label className="block">Images (comma separated URLs)</label>
              <input
                type="text"
                value={variant.images.join(",")}
                onChange={(e) =>
                  handleVariantChange(index, "images", e.target.value.split(","))
                }
                className="w-full border rounded px-2 py-1"
              />
            </div>

            <div>
              <label className="block">Sizes (comma separated)</label>
              <input
                type="text"
                value={variant.size.join(",")}
                onChange={(e) =>
                  handleVariantChange(index, "size", e.target.value.split(","))
                }
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addVariant}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Add Variant
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
};

export default ProductForm;
