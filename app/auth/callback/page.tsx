"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// ── Inner component — uses useSearchParams (must be inside Suspense) ─────────
function AuthCallbackInner() {
  const { status } = useSession();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [timedOut, setTimedOut] = useState(false);

  // Timeout guard — 6 s max wait for session
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Surface NextAuth OAuth errors immediately
    const error = searchParams.get("error");
    if (error) {
      router.replace(`/account/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (status === "loading" && !timedOut) return;

    if (timedOut && status === "loading") {
      router.replace("/account/login?error=SessionTimeout");
      return;
    }

    if (status === "unauthenticated") {
      router.replace("/account/login");
      return;
    }

    if (status === "authenticated") {
      const callbackUrl = searchParams.get("callbackUrl");
      // Only allow relative URLs to prevent open-redirect attacks
      const destination =
        callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/";
      router.replace(destination);
    }
  }, [status, timedOut, router, searchParams]);

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

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm tracking-widest uppercase">Redirecting…</p>
    </div>
  );
}

// ── Fallback shown during SSR ─────────────────────────────────────────────────
function CallbackFallback() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm tracking-widest uppercase">Redirecting…</p>
    </div>
  );
}

// ── Default export — wraps inner component in Suspense (fixes build error) ───
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <AuthCallbackInner />
    </Suspense>
  );
}