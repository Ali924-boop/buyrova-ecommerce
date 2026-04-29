// app/api/account/wishlist/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth";
import connectDB                     from "@/lib/db";
import Wishlist                      from "@/models/Wishlist";

// ── Auth helper ───────────────────────────────────────────────────────────────
async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/account/wishlist
// Returns the current user's wishlist with populated product details.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const wishlist = await Wishlist.findOne({ user: session.user.id })
      .populate({
        path:   "products",
        select: "name slug price images stock category",
      })
      .lean();

    // Return empty products array if no wishlist document exists yet
    return NextResponse.json({
      products: wishlist?.products ?? [],
    });
  } catch (err) {
    console.error("[wishlist GET]", err);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/account/wishlist
// Adds a product to the wishlist. Creates the wishlist document if needed.
// Body: { productId: string }
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { productId } = body ?? {};

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  try {
    await connectDB();

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: session.user.id },
      { $addToSet: { products: productId } }, // $addToSet prevents duplicates
      { upsert: true, new: true }
    ).populate({
      path:   "products",
      select: "name slug price images stock category",
    });

    return NextResponse.json({
      message:  "Added to wishlist",
      products: wishlist.products,
    });
  } catch (err) {
    console.error("[wishlist POST]", err);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/account/wishlist
// Removes a product from the wishlist.
// Body: { productId: string }
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { productId } = body ?? {};

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  try {
    await connectDB();

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: session.user.id },
      { $pull: { products: productId } }, // $pull removes the product
      { new: true }
    ).populate({
      path:   "products",
      select: "name slug price images stock category",
    });

    if (!wishlist) {
      return NextResponse.json({ error: "Wishlist not found" }, { status: 404 });
    }

    return NextResponse.json({
      message:  "Removed from wishlist",
      products: wishlist.products,
    });
  } catch (err) {
    console.error("[wishlist DELETE]", err);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}