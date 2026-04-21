"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

interface ProductData {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sale?: boolean;
}

interface ProductFormProps {
  onSubmit: (data: ProductData) => void | Promise<void>;
  isLoading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, isLoading = false, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [images, setImages] = useState<File[]>([]);
  const [sale, setSale] = useState(initialData?.sale || false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!title || !description || !price || !category) {
      alert("Please fill all required fields!");
      return;
    }

    if (images.length === 0) {
      alert("Please upload at least one image!");
      return;
    }

    // Convert images to base64 (simplest way for demo; in production, use FormData or upload to storage)
    const readImages = async () => {
      const imagePromises = images.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      );

      try {
        const imagesBase64 = await Promise.all(imagePromises);
        onSubmit({
          title,
          description,
          price: parseFloat(price),
          category,
          images: imagesBase64,
          sale,
        });

        // Reset form
        setTitle("");
        setDescription("");
        setPrice("");
        setCategory("");
        setImages([]);
        setSale(false);
      } catch (err) {
        console.error(err);
        alert("Failed to process images");
      }
    };

    readImages();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="mb-4">
        <label className="block font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          required
        />
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Price ($)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
          required
        />
        {images.length > 0 && (
          <div className="flex flex-wrap mt-2 gap-2">
            {images.map((img, idx) => (
              <span key={idx} className="text-sm bg-gray-200 px-2 py-1 rounded">
                {img.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 flex items-center gap-2">
        <input
          type="checkbox"
          checked={sale}
          onChange={() => setSale(!sale)}
          className="h-4 w-4"
        />
        <label className="font-medium">On Sale?</label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
};

export default ProductForm;
