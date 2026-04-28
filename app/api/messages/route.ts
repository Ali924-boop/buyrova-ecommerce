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

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const threads = await Thread.find({ userId, archived: false })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ threads });
  } catch (err) {
    console.error("[GET /api/messages]", err);
    return NextResponse.json({ error: "Failed to load threads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { subject, icon = "support", message } = await req.json();

    if (!subject?.trim() || !message?.trim())
      return NextResponse.json(
        { error: "subject and message are required" },
        { status: 400 }
      );

    const thread = await Thread.create({
      userId,
      subject: subject.trim(),
      icon,
      preview: message.trim(),
      unread: 1,
    });

    const msg = await Message.create({
      threadId: thread._id.toString(),
      text: message.trim(),
      from: "user",
      userId,
      read: true,
      status: "sent",
    });

    return NextResponse.json({ thread, message: msg }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/messages]", err);
    return NextResponse.json({ error: "Failed to create thread" }, { status: 500 });
  }
}