// app/account/forgot-password/page.tsx
"use client";
import React, { useState } from "react";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
      <div className="w-full max-w-md rounded-3xl shadow-2xl p-8 border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition">

        {/* Back link */}
        <Link href="/account/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-yellow-500 transition mb-6">
          <FiArrowLeft size={14} /> Back to Login
        </Link>

        {sent ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
              <FiCheckCircle size={28} className="text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Check your inbox
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              We&apos;ve sent a password reset link to <strong className="text-gray-900 dark:text-white">{email}</strong>.
              The link expires in 1 hour.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">
              Didn&apos;t receive it? Check your spam folder or{" "}
              <button
                onClick={() => { setSent(false); setError(""); }}
                className="text-yellow-500 hover:text-yellow-400 font-semibold transition underline"
              >
                try again
              </button>.
            </p>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Forgot your password?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="relative">
                <FiMail className="absolute top-3.5 left-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="Email Address"
                  required
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-yellow-500 transition
                    ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`}
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm -mt-1">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold
                  py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Sending…
                  </>
                ) : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}