  import { NextRequest, NextResponse } from "next/server";
  import dbConnect from "@/lib/db";
  import User from "@/models/User";
  import bcrypt from "bcryptjs";

  export async function POST(req: NextRequest) {
    try {
      await dbConnect();

      const { name, email, password } = await req.json();

      if (!name || !email || !password) {
        return NextResponse.json(
          { error: "All fields are required" },
          { status: 400 }
        );
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return NextResponse.json(
          { error: "Account already exists with this email" },
          { status: 409 }
        );
      }

      const hashed = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashed,
        role: "user",
      });

      return NextResponse.json({
        message: "Account created successfully",
        user: { name: user.name, email: user.email },
      }, { status: 201 });

    } catch (err: any) {
      console.error("Signup error:", err?.message || err);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  }