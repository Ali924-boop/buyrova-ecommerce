"use client";

import React, { useState, useRef } from "react";
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

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const CATEGORIES = [
  {
    group: "Men",
    items: [
      { label: "Men — T-Shirts", value: "men-tshirts" },
      { label: "Men — Shirts",   value: "men-shirts"  },
      { label: "Men — Pants",    value: "men-pants"   },
      { label: "Men — Shoes",    value: "men-shoes"   },
      { label: "Men — Glasses",  value: "men-glasses" },
      { label: "Men — Watches",  value: "men-watches" },
    ],
  },
  {
    group: "Women",
    items: [
      { label: "Women — T-Shirts", value: "women-tshirts" },
      { label: "Women — Shirts",   value: "women-shirts"  },
      { label: "Women — Pants",    value: "women-pants"   },
      { label: "Women — Shoes",    value: "women-shoes"   },
      { label: "Women — Glasses",  value: "women-glasses" },
      { label: "Women — Watches",  value: "women-watches" },
    ],
  },
];

const ALL_CATEGORIES = CATEGORIES.flatMap((g) => g.items);

const COLOR_SWATCHES = [
  { name: "Black",    hex: "#000000" },
  { name: "White",    hex: "#FFFFFF" },
  { name: "Red",      hex: "#EF4444" },
  { name: "Navy Blue",hex: "#1E3A5F" },
  { name: "Sky Blue", hex: "#38BDF8" },
  { name: "Green",    hex: "#22C55E" },
  { name: "Yellow",   hex: "#EAB308" },
  { name: "Orange",   hex: "#F97316" },
  { name: "Pink",     hex: "#EC4899" },
  { name: "Purple",   hex: "#A855F7" },
  { name: "Gray",     hex: "#6B7280" },
  { name: "Brown",    hex: "#92400E" },
];

