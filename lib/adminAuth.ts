// lib/adminAuth.ts

import { NextResponse }     from "next/server";
import { getServerSession } from "next-auth";
import { authOptions }      from "@/lib/auth"; // ✅ correct — NOT from the route file

declare module "next-auth" {
  interface Session {
    user: {
      id:     string;
      role?:  string;
      name?:  string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      ok:      false as const,
      error:   NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }

  if (session.user.role !== "admin") {
    return {
      ok:      false as const,
      error:   NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      session: null,
    };
  }

  return { ok: true as const, error: null, session };
}