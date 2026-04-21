import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import Settings from "@/models/Settings";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const settings = await Settings.find().lean();
  const map: Record<string, string> = {};
  settings.forEach((s: { key: string; value: string }) => { map[s.key] = s.value; });
  return NextResponse.json(map);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const body = await req.json();

  const updates = Object.entries(body as Record<string, string>);
  await Promise.all(
    updates.map(([key, value]) =>
      Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true })
    )
  );

  return NextResponse.json({ message: "Settings saved" });
}
