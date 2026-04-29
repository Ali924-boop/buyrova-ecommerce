"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Landing page after Google OAuth callback.
// Problems this fixes vs the old version:
//
// 1. TIMEOUT GUARD — useSession can hang on "loading" forever if the NextAuth
//    session endpoint (/api/auth/session) fails or the cookie wasn't set.
//    We add a 6 s timeout that falls back to /account/login so users aren't
//    stuck on a spinner indefinitely.
//
// 2. CALLBACKURL PASSTHROUGH — Google OAuth preserves the ?callbackUrl=
//    query param through the OAuth dance. We read it here and honour it
//    instead of always sending everyone to "/".
//
// 3. ERROR PARAM — NextAuth appends ?error=... to the callback URL on
//    failure (e.g. "OAuthAccountNotLinked", "AccessDenied"). We detect that
//    and redirect to login with the error message so users understand what
//    happened instead of seeing an infinite spinner.
//
// 4. REPLACE vs PUSH — already using router.replace ✅ (no back-button loop)
// ─────────────────────────────────────────────────────────────────────────────

export default function AuthCallbackPage() {
  const { data: session, status } = useSession();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [timedOut, setTimedOut] = useState(false);

  // ── Fix 1: timeout guard ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // ── Fix 3: surface NextAuth OAuth errors immediately ───────────────────
    const error = searchParams.get("error");
    if (error) {
      router.replace(`/account/login?error=${encodeURIComponent(error)}`);
      return;
    }

    // Still loading and not timed out yet — wait
    if (status === "loading" && !timedOut) return;

    // Loading timed out — something went wrong with the session endpoint
    if (timedOut && status === "loading") {
      router.replace("/account/login?error=SessionTimeout");
      return;
    }

    if (status === "unauthenticated") {
      router.replace("/account/login");
      return;
    }

    if (status === "authenticated") {
      // ── Fix 2: honour callbackUrl if present, else go home ───────────────
      const callbackUrl = searchParams.get("callbackUrl");

      // Safety check: only allow relative URLs to prevent open-redirect attacks
      const destination =
        callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/";

      router.replace(destination);
    }
  }, [status, timedOut, router, searchParams]);

  // ── Error state (caught above, but shown briefly before redirect) ──────────
  const error = searchParams.get("error");
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <span className="text-red-400 text-xl">✕</span>
        </div>
        <p className="text-white font-semibold">Authentication failed</p>
        <p className="text-gray-500 text-sm text-center max-w-xs">
          {error === "OAuthAccountNotLinked"
            ? "This email is already registered with a different sign-in method. Please use your original login."
            : error === "AccessDenied"
            ? "Access was denied. Please try again."
            : `Error: ${error}`}
        </p>
        <p className="text-gray-600 text-xs">Redirecting to login…</p>
      </div>
    );
  }

  // ── Timed out state ────────────────────────────────────────────────────────
  if (timedOut && status === "loading") {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
          <span className="text-yellow-400 text-xl">⚠</span>
        </div>
        <p className="text-white font-semibold">Session taking too long</p>
        <p className="text-gray-500 text-sm text-center max-w-xs">
          Could not verify your session. Redirecting you back to login…
        </p>
      </div>
    );
  }

  // ── Normal loading spinner ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm tracking-widest uppercase">Redirecting…</p>
    </div>
  );
}