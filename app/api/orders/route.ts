import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth";
import dbConnect                     from "@/lib/db";
import Order                         from "@/models/Order";
import Product                       from "@/models/Product";

// ─── GET /api/orders ──────────────────────────────────────────────────────────
export async function GET() {
  // FIX 1: NextRequest param removed — getServerSession reads cookies directly
  // from the incoming request context; passing req is unnecessary for App Router
  // and can cause type mismatches with some next-auth versions.
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    // FIX 2: role is on the JWT token/session but TypeScript doesn't know about it
    // unless you've extended the Session type. Cast cleanly via the token rather
    // than casting the whole user object inline everywhere.
    const userId  = session.user.id;
    const isAdmin = session.user.role === "admin"; // works once type is extended (see below)

    const query = isAdmin ? {} : { user: userId };

    const orders = await Order.find(query)
      .populate("products.product", "title price images variants")
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

    // FIX 3: parse body BEFORE the early-return validation so we never get
    // "body already consumed" errors if req.json() is called after a return.
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const {
      products, total,
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

    // FIX 4: more thorough input validation — total must be a positive number,
    // each product entry must have a non-empty product id and positive quantity.
    if (!Array.isArray(products) || products.length === 0)
      return NextResponse.json({ error: "No products in order." }, { status: 400 });

    if (typeof total !== "number" || total <= 0)
      return NextResponse.json({ error: "Invalid order total." }, { status: 400 });

    for (const item of products) {
      if (!item.product || typeof item.product !== "string")
        return NextResponse.json({ error: "Each product must have a valid id." }, { status: 400 });
      if (!Number.isInteger(item.quantity) || item.quantity < 1)
        return NextResponse.json({ error: `Invalid quantity for product ${item.product}.` }, { status: 400 });
    }

    await dbConnect();

    // ── Step 1: validate stock for all items before touching anything ─────────
    // FIX 5: collect all products in one query instead of N separate findById
    // calls — much faster and avoids partial failures mid-loop.
    const productIds = [...new Set(products.map((i) => i.product))];
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    for (const item of products) {
      const p = productMap.get(item.product);
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
          { error: `Variant not found for "${p.title}".` },
          { status: 400 }
        );

      if ((variant.stock ?? 0) < item.quantity)
        return NextResponse.json(
          {
            error: `Not enough stock for "${p.title}"${
              item.color ? ` (${item.color})` : ""
            }. Available: ${variant.stock ?? 0}`,
          },
          { status: 409 }
        );
    }

    // ── Step 2: decrement stock ───────────────────────────────────────────────
    // FIX 6: run all stock updates concurrently with Promise.all — previously
    // they ran sequentially, adding N round-trips of latency for large carts.
    await Promise.all(
      products.map((item) => {
        if (item.variantIndex !== undefined) {
          return Product.updateOne(
            { _id: item.product },
            { $inc: { [`variants.${item.variantIndex}.stock`]: -item.quantity } }
          );
        }

        const escaped = (item.color ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return Product.updateOne(
          { _id: item.product },
          { $inc: { "variants.$[v].stock": -item.quantity } },
          {
            arrayFilters: [
              { "v.color": { $regex: new RegExp(`^${escaped}$`, "i") } },
            ],
          }
        );
      })
    );

    // ── Step 3: create order ──────────────────────────────────────────────────
    const order = await Order.create({
      user: session?.user?.id ?? null, // null = guest checkout
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