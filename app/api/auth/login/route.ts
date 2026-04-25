import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Please login with Google or reset your password" },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        image: user.image || null,
        role: user.role,
      },
    }, { status: 200 });

  } catch (err: any) {
    console.error("Login error:", err?.message || err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}