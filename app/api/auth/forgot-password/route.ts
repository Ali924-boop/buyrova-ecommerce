// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/email"; // we'll create this below

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // ── Security: always respond with the same message whether user exists or not
    // This prevents email enumeration attacks.
    const SAFE_RESPONSE = NextResponse.json({
      message: "If that email is registered, a reset link has been sent.",
    });

    if (!user) return SAFE_RESPONSE;

    // Google-only accounts have no password — don't send a reset email
    if (!user.password) return SAFE_RESPONSE;

    // Generate a secure random token
    const rawToken  = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Save hashed token + expiry to user (expires in 1 hour)
    user.resetPasswordToken   = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/account/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });

    return SAFE_RESPONSE;
  } catch (err) {
    console.error("[POST /api/auth/forgot-password]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}