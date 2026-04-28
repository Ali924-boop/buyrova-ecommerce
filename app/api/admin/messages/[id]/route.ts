import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Thread from "@/models/Thread";
import Message from "@/models/Message";

async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());
  return adminEmails.includes(session.user.email);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin()))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectDB();
    const { id } = await params;

    const thread = await Thread.findById(id).lean();
    if (!thread)
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    const messages = await Message.find({ threadId: id })
      .sort({ createdAt: 1 })
      .lean();

    await Message.updateMany(
      { threadId: id, from: "user", status: "sent" },
      { $set: { status: "delivered" } }
    );

    return NextResponse.json({ thread, messages });
  } catch (err) {
    console.error("[GET /api/admin/messages/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch thread" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin()))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectDB();
    const { id } = await params;

    const thread = await Thread.findById(id);
    if (!thread)
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    const { text } = await req.json();
    if (!text?.trim())
      return NextResponse.json({ error: "text is required" }, { status: 400 });

    const message = await Message.create({
      threadId: id,
      text: text.trim(),
      from: "support",
      userId: thread.userId,
      read: false,
      status: "sent",
    });

    await Thread.findByIdAndUpdate(id, {
      $set: { preview: text.trim() },
      $inc: { unread: 1 },
    }, { new: true });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/messages/[id]]", err);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin()))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectDB();
    const { id } = await params;

    const { read } = await req.json();
    const status = read ? "seen" : "delivered";

    await Message.updateMany(
      { threadId: id, from: "user" },
      { $set: { read, status } }
    );

    await Thread.findByIdAndUpdate(id, {
      $set: { unread: read ? 0 : 1 },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/messages/[id]]", err);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin()))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectDB();
    const { id } = await params;

    const thread = await Thread.findByIdAndDelete(id);
    if (!thread)
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    await Message.deleteMany({ threadId: id });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/messages/[id]]", err);
    return NextResponse.json({ error: "Failed to delete thread" }, { status: 500 });
  }
}