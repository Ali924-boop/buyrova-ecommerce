import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth";
import dbConnect                     from "@/lib/db";
import Wishlist                      from "@/models/Wishlist";
import mongoose                      from "mongoose";

// GET — fetch wishlist + count
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const wishlist = await Wishlist.findOne({ user: session.user.id })
      .populate("products", "title price images slug")
      .lean();

    const products = wishlist?.products ?? [];

    return NextResponse.json({
      products,
      count: products.length,
    });

  } catch (err) {
    console.error("[GET /api/wishlist]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — add a product to wishlist
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    await dbConnect();

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: session.user.id },
      { $addToSet: { products: productId } }, // $addToSet prevents duplicates
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message:  "Added to wishlist",
      count:    wishlist.products.length,
    });

  } catch (err) {
    console.error("[POST /api/wishlist]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — remove a product from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId || !mongoose.isValidObjectId(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    await dbConnect();

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: session.user.id },
      { $pull: { products: productId } },
      { new: true }
    );

    return NextResponse.json({
      message: "Removed from wishlist",
      count:   wishlist?.products.length ?? 0,
    });

  } catch (err) {
    console.error("[DELETE /api/wishlist]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}