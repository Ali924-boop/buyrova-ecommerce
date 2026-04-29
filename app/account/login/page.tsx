"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";               // ✅ NextAuth — consistent with getServerSession
import { toast } from "react-toastify";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";

const Login: React.FC = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [form,         setForm]         = useState({ email: "", password: "" });
  const [loading,      setLoading]      = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "facebook" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ── Credentials login ───────────────────────────────────────────────────────
  // FIX: use NextAuth signIn("credentials") instead of a raw fetch +
  //      localStorage.setItem("token"). The old approach stored a custom JWT
  //      that nothing else read — getServerSession (used in /api/orders and the
  //      profile page) only reads the NextAuth cookie, so the user appeared
  //      logged-out everywhere after the login redirect.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect:  false,          // handle redirect ourselves so we can show toast first
        email:     form.email,
        password:  form.password,
      });

      if (result?.error) {
        // NextAuth surfaces provider errors as result.error
        toast.error(
          result.error === "CredentialsSignin"
            ? "Invalid email or password."
            : result.error
        );
        return;
      }

      toast.success("Welcome back! 👋");

      // Go to the page the user was trying to reach, or home
      const callbackUrl = searchParams.get("callbackUrl") ?? "/";
      setTimeout(() => router.push(callbackUrl), 800);

    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Social login ────────────────────────────────────────────────────────────
  const handleSocial = async (provider: "google" | "facebook") => {
    setSocialLoading(provider);
    // redirect: true is fine here — NextAuth handles the OAuth dance
    await signIn(provider, {
      callbackUrl: searchParams.get("callbackUrl") ?? "/",
    });
    // setSocialLoading(null) is never reached for OAuth (page navigates away)
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
      <div className="w-full max-w-md rounded-3xl shadow-2xl p-8 border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition">

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">
          Login to Your Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

          {/* Email */}
          <div className="relative">
            <FiMail className="absolute top-3.5 left-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="email" name="email" placeholder="Email Address"
              value={form.email} onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-lg border bg-white dark:bg-gray-800
                text-gray-900 dark:text-white border-gray-300 dark:border-gray-700
                focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              required autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FiLock className="absolute top-3.5 left-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              name="password" placeholder="Password"
              value={form.password} onChange={handleChange}
              className="w-full pl-10 pr-10 py-3 rounded-lg border bg-white dark:bg-gray-800
                text-gray-900 dark:text-white border-gray-300 dark:border-gray-700
                focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              required autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute top-3.5 right-3 text-gray-400 hover:text-yellow-500 transition"
              aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {/* Forgot */}
          <div className="flex justify-end text-sm">
            <a href="/account/forgot-password"
              className="text-gray-500 dark:text-gray-400 hover:text-yellow-500 transition">
              Forgot Password?
            </a>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold
              py-3 rounded-lg transition mt-2 disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 active:scale-[0.98]">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Logging in…
              </>
            ) : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <hr className="flex-1 border-gray-300 dark:border-gray-700" />
          <span className="text-gray-500 dark:text-gray-400 text-sm">OR</span>
          <hr className="flex-1 border-gray-300 dark:border-gray-700" />
        </div>

        {/* Social */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSocial("facebook")}
            disabled={!!socialLoading}
            className="flex items-center justify-center gap-2 py-2 rounded-lg
              bg-blue-600 hover:bg-blue-700 text-white font-semibold transition
              disabled:opacity-60 disabled:cursor-not-allowed">
            {socialLoading === "facebook"
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <FaFacebookF />}
            Facebook
          </button>
          <button
            onClick={() => handleSocial("google")}
            disabled={!!socialLoading}
            className="flex items-center justify-center gap-2 py-2 rounded-lg
              bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
              text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700
              transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
            {socialLoading === "google"
              ? <span className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
              : <FcGoogle />}
            Google
          </button>
        </div>

        {/* Sign up link */}
        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <a href="/account/signup"
            className="text-yellow-500 hover:text-yellow-400 font-semibold transition">
            Sign Up
          </a>
        </p>

      </div>
    </section>
  );
};

export default Login;