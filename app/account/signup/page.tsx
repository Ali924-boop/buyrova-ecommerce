"use client";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

const Signup: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup data:", form);
    alert("Account created successfully!");
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 
      bg-gray-100 dark:bg-gray-950 transition-colors duration-300">

      <div className="w-full max-w-md rounded-3xl shadow-2xl p-8 border 
        bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition">

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* NAME */}
          <div className="relative">
            <FiUser className="absolute top-3.5 left-3 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-lg border 
                bg-white dark:bg-gray-800 
                text-gray-900 dark:text-white 
                border-gray-300 dark:border-gray-700
                focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              required
            />
          </div>

          {/* EMAIL */}
          <div className="relative">
            <FiMail className="absolute top-3.5 left-3 text-gray-400 dark:text-gray-500" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-lg border 
                bg-white dark:bg-gray-800 
                text-gray-900 dark:text-white 
                border-gray-300 dark:border-gray-700
                focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <FiLock className="absolute top-3.5 left-3 text-gray-400 dark:text-gray-500" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-lg border 
                bg-white dark:bg-gray-800 
                text-gray-900 dark:text-white 
                border-gray-300 dark:border-gray-700
                focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
              required
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-400 
              text-black font-semibold py-3 rounded-lg transition mt-2"
          >
            Sign Up
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

          <button className="flex items-center justify-center gap-2 py-2 rounded-lg 
            bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">
            <FaFacebookF /> Facebook
          </button>

          <button className="flex items-center justify-center gap-2 py-2 rounded-lg 
            bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
            text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition font-semibold">
            <FcGoogle /> Google
          </button>

        </div>

        {/* LOGIN */}
        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <a
            href="/account/login"
            className="text-yellow-500 hover:text-yellow-600 font-semibold"
          >
            Login
          </a>
        </p>

      </div>
    </section>
  );
};

export default Signup;