import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const product = await Product.findById(id).lean();
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const formData    = await req.formData();
    const title       = formData.get("title") as string;
    const slug        = formData.get("slug") as string;
    const price       = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const section     = formData.get("section") as string;
    const variantsRaw = formData.get("variants") as string;

    if (!title || !slug || isNaN(price)) {
      return NextResponse.json({ error: "Title, slug and price are required" }, { status: 400 });
    }

    if (!variantsRaw) {
      return NextResponse.json({ error: "Variants missing" }, { status: 400 });
    }

    const variantMeta = JSON.parse(variantsRaw);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // ✅ fetch existing product to keep old images if no new ones uploaded
    const existing = await Product.findById(id).lean() as any;

    const variants = await Promise.all(
      variantMeta.map(async (meta: any, i: number) => {
        const files = formData.getAll(`variant_${i}_images`) as File[];

        let imagePaths: string[] = [];

        if (files.length > 0) {
          // ✅ new images uploaded — save them
          imagePaths = await Promise.all(
            files.map(async (file) => {
              const bytes    = await file.arrayBuffer();
              const buffer   = Buffer.from(bytes);
              const filename = `${Date.now()}-${file.name}`;
              const savePath = path.join(uploadsDir, filename);
              await writeFile(savePath, buffer);
              return `/uploads/${filename}`;
            })
          );
        } else {
          // ✅ no new images — keep existing images from DB
          imagePaths = existing?.variants?.[i]?.images || [];
        }

        return {
          color:  meta.color,
          size:   meta.size,
          price:  meta.price,
          stock:  meta.stock ?? 0,
          images: imagePaths,
        };
      })
    );

    const updated = await Product.findByIdAndUpdate(
      id,
      { title, slug, price, description, section, variants },
      { new: true }
    );

    if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete product" }, { status: 500 });
  }
}