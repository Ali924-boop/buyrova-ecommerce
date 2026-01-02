"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Subscribed with ${email}`);
  };

  return (
    <motion.form
      onSubmit={handleSubscribe}
      whileHover={{ scale: 1.02 }}
      className="flex flex-col md:flex-row gap-4 justify-center items-center bg-gray-100 p-6 rounded-lg shadow-lg mt-8"
    >
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-2 rounded w-full md:w-auto"
        required
      />
      <button
        type="submit"
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded transition"
      >
        Subscribe
      </button>
    </motion.form>
  );
};

export default NewsletterForm;
