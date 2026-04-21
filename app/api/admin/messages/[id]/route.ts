import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import Message from "@/models/Message";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const { id } = await params;
  const { read } = await req.json();

  const msg = await Message.findByIdAndUpdate(id, { read }, { new: true });
  if (!msg) return NextResponse.json({ error: "Message not found" }, { status: 404 });
  return NextResponse.json(msg);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const { id } = await params;
  await Message.findByIdAndDelete(id);
  return NextResponse.json({ message: "Deleted" });
}
