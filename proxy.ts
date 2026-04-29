// proxy.ts — project root
// Next.js 16+ uses proxy.ts instead of middleware.ts

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token        = req.nextauth.token;
    const { pathname } = req.nextUrl;

    const isLoginPage = pathname === "/admin/login";
    const isAdminPage = pathname.startsWith("/admin") && !isLoginPage;
    const isAdminApi  = pathname.startsWith("/api/admin");

    // ── Always allow the login page ──────────────────────────────────────────
    if (isLoginPage) return NextResponse.next();

    // ── Admin API routes — return JSON errors, not redirects ─────────────────
    if (isAdminApi) {
      if (!token)                 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (token.role !== "admin") return NextResponse.json({ error: "Forbidden"    }, { status: 403 });
      return NextResponse.next();
    }

    // ── Admin pages — redirect non-admins to login ───────────────────────────
    if (isAdminPage) {
      if (!token || token.role !== "admin") {
        const loginUrl = new URL("/admin/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true so withAuth never short-circuits with its own redirect —
      // our proxy function above handles all the logic.
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname === "/admin/login") return true;
        if (req.nextUrl.pathname.startsWith("/admin")) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",     // all admin pages
    "/api/admin/:path*", // all admin API routes
  ],
};