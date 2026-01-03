"use client";
import React, { useState } from "react";

export interface Variant {
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
  initialData?: {
    title: string;
    slug: string;
    price: number;
    variants: Variant[];
    description?: string;
  };
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [price, setPrice] = useState(initialData?.price || 0);
  const [description, setDescription] = useState(initialData?.description || "");
  const [variants, setVariants] = useState<Variant[]>(initialData?.variants || [
    { color: "", size: [], images: [], price: 0 },
  ]);

  // Add new variant
  const addVariant = () => setVariants([...variants, { color: "", size: [], images: [], price: 0 }]);

  // Remove variant
  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  // Update variant field
  const handleVariantChange = (
    index: number,
    field: keyof Variant,
    value: string | string[] | number
  ) => {
    const newVariants = [...variants];
    newVariants[index][field] = value as any;
    setVariants(newVariants);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, slug, price, description, variants });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-6">
      <h2 className="text-2xl font-bold">Add New Product</h2>

      <div>
        <label className="block font-semibold mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Price (Rs)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Variants</h3>
        {variants.map((variant, index) => (
          <div key={index} className="border p-3 rounded space-y-2 relative">
            <button
              type="button"
              onClick={() => removeVariant(index)}
              className="absolute top-2 right-2 text-red-500 font-bold"
            >
              X
            </button>

            <div>
              <label>Color</label>
              <input
                type="text"
                value={variant.color}
                onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                className="w-full border px-2 py-1 rounded"
              />
            </div>

            <div>
              <label>Sizes (comma separated)</label>
              <input
                type="text"
                value={variant.size.join(",")}
                onChange={(e) =>
                  handleVariantChange(index, "size", e.target.value.split(",").map((s) => s.trim()))
                }
                className="w-full border px-2 py-1 rounded"
              />
            </div>

            <div>
              <label>Images (comma separated URLs)</label>
              <input
                type="text"
                value={variant.images.join(",")}
                onChange={(e) =>
                  handleVariantChange(index, "images", e.target.value.split(",").map((s) => s.trim()))
                }
                className="w-full border px-2 py-1 rounded"
              />
            </div>

            <div>
              <label>Price (Rs)</label>
              <input
                type="number"
                value={variant.price || 0}
                onChange={(e) => handleVariantChange(index, "price", Number(e.target.value))}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addVariant}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Variant
        </button>
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded font-semibold mt-4"
      >
        Submit
      </button>
    </form>
  );
};

export default ProductForm;
