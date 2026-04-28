// app/api/messages/read/route.ts
//
// PATCH /api/messages/read  → mark all messages in a thread as read
// Body: { threadId }

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import clientPromise from "@/lib/db";
import Thread from "@/models/Thread";
import Message from "@/models/Message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function connect() {
  if (mongoose.connection.readyState === 0) {
    await clientPromise;
    await mongoose.connect(process.env.MONGODB_URI as string);
  }
}

async function getUserId(req: NextRequest): Promise<string> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user.id;
  return req.headers.get("x-user-id") || req.cookies.get("userId")?.value || "guest";
}

// PATCH /api/messages/read
export async function PATCH(req: NextRequest) {
  try {
    await connect();
    const userId = await getUserId(req);
    const { threadId } = await req.json();

    if (!threadId) {
      return NextResponse.json({ error: "threadId is required" }, { status: 400 });
    }

    // Verify thread belongs to this user
    const thread = await Thread.findOne({ _id: threadId, userId });
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Mark all unread messages in this thread as seen
    await Message.updateMany(
      { threadId, read: false },
      { $set: { read: true, status: "seen" } }
    );

    // Reset unread counter on thread
    await Thread.updateOne({ _id: threadId }, { $set: { unread: 0 } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/messages/read]", err);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}