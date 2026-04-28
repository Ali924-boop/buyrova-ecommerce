import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Thread from "@/models/Thread";
import Message from "@/models/Message";

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { threadId } = await params;

    const thread = await Thread.findOne({ _id: threadId, userId }).lean();
    if (!thread)
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    const messages = await Message.find({ threadId })
      .sort({ createdAt: 1 })
      .lean();

    await Message.updateMany(
      { threadId, from: "support", read: false },
      { $set: { read: true, status: "seen" } }
    );

    await Thread.updateOne({ _id: threadId }, { $set: { unread: 0 } });

    return NextResponse.json({ thread, messages });
  } catch (err) {
    console.error("[GET /api/messages/[threadId]]", err);
    return NextResponse.json({ error: "Failed to fetch thread" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { threadId } = await params;

    const thread = await Thread.findOne({ _id: threadId, userId });
    if (!thread)
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    await Thread.deleteOne({ _id: threadId });
    await Message.deleteMany({ threadId });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/messages/[threadId]]", err);
    return NextResponse.json({ error: "Failed to delete thread" }, { status: 500 });
  }
}