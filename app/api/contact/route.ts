import { NextRequest, NextResponse } from "next/server";
import connectDB                     from "@/lib/db";
import Contact                       from "@/models/Contact";

export async function POST(req: NextRequest) {
  await connectDB();
  const { name, email, subject, body } = await req.json();

  if (!name || !email || !subject || !body) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const contact = await Contact.create({ name, email, subject, body });
  return NextResponse.json(contact, { status: 201 });
}