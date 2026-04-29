"use client";

// app/admin/page.tsx
// Entry point for /admin — redirects admin users to /admin/dashboard.
// Non-admins and unauthenticated users are handled by middleware already,
// but we add a client-side guard here as a safety net.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AdminIndexPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/admin/login");
      return;
    }

    const role = (session?.user as { role?: string })?.role;
    if (role === "admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/");
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
    </div>
  );
}