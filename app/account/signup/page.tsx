"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        toast.error("❌ Signup failed!");
        setLoading(false);
        return;
      }

      toast.success("✅ Account created successfully!");

      setTimeout(() => {
        router.push("/account/login?registered=true");
      }, 1000);

    } catch {
      setError("Something went wrong. Please try again.");
      toast.error("❌ Something went wrong!");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-xl py-3 focus:outline-none focus:border-yellow-500 transition";

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-500 opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-yellow-500 rounded-xl flex items-center justify-center">
              <span className="text-gray-900 font-black">B</span>
            </div>
            <span className="text-white font-bold text-xl">BuyRova</span>
          </Link>

          <h1 className="text-2xl font-bold text-white">
            Create your account
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Join BuyRova and start shopping
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 shadow-2xl">

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name + Email */}
            {[
              {
                name: "name",
                label: "Full Name",
                type: "text",
                placeholder: "John Doe",
                icon: FiUser,
              },
              {
                name: "email",
                label: "Email Address",
                type: "email",
                placeholder: "you@example.com",
                icon: FiMail,
              },
            ].map(({ name, label, type, placeholder, icon: Icon }) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  {label}
                </label>

                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                  <input
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={form[name as keyof typeof form]}
                    onChange={handleChange}
                    required
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Password
              </label>

              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className={`${inputClass} pl-10 pr-10`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-gray-900 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/account/login"
              className="text-yellow-400 hover:text-yellow-300 font-semibold"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}