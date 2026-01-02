"use client";
import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  { name: "John Doe", feedback: "Absolutely luxurious! Highly recommended." },
  { name: "Jane Smith", feedback: "Top-notch quality and design. Love it!" },
  { name: "David Lee", feedback: "Elegant products that stand out." },
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 px-6 md:px-12 bg-gray-50 relative overflow-hidden">
      {/* Background floating shapes */}
      <motion.div
        className="absolute w-32 h-32 bg-yellow-200 rounded-full top-10 left-10 opacity-30"
        animate={{ y: [0, -20, 0], x: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-48 h-48 bg-pink-300 rounded-2xl bottom-10 right-10 opacity-20"
        animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />

      <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
        What Our Clients Say
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center text-center gap-4"
          >
            {/* Optional initials / icon */}
            <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
              {t.name.split(" ").map((n) => n[0]).join("")}
            </div>

            <p className="text-gray-700 italic">&quot;{t.feedback}&quot;</p>
            <h4 className="text-gray-900 font-semibold">{t.name}</h4>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
