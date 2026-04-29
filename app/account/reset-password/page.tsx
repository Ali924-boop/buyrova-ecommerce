// app/account/reset-password/page.tsx
"use client";
import React, { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import Link from "next/link";

// Password strength scorer
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)             score++;
  if (pw.length >= 12)            score++;
  if (/[A-Z]/.test(pw))          score++;
  if (/[0-9]/.test(pw))          score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;

  if (score <= 1) return { score, label: "Weak",   color: "bg-red-500"    };
  if (score <= 2) return { score, label: "Fair",   color: "bg-orange-400" };
  if (score <= 3) return { score, label: "Good",   color: "bg-yellow-400" };
  return              { score, label: "Strong", color: "bg-green-500"  };
}

// ── Inner component (uses useSearchParams) ────────────────────────────────
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState("");

  const strength = getStrength(password);
  const mismatch = confirm.length > 0 && password !== confirm;
  const valid    = password.length >= 8 && password === confirm;
  const missingParams = !token || !email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/account/login"), 2500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Invalid link state ──────────────────────────────────────────────────
  if (missingParams) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 bg-gray-100 dark:bg-gray-950">
        <div className="w-full max-w-md rounded-3xl shadow-2xl p-8 border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid reset link</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            This link is missing required parameters. Please request a new one.
          </p>
          <Link href="/account/forgot-password"
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg transition text-sm">
            Request new link
          </Link>
        </div>
      </section>
    );
  }

  // ── Success state ───────────────────────────────────────────────────────
  if (success) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 bg-gray-100 dark:bg-gray-950">
        <div className="w-full max-w-md rounded-3xl shadow-2xl p-8 border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle size={28} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password updated!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            Your password has been changed successfully.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">Redirecting to login…</p>
        </div>
      </section>
    );
  }

  // ── Form state ──────────────────────────────────────────────────────────
  return (
    <section className="min-h-screen flex items-center justify-center px-4 bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
      <div className="w-full max-w-md rounded-3xl shadow-2xl p-8 border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Set new password</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Choose a strong password for{" "}
          <span className="text-gray-900 dark:text-white font-medium">{email}</span>.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* New password */}
          <div>
            <div className="relative">
              <FiLock className="absolute top-3.5 left-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="New Password"
                required
                autoComplete="new-password"
                className={`w-full pl-10 pr-10 py-3 rounded-lg border bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-yellow-500 transition
                  ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`}
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute top-3.5 right-3 text-gray-400 hover:text-yellow-500 transition"
                aria-label={showPw ? "Hide password" : "Show password"}>
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        strength.score >= i ? strength.color : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${
                  strength.label === "Weak"   ? "text-red-400"    :
                  strength.label === "Fair"   ? "text-orange-400" :
                  strength.label === "Good"   ? "text-yellow-400" : "text-green-400"
                }`}>
                  {strength.label} password
                  {strength.score < 3 && " — try adding numbers or symbols"}
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <div className="relative">
              <FiLock className="absolute top-3.5 left-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm New Password"
                required
                autoComplete="new-password"
                className={`w-full pl-10 pr-10 py-3 rounded-lg border bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 transition
                  ${mismatch
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:ring-yellow-500"
                  }`}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)}
                className="absolute top-3.5 right-3 text-gray-400 hover:text-yellow-500 transition"
                aria-label={showConfirm ? "Hide password" : "Show password"}>
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {mismatch && (
              <p className="text-red-400 text-xs mt-1 pl-1">Passwords do not match.</p>
            )}
          </div>

          {/* API error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/25 rounded-lg px-4 py-3">
              <FiAlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !valid}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold
              py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 active:scale-[0.98] mt-1"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Updating…
              </>
            ) : "Update Password"}
          </button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Remember it?{" "}
            <Link href="/account/login" className="text-yellow-500 hover:text-yellow-400 font-semibold transition">
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}

// ── Page export — wraps inner component in Suspense ───────────────────────
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <span className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}