import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth";
import dbConnect                     from "@/lib/db";
import Order                         from "@/models/Order";
import Product                       from "@/models/Product";

// ─── GET /api/orders ─────────────────────────────────────────────────────────
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const orders = await Order.find({ user: session.user.id })
      .populate("products.product", "title price variants")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders);
  } catch (err) {
    console.error("[GET /api/orders]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST /api/orders ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body    = await req.json();

    const {
      products,
      total,
      name, email, address, city, zip, country,
      paymentMethod, qrReference,
    } = body as {
      products: {
        product:       string;
        quantity:      number;
        color?:        string;
        size?:         string;
        variantIndex?: number;
      }[];
      total:          number;
      name?:          string;
      email?:         string;
      address?:       string;
      city?:          string;
      zip?:           string;
      country?:       string;
      paymentMethod?: string;
      qrReference?:   string;
    };

    if (!products?.length || !total)
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });

    await dbConnect();

    // ── Step 1: validate stock for every item before touching anything ────────
    for (const item of products) {
      const p = await Product.findById(item.product);
      if (!p)
        return NextResponse.json(
          { error: `Product not found: ${item.product}` },
          { status: 404 }
        );

      const variant =
        item.variantIndex !== undefined
          ? p.variants[item.variantIndex]
          : p.variants.find(
              (v: { color: string }) =>
                v.color.toLowerCase() === (item.color ?? "").toLowerCase()
            );

      if (!variant)
        return NextResponse.json(
          { error: `Variant not found for "${p.title}"` },
          { status: 400 }
        );

      if ((variant.stock ?? 0) < item.quantity)
        return NextResponse.json(
          {
            error: `Not enough stock for "${p.title}" (${item.color ?? ""}). Available: ${variant.stock}`,
          },
          { status: 409 }
        );
    }

    // ── Step 2: decrement stock atomically ────────────────────────────────────
    for (const item of products) {
      if (item.variantIndex !== undefined) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { [`variants.${item.variantIndex}.stock`]: -item.quantity } }
        );
      } else {
        const escaped = (item.color ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        await Product.updateOne(
          { _id: item.product },
          { $inc: { "variants.$[v].stock": -item.quantity } },
          {
            arrayFilters: [
              { "v.color": { $regex: new RegExp(`^${escaped}$`, "i") } },
            ],
          }
        );
      }
    }

    // ── Step 3: create the order ──────────────────────────────────────────────
    const order = await Order.create({
      user:          session?.user?.id ?? null,
      name, email, address, city, zip, country,
      paymentMethod, qrReference,
      products: products.map((item) => ({
        product:      item.product,
        quantity:     item.quantity,
        color:        item.color        ?? "",
        size:         item.size         ?? "",
        variantIndex: item.variantIndex ?? -1,
      })),
      total,
      status: "pending",
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}