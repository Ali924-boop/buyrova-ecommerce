"use client";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { FiMail, FiLock } from "react-icons/fi";

const Login: React.FC = () => {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Login API logic goes here
    console.log("Login data:", form);
    alert("Logged in successfully!");
  };

  return (
    <section className="py-16 px-4 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Login to Your Account</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <FiMail className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              required
            />
          </div>

          <div className="relative">
            <FiLock className="absolute top-3 left-3 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              required
            />
          </div>

          <div className="flex justify-end text-sm text-gray-500">
            <a href="/account/forgot-password" className="hover:text-yellow-500 transition">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition mt-2"
          >
            Login
          </button>
        </form>

        <div className="flex items-center gap-4 my-4">
          <hr className="flex-1 border-gray-300" />
          <span className="text-gray-400 text-sm">OR</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">
            <FaFacebookF /> Facebook
          </button>
          <button className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 transition font-semibold">
            <FcGoogle /> Google
          </button>
        </div>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{" "}
          <a href="/account/signup" className="text-yellow-500 hover:text-yellow-600 font-semibold">
            Sign Up
          </a>
        </p>
      </div>
    </section>
  );
};

export default Login;