export default function ProductForm({ onSubmit, loading, initialData }: Props) {
  const router = useRouter();

  const [title,       setTitle]       = useState(initialData?.title       || "");
  const [slug,        setSlug]        = useState(initialData?.slug        || "");
  const [price,       setPrice]       = useState<number>(initialData?.price || 0);
  const [category,    setCategory]    = useState(initialData?.category    || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [section,     setSection]     = useState(initialData?.section     || "all");

  // ── category dropdown ──
  const [catOpen,   setCatOpen]   = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const catRef = useRef<HTMLDivElement>(null);

  const [variants, setVariants] = useState<Variant[]>(
    initialData?.variants?.map((v: any) => ({
      color: v.color || "",
      size:  v.size  || [],
      images: [],
      price: v.price || 0,
      stock: v.stock || 0,
    })) || [{ color: "", size: [], images: [], price: 0, stock: 0 }],
  );

  const [previews, setPreviews] = useState<VariantPreview[]>(
    initialData?.variants?.map((v: any) => ({
      color:         v.color  || "",
      size:          v.size   || [],
      imagePreviews: v.images || [],
      price: v.price || 0,
      stock: v.stock || 0,
    })) || [{ color: "", size: [], imagePreviews: [], price: 0, stock: 0 }],
  );

  const [collapsed, setCollapsed] = useState<boolean[]>([false]);
  const [dragOver,  setDragOver]  = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── derived ──
  const selectedLabel = ALL_CATEGORIES.find((c) => c.value === category)?.label || "";

  const filteredCategories = catSearch.trim()
    ? CATEGORIES.map((g) => ({
        ...g,
        items: g.items.filter((item) =>
          item.label.toLowerCase().includes(catSearch.toLowerCase()),
        ),
      })).filter((g) => g.items.length > 0)
    : CATEGORIES;

  // ── handlers ──
  const handleCategorySelect = (value: string) => {
    setCategory(value);
    setCatOpen(false);
    setCatSearch("");
  };

  const handleCatBlur = (e: React.FocusEvent) => {
    if (catRef.current && !catRef.current.contains(e.relatedTarget as Node)) {
      setCatOpen(false);
      setCatSearch("");
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(
      val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    );
  };

  const handleVariantChange = <K extends keyof Omit<Variant, "images">>(
    i: number, field: K, value: Variant[K],
  ) => {
    const uv = [...variants];
    uv[i][field] = value as any;
    setVariants(uv);
    const up = [...previews];
    (up[i] as any)[field] = value;
    setPreviews(up);
  };

  const addImages = (i: number, files: File[]) => {
    const uv = [...variants];
    uv[i].images = [...uv[i].images, ...files];
    setVariants(uv);
    const up = [...previews];
    up[i].imagePreviews = [...up[i].imagePreviews, ...files.map((f) => URL.createObjectURL(f))];
    setPreviews(up);
  };

  const handleImageChange = (i: number, files: FileList | null) => {
    if (files) addImages(i, Array.from(files));
  };

  const handleDrop = (i: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) addImages(i, files);
  };

  const removeImage = (vi: number, ii: number) => {
    const uv = [...variants];
    uv[vi].images.splice(ii, 1);
    setVariants(uv);
    const up = [...previews];
    up[vi].imagePreviews.splice(ii, 1);
    setPreviews(up);
  };

  const clearAllImages = (i: number) => {
    const uv = [...variants]; uv[i].images = []; setVariants(uv);
    const up = [...previews]; up[i].imagePreviews = []; setPreviews(up);
  };

  const addVariant = () => {
    setVariants([...variants, { color: "", size: [], images: [], price: 0, stock: 0 }]);
    setPreviews([...previews, { color: "", size: [], imagePreviews: [], price: 0, stock: 0 }]);
    setCollapsed([...collapsed, false]);
  };

  const removeVariant = (i: number) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, idx) => idx !== i));
    setPreviews(previews.filter((_, idx) => idx !== i));
    setCollapsed(collapsed.filter((_, idx) => idx !== i));
  };

  const toggleCollapse = (i: number) => {
    const u = [...collapsed]; u[i] = !u[i]; setCollapsed(u);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || price <= 0 || !category) {
      alert("Please fill all required fields: title, category, and price.");
      return;
    }
    const fd = new FormData();
    fd.append("title",       title);
    fd.append("slug",        slug);
    fd.append("price",       String(price));
    fd.append("category",    category);
    fd.append("description", description);
    fd.append("section",     section);
    fd.append("variants",    JSON.stringify(variants.map((v) => ({ color: v.color, size: v.size, price: v.price, stock: v.stock }))));
    variants.forEach((v, i) => v.images.forEach((f) => fd.append(`variant_${i}_images`, f)));
    onSubmit(fd);
  };

  const stockLabel = (s: number) =>
    s > 10 ? { text: "✓ In stock",     cls: "text-green-600"  } :
    s >  0 ? { text: "⚠ Low stock",    cls: "text-yellow-600" } :
             { text: "✕ Out of stock", cls: "text-red-500"    };

  // ── shared input classes ──
  const inputCls = "w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition";
  const varInputCls = "w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden"
      >
        {/* ── HEADER ── */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {initialData ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {initialData ? "Update product details below" : "Fill in the details to add a new product"}
            </p>
          </div>
          <button
            type="button" onClick={() => router.back()}
            className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
          >
            ← Back
          </button>
        </div>

        <div className="p-6 space-y-8">

          {/* ── BASIC INFO ── */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Basic Information</h2>

            {/* TITLE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input value={title} onChange={(e) => handleTitleChange(e.target.value)}
                className={inputCls} placeholder="e.g. Nike Air Max 2024" />
            </div>

            {/* ── CATEGORY DROPDOWN ── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>

              <div ref={catRef} className="relative" onBlur={handleCatBlur}>

                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => { setCatOpen((o) => !o); setCatSearch(""); }}
                  className={`w-full flex items-center justify-between p-2.5 border rounded-lg text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-800 ${
                    catOpen
                      ? "border-yellow-400 ring-2 ring-yellow-400"
                      : "border-gray-200 dark:border-gray-700"
                  } ${category ? "text-gray-800 dark:text-gray-100" : "text-gray-400"}`}
                >
                  {/* Show color-coded gender badge + label when selected */}
                  {category ? (
                    <span className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        category.startsWith("men-")
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
                      }`}>
                        {category.startsWith("men-") ? "MEN" : "WOMEN"}
                      </span>
                      {selectedLabel.split("—")[1]?.trim()}
                    </span>
                  ) : (
                    "Select a category…"
                  )}
                  <span className={`text-gray-400 text-xs ml-2 flex-shrink-0 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>

                {/* Panel */}
                {catOpen && (
                  <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">

                    {/* Search */}
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                      <input
                        autoFocus
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                        placeholder="Search categories…"
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                      />
                    </div>

                    {/* List */}
                    <div className="max-h-72 overflow-y-auto">
                      {filteredCategories.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">No categories found</p>
                      ) : (
                        filteredCategories.map((group) => (
                          <div key={group.group}>
                            {/* Group header */}
                            <div className={`px-3 py-2 text-xs font-bold uppercase tracking-widest sticky top-0 flex items-center gap-2 ${
                              group.group === "Men"
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                : "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"
                            }`}>
                              <span>{group.group === "Men" ? "♂" : "♀"}</span>
                              {group.group}
                            </div>

                            {group.items.map((item) => (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => handleCategorySelect(item.value)}
                                className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center justify-between ${
                                  category === item.value
                                    ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 font-semibold"
                                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60"
                                }`}
                              >
                                <span>{item.label.split("—")[1]?.trim()}</span>
                                {category === item.value && (
                                  <span className="text-yellow-500">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Clear */}
                    {category && (
                      <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                        <button
                          type="button"
                          onClick={() => { setCategory(""); setCatOpen(false); }}
                          className="w-full text-xs text-red-400 hover:text-red-600 py-1 transition"
                        >
                          ✕ Clear selection
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SLUG */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                URL Slug <span className="text-gray-400 font-normal">(auto-generated)</span>
              </label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)}
                className={`${inputCls} text-gray-500 font-mono text-sm`}
                placeholder="nike-air-max-2024" />
              <p className="text-xs text-gray-400 mt-1">
                /product/<span className="text-gray-600 dark:text-gray-300">{slug || "your-slug"}</span>
              </p>
            </div>

            {/* PRICE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Base Price (Rs) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold pointer-events-none">Rs</span>
                <input
                  type="number"
                  value={price === 0 ? "" : price}
                  onChange={(e) => setPrice(e.target.value === "" ? 0 : Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  className={`${inputCls} pl-9`} placeholder="1500" min={0}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Default price. Each variant can override this.</p>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Product Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                rows={3} className={`${inputCls} resize-none`}
                placeholder="Describe the product — material, fit, features..." />
            </div>

            {/* SECTION */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Product Section</label>
              <select value={section} onChange={(e) => setSection(e.target.value)} className={inputCls}>
                <option value="all">All Products</option>
                <option value="featured">Featured</option>
                <option value="new">New Arrivals</option>
              </select>
            </div>
          </section>

          {/* ── VARIANTS ── */}
          <section className="space-y-3">
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-6">
              <div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Variants</h2>
                <p className="text-xs text-gray-400 mt-0.5">{variants.length} variant{variants.length !== 1 ? "s" : ""} added</p>
              </div>
              <button type="button" onClick={addVariant}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium">
                <span className="text-base leading-none">+</span> Add Variant
              </button>
            </div>

            {variants.map((v, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">

                {/* Variant header */}
                <div
                  className="flex justify-between items-center px-4 py-3 cursor-pointer select-none bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition"
                  onClick={() => toggleCollapse(i)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {v.color && (
                      <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-500 flex-shrink-0"
                        style={{ backgroundColor: COLOR_SWATCHES.find((c) => c.name.toLowerCase() === v.color.toLowerCase())?.hex || v.color }} />
                    )}
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                      Variant {i + 1}{v.color && <span className="ml-1 font-normal text-gray-400 capitalize">— {v.color}</span>}
                    </span>
                    {v.size.length > 0 && <span className="text-xs text-gray-400 hidden sm:inline flex-shrink-0">· {v.size.join(", ")}</span>}
                    {v.stock > 0  && <span className={`text-xs font-semibold hidden sm:inline flex-shrink-0 ${stockLabel(v.stock).cls}`}>· {v.stock} pcs</span>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    {variants.length > 1 && (
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); removeVariant(i); }}
                        className="text-red-400 hover:text-red-600 text-xs font-medium transition">
                        Remove
                      </button>
                    )}
                    <span className="text-gray-400 text-xs">{collapsed[i] ? "▼" : "▲"}</span>
                  </div>
                </div>

                {/* Variant body */}
                {!collapsed[i] && (
                  <div className="p-4 space-y-5 bg-white dark:bg-gray-900">

                    {/* COLOR */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Color Name</label>
                      <input placeholder="e.g. Red, Black, Navy Blue" value={v.color}
                        onChange={(e) => handleVariantChange(i, "color", e.target.value)}
                        className={`${varInputCls} mb-2`} />
                      <div className="flex flex-wrap gap-2">
                        {COLOR_SWATCHES.map((c) => (
                          <button key={c.name} type="button" title={c.name}
                            onClick={() => handleVariantChange(i, "color", c.name)}
                            className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                              v.color.toLowerCase() === c.name.toLowerCase()
                                ? "border-yellow-400 scale-110 shadow-md"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                            style={{ backgroundColor: c.hex }} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">Click a swatch to auto-fill, or type a custom name.</p>
                    </div>

                    {/* PRICE + STOCK */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Variant Price (Rs)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold pointer-events-none">Rs</span>
                          <input type="number" placeholder="Leave empty = base price"
                            value={v.price === 0 ? "" : v.price}
                            onChange={(e) => handleVariantChange(i, "price", e.target.value === "" ? 0 : Number(e.target.value))}
                            onFocus={(e) => e.target.select()}
                            className={`${varInputCls} pl-8`} min={0} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">0 = uses base price</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Stock Quantity</label>
                        <input type="number" placeholder="e.g. 50"
                          value={v.stock === 0 ? "" : v.stock}
                          onChange={(e) => handleVariantChange(i, "stock", e.target.value === "" ? 0 : Number(e.target.value))}
                          onFocus={(e) => e.target.select()}
                          className={varInputCls} min={0} />
                        {v.stock > 0 && <p className={`text-xs mt-1 font-medium ${stockLabel(v.stock).cls}`}>{stockLabel(v.stock).text}</p>}
                      </div>
                    </div>

                    {/* SIZES */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Available Sizes</label>
                      <div className="flex flex-wrap gap-2">
                        {SIZES.map((size) => (
                          <button key={size} type="button"
                            onClick={() => {
                              const cur = variants[i].size;
                              handleVariantChange(i, "size", cur.includes(size) ? cur.filter((s) => s !== size) : [...cur, size]);
                            }}
                            className={`w-12 py-2 rounded-lg border text-sm font-semibold transition-all ${
                              v.size.includes(size)
                                ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white"
                                : "bg-white text-gray-600 border-gray-300 hover:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                            }`}>
                            {size}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">
                        {v.size.length > 0
                          ? <>Selected: <span className="text-gray-600 dark:text-gray-300 font-medium">{v.size.join(", ")}</span></>
                          : "No sizes selected"}
                      </p>
                    </div>

                    {/* IMAGE UPLOAD */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Variant Images</label>
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(e) => handleDrop(i, e)}
                        onClick={() => fileInputRefs.current[i]?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                          dragOver === i
                            ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800/50"
                        }`}
                      >
                        <div className="text-3xl mb-1">🖼️</div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold text-gray-700 dark:text-gray-200">Click to upload</span> or drag & drop
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP — multiple files supported</p>
                        <input ref={(el) => { fileInputRefs.current[i] = el; }}
                          type="file" accept="image/*" multiple className="hidden"
                          onChange={(e) => handleImageChange(i, e.target.files)} />
                      </div>
                    </div>

                    {/* IMAGE PREVIEWS */}
                    {previews[i]?.imagePreviews.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Images ({previews[i].imagePreviews.length})
                          </label>
                          <button type="button" onClick={() => clearAllImages(i)}
                            className="text-xs text-red-400 hover:text-red-600 transition">
                            Clear all
                          </button>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {previews[i].imagePreviews.map((src, imgIdx) => (
                            <div key={imgIdx} className="relative group aspect-square">
                              <img src={src} alt={`v${i}-img${imgIdx}`}
                                className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                              <button type="button" onClick={() => removeImage(i, imgIdx)}
                                className="absolute inset-0 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-lg">
                                ✕
                              </button>
                              {imgIdx === 0 && (
                                <span className="absolute bottom-1 left-1 text-[10px] bg-yellow-400 text-black px-1 py-0.5 rounded font-bold leading-none">
                                  Main
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* ── SUBMIT ── */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white py-3 rounded-xl font-semibold text-base transition disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? "Saving…" : initialData ? "Update Product" : "Add Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}