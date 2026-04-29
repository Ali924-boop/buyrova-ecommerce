import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth";
import dbConnect                     from "@/lib/db";
import User                          from "@/models/User";
import bcrypt                        from "bcryptjs";

// ─── PUT /api/user/password — verify current password, save new one ───────────
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as {
      currentPassword?: string;
      newPassword?:     string;
    };

    const { currentPassword, newPassword } = body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!currentPassword || !newPassword)
      return NextResponse.json(
        { error: "Both current and new passwords are required." },
        { status: 400 }
      );

    if (newPassword.length < 8)
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 }
      );

    if (currentPassword === newPassword)
      return NextResponse.json(
        { error: "New password must be different from your current password." },
        { status: 400 }
      );

    await dbConnect();

    // Fetch user WITH password hash (select: false by default in some schemas)
    const user = await User.findById(session.user.id).select("+password");

    if (!user)
      return NextResponse.json({ error: "User not found." }, { status: 404 });

    // Google-only accounts have no password set
    if (!user.password)
      return NextResponse.json(
        { error: "This account uses Google sign-in and has no password to change." },
        { status: 400 }
      );

    // ── Verify current password ───────────────────────────────────────────────
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 }
      );

    // ── Hash and save new password ────────────────────────────────────────────
    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("[PUT /api/user/password]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}