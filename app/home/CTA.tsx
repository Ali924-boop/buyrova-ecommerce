"use client";
import React from "react";
import { motion } from "framer-motion";

const CTA: React.FC = () => {
  return (
    <section className="py-20 px-6 md:px-12 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-center rounded-3xl mx-4 md:mx-12 shadow-lg overflow-hidden relative">
      {/* Floating shapes for VIP feel */}
      <motion.div
        className="absolute w-32 h-32 bg-white opacity-10 rounded-full top-10 left-10"
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-48 h-48 bg-white opacity-5 rounded-2xl bottom-0 right-0"
        animate={{ y: [0, -30, 0], x: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-4xl md:text-5xl font-bold mb-4"
      >
        Subscribe & Get Exclusive Offers
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mb-8 text-lg md:text-xl"
      >
        Join our newsletter for premium updates and VIP access
      </motion.p>

      <div className="flex justify-center max-w-lg mx-auto">
  <motion.input
    type="email"
    placeholder="Enter your email"
    className="w-full px-6 py-3 rounded-l-full text-gray-900 placeholder-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
  />
  <motion.button
    whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(0,0,0,0.2)" }}
    whileTap={{ scale: 0.95 }}
    className="px-8 py-3 bg-gray-900 rounded-r-full font-semibold text-white"
  >
    Subscribe
  </motion.button>
</div>

    </section>
  );
};

export default CTA;
