import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";

// ── POST /api/contact — public endpoint for contact form ─────────────────────
export async function POST(req: Request) {
  try {
    const { name, email, subject, body } = await req.json();

    if (!name || !email || !subject || !body) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    await dbConnect();
    const message = await Message.create({ name, email, subject, body });
    return NextResponse.json({ success: true, id: message._id }, { status: 201 });
  } catch (err) {
    console.error("Contact POST error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
