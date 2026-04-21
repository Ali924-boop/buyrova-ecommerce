import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import Message from "@/models/Message";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const messages = await Message.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(messages);
}
