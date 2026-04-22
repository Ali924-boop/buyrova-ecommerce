import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { ok: false, status: 401 };
  }

  if (session.user.role !== "admin") {
    return { ok: false, status: 403 };
  }

  return { ok: true, session };
}