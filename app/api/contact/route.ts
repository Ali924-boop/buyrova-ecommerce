import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";

export async function POST(req: NextRequest) {
  await connectDB();
  const { name, email, subject, body } = await req.json();

  if (!name || !email || !subject || !body) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const message = await Message.create({ name, email, subject, body });
  return NextResponse.json(message, { status: 201 });
}
