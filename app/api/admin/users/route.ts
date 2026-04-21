import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();

  const url = new URL(req.url);
  const role = url.searchParams.get("role");
  const query = role ? { role } : {};

  const users = await User.find(query).select("-password").sort({ _id: -1 }).lean();
  return NextResponse.json(users);
}
