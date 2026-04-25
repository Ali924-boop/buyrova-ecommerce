"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Variant {
  color: string;
  size: string[];
  images: File[];
  price: number;
  stock: number;
}

interface VariantPreview {
  color: string;
  size: string[];
  imagePreviews: string[];
  price: number;
  stock: number;
}

interface Props {
  onSubmit: (data: FormData) => void;
  loading?: boolean;
  initialData?: any;
}

export default function ProductForm({ onSubmit, loading, initialData }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [price, setPrice] = useState<number>(initialData?.price || 0);
  const [category, setCategory] = useState(initialData?.category || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [section, setSection] = useState(initialData?.section || "all");

  const [variants, setVariants] = useState<Variant[]>(
    initialData?.variants?.map((v: any) => ({
      color: v.color || "",
      size: v.size || [],
      images: [],
      price: v.price || 0,
      stock: v.stock || 0,
    })) || [{ color: "", size: [], images: [], price: 0, stock: 0 }],
  );

  const [previews, setPreviews] = useState<VariantPreview[]>(
    initialData?.variants?.map((v: any) => ({
      color: v.color || "",
      size: v.size || [],
      imagePreviews: v.images || [],
      price: v.price || 0,
      stock: v.stock || 0,
    })) || [{ color: "", size: [], imagePreviews: [], price: 0, stock: 0 }],
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    );
  };

  const handleVariantChange = <K extends keyof Omit<Variant, "images">>(
    i: number,
    field: K,
    value: Variant[K],
  ) => {
    const updated = [...variants];
    updated[i][field] = value as any;
    setVariants(updated);
    const updatedPreviews = [...previews];
    (updatedPreviews[i] as any)[field] = value;
    setPreviews(updatedPreviews);
  };

  const handleImageChange = (i: number, files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    const updated = [...variants];
    updated[i].images = [...updated[i].images, ...fileArray];
    setVariants(updated);
    const newPreviews = fileArray.map((f) => URL.createObjectURL(f));
    const updatedPreviews = [...previews];
    updatedPreviews[i].imagePreviews = [
      ...updatedPreviews[i].imagePreviews,
      ...newPreviews,
    ];
    setPreviews(updatedPreviews);
  };

  const removeImage = (variantIndex: number, imgIndex: number) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].images.splice(imgIndex, 1);
    setVariants(updatedVariants);
    const updatedPreviews = [...previews];
    updatedPreviews[variantIndex].imagePreviews.splice(imgIndex, 1);
    setPreviews(updatedPreviews);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { color: "", size: [], images: [], price: 0, stock: 0 },
    ]);
    setPreviews([
      ...previews,
      { color: "", size: [], imagePreviews: [], price: 0, stock: 0 },
    ]);
  };

  const removeVariant = (i: number) => {
    setVariants(variants.filter((_, idx) => idx !== i));
    setPreviews(previews.filter((_, idx) => idx !== i));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || price <= 0) {
      alert("Please fill all required fields properly");
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("price", String(price));
    formData.append("description", description);
    formData.append("section", section);
    const variantMeta = variants.map((v) => ({
      color: v.color,
      size: v.size,
      price: v.price,
      stock: v.stock,
    }));
    formData.append("variants", JSON.stringify(variantMeta));
    variants.forEach((v, i) => {
      v.images.forEach((file) => {
        formData.append(`variant_${i}_images`, file);
      });
    });
   console.log("variantMeta being sent:", JSON.stringify(variantMeta));
onSubmit(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white dark:bg-gray-900 p-6 rounded-xl space-y-5"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {initialData ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {initialData
                ? "Update product details below"
                : "Fill in the details to add a new product"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray:800 rounded text-sm"
          >
            ← Back
          </button>
        </div>

        {/* SECTION: Basic Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Basic Information
          </h2>

          {/* TITLE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full p-2.5 border rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="e.g. Nike Air Max 2024"
            />
          </div>

          <div>
  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
    Category <span className="text-red-500">*</span>
  </label>
  <input
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full p-2.5 border rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
    placeholder="e.g. T-Shirt, Pants, Suits"
  />
</div>

          {/* SLUG */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              URL Slug
              <span className="text-gray-400 font-normal ml-1">
                (auto-generated from title)
              </span>
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full p-2.5 border rounded-lg dark:bg-gray-800 text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="nike-air-max-2024"
            />
            <p className="text-xs text-gray-400 mt-1">
              Used in the product URL: /product/
              <span className="font-mono">{slug || "your-slug"}</span>
            </p>
          </div>

          {/* PRICE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Base Price (Rs) <span className="text-red-500">*</span>
            </label>
           {/* BASE PRICE */}
<input
  type="number"
  value={price === 0 ? "" : price}
  onChange={(e) => setPrice(e.target.value === "" ? 0 : Number(e.target.value))}
  onFocus={(e) => e.target.select()}
  className="w-full p-2.5 border rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
  placeholder="e.g. 1500"
  min={0}
/>
            <p className="text-xs text-gray-400 mt-1">
              This is the default price. Each variant can have its own price.
            </p>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Product Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-2.5 border rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Describe the product — material, fit, features..."
            />
          </div>

          {/* SECTION */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Product Section
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full p-2.5 border rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">All Products</option>
              <option value="featured">Featured</option>
              <option value="new">New Arrivals</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Controls where this product appears on the storefront.
            </p>
          </div>
        </div>

        {/* SECTION: Variants */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-t pt-4">
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Product Variants
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Add color variants with sizes, stock and images.
              </p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              + Add Variant
            </button>
          </div>

          {variants.map((v, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 space-y-4 bg-gray-50 dark:bg-gray-800"
            >
              {/* Variant Header */}
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  Variant {i + 1}
                  {v.color && (
                    <span className="ml-2 font-normal text-gray-400 capitalize">
                      — {v.color}
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="text-red-500 text-xs hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              {/* COLOR */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Color Name
                </label>
                <input
                  placeholder="e.g. Red, Black, Navy Blue"
                  value={v.color}
                  onChange={(e) =>
                    handleVariantChange(i, "color", e.target.value)
                  }
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* VARIANT PRICE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Variant Price (Rs)
                  <span className="text-gray-400 font-normal ml-1">
                    (leave 0 to use base price)
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1800"
                  value={v.price}
                  onChange={(e) =>
                    handleVariantChange(i, "price", Number(e.target.value))
                  }
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  min={0}
                />
              </div>

              {/* STOCK */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Stock Quantity
                </label>
                {/* STOCK */}
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={v.stock === 0 ? "" : v.stock}
                  onChange={(e) =>
                    handleVariantChange(
                      i,
                      "stock",
                      e.target.value === "" ? 0 : Number(e.target.value),
                    )
                  }
                  onFocus={(e) => e.target.select()}
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  min={0}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Number of units available for this color variant.
                </p>
              </div>

              {/* SIZES */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        const current = variants[i].size;
                        const updated = current.includes(size)
                          ? current.filter((s) => s !== size)
                          : [...current, size];
                        handleVariantChange(i, "size", updated);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                        v.size.includes(size)
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Selected:{" "}
                  {v.size.length > 0
                    ? v.size.join(", ")
                    : "None — click to select"}
                </p>
              </div>

              {/* IMAGES */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Variant Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageChange(i, e.target.files)}
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Upload images for this color variant. Multiple allowed.
                </p>
              </div>

              {/* IMAGE PREVIEWS */}
              {previews[i]?.imagePreviews.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Image Previews
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {previews[i].imagePreviews.map((src, imgIdx) => (
                      <div key={imgIdx} className="relative w-20 h-20">
                        <img
                          src={src}
                          alt={`variant-${i}-img-${imgIdx}`}
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i, imgIdx)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SUBMIT */}
        <div className="border-t pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-base transition disabled:opacity-60"
          >
            {loading
              ? "Saving..."
              : initialData
                ? "Update Product"
                : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
