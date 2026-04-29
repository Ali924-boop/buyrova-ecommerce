import { NextRequest, NextResponse } from "next/server";
import jwt       from "jsonwebtoken";
import dbConnect from "@/lib/db";
import User      from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token      = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { id: string };

    await dbConnect();

    const user = await User.findById(decoded.id)
      .select("name email phone avatar createdAt")
      .lean();

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}