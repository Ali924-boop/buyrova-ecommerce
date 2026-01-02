"use client";
import React from "react";
import { motion } from "framer-motion";

const SaleBanner: React.FC = () => {
  return (
    <motion.div
      className="bg-yellow-500 text-gray-900 py-4 text-center font-bold"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      Limited Time Offer: Up to 50% OFF on Selected Luxury Items!
    </motion.div>
  );
};

export default SaleBanner;
