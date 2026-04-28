import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    if (!(await isAdmin()))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectDB();

    await Message.updateMany(
      { from: "user", status: "sent" },
      { $set: { status: "delivered" } }
    );

    const threads = await Thread.find({ archived: false })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ threads });
  } catch (err) {
    console.error("[GET /api/admin/messages]", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}