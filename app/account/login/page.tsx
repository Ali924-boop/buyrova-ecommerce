"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";

const Login: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed");
        return;
      }

      // ✅ Save token and user to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Trigger storage event so Navbar updates instantly
      window.dispatchEvent(new Event("storage"));

      toast.success(`Welcome back, ${data.user.name}! 👋`);

      // Redirect after short delay so toast shows
      setTimeout(() => {
        router.push("/");
      }, 1500);

    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
      <div className="w-full max-w-md rounded-3xl shadow-2xl p-8 border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition">

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">
          Login to Your Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* EMAIL */}
          <div className="relative">
            <FiMail className="absolute top-3.5 left-3 text-gray-400 dark:text-gray-500" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <FiLock className="absolute top-3.5 left-3 text-gray-400 dark:text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3.5 right-3 text-gray-400 hover:text-yellow-500 transition"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {/* FORGOT */}
          <div className="flex justify-end text-sm text-gray-500 dark:text-gray-400">
            <a href="/account/forgot-password" className="hover:text-yellow-500 transition">
              Forgot Password?
            </a>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 rounded-lg transition mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Logging in...
              </>
            ) : "Login"}
          </button>
        </form>

        {/* OR */}
        <div className="flex items-center gap-4 my-6">
          <hr className="flex-1 border-gray-300 dark:border-gray-700" />
          <span className="text-gray-500 dark:text-gray-400 text-sm">OR</span>
          <hr className="flex-1 border-gray-300 dark:border-gray-700" />
        </div>

        {/* SOCIAL */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">
            <FaFacebookF /> Facebook
          </button>
          <button className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition font-semibold">
            <FcGoogle /> Google
          </button>
        </div>

        {/* SIGNUP LINK */}
        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <a href="/account/signup" className="text-yellow-500 hover:text-yellow-400 font-semibold">
            Sign Up
          </a>
        </p>

      </div>
    </section>
  );
};

export default Login;