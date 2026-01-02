"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const AboutBrand: React.FC = () => {
  return (
    <section className="relative py-20 px-6 md:px-12 bg-gray-50 overflow-hidden">
      {/* Floating Background Shapes */}
      <motion.div
        className="absolute w-32 h-32 bg-yellow-200 rounded-full top-10 left-10 opacity-50"
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-48 h-48 bg-pink-300 rounded-2xl bottom-10 right-10 opacity-40"
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        {/* Brand Image */}
        <div className="w-full h-80 md:h-[400px] relative rounded-xl overflow-hidden shadow-lg">
          <Image
            src="/products/f6.jpg"
            alt="About BuyRova Brand"
            fill
            className="object-cover"
          />
        </div>

        {/* Text Content */}
        <div className="text-center md:text-left flex flex-col gap-6">
          <h2 className="text-4xl font-bold text-gray-900">
            About Our Brand
          </h2>
          <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
            At <span className="font-semibold">BuyRova</span>, we craft luxury products blending timeless elegance with modern design. Each piece is curated to inspire, elevate your lifestyle, and provide unmatched quality.
          </p>

          {/* Optional Highlights */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
            <div className="bg-yellow-100 px-4 py-2 rounded-full text-sm font-semibold text-yellow-800">
              Premium Quality
            </div>
            <div className="bg-pink-100 px-4 py-2 rounded-full text-sm font-semibold text-pink-800">
              Modern Design
            </div>
            <div className="bg-blue-100 px-4 py-2 rounded-full text-sm font-semibold text-blue-800">
              Limited Edition
            </div>
          </div>

          {/* CTA Button */}
          <a
            href="/shop"
            className="mt-6 inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Explore Products
          </a>
        </div>
      </div>
    </section>
  );
};

export default AboutBrand;
