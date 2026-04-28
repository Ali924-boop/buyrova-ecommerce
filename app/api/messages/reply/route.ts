import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Thread from "@/models/Thread";
import Message from "@/models/Message";

async function getUserId(req: NextRequest): Promise<string> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user.id;
  return req.headers.get("x-user-id") || req.cookies.get("userId")?.value || "guest";
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userId = await getUserId(req);
    const { threadId, text } = await req.json();

    if (!threadId || !text?.trim())
      return NextResponse.json(
        { error: "threadId and text are required" },
        { status: 400 }
      );

    const thread = await Thread.findOne({ _id: threadId, userId });
    if (!thread)
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    const message = await Message.create({
      threadId,
      text: text.trim(),
      from: "user",
      userId,
      read: true,
      status: "sent",
    });

    await Thread.updateOne(
      { _id: threadId },
      { $set: { preview: text.trim(), updatedAt: new Date() } }
    );

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/messages/reply]", err);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}