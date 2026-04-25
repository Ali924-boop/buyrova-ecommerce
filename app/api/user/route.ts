import { NextResponse } from "next/server";

export async function GET() {
  try {
    // temporary dummy user (later DB se replace kar dena)
    const user = {
      name: "Ali Raza",
      email: "aliraza@gmail.com",
    };

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}