"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const CTA: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email) return;
    alert(`Subscribed: ${email}`);
    setEmail("");
  };

  return (
    <section className="relative py-10 sm:py-12 mb-8 px-4 sm:px-6 md:px-12 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-center rounded-2xl md:rounded-3xl mx-2 sm:mx-4 md:mx-12 shadow-xl overflow-hidden">

      {/* Floating Shapes */}
      <motion.div
        className="absolute w-28 sm:w-32 h-28 sm:h-32 bg-white/10 rounded-full top-6 sm:top-10 left-4 sm:left-10"
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute w-40 sm:w-48 h-40 sm:h-48 bg-white/5 rounded-2xl bottom-0 right-0"
        animate={{ y: [0, -25, 0], x: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
      />

      {/* Title */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4"
      >
        Subscribe & Get Exclusive Offers
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mb-6 sm:mb-8 text-sm sm:text-base md:text-lg"
      >
        Join our newsletter for premium updates and VIP access
      </motion.p>

      {/* Form */}
      <div className="flex flex-col sm:flex-row justify-center max-w-md sm:max-w-lg mx-auto gap-2 sm:gap-0">

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 sm:px-6 py-3 rounded-full sm:rounded-r-none text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />

        <motion.button
          onClick={handleSubscribe}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 sm:px-8 py-3 bg-gray-900 rounded-full sm:rounded-l-none font-semibold text-white hover:bg-black transition"
        >
          Subscribe
        </motion.button>
      </div>
    </section>
  );
};

export default CTA;