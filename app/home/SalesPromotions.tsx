"use client";
import React from "react";
import { motion } from "framer-motion";

const SalesPromotions: React.FC = () => {
  return (
    <section className="py-16 px-6 md:px-12 bg-yellow-50">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl font-bold text-gray-900 mb-6"
        >
          Seasonal Promotions
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-gray-700 text-lg"
        >
          Enjoy exclusive discounts on our premium collections this season. Limited time only!
        </motion.p>
      </div>
    </section>
  );
};

export default SalesPromotions;
