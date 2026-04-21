"use client";
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

const announcements = [
  "🎉 Limited Time Offer: Up to 50% OFF on Selected Items!",
  "🚚 Free Shipping on Orders Over $100",
  "✨ New Arrivals Drop Every Friday — Don't Miss Out!",
  "💳 Buy Now, Pay Later — Available at Checkout",
];

const SaleBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % announcements.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="relative bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center">
        <p className="text-xs sm:text-sm font-bold text-center animate-pulse">
          {announcements[index]}
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-900/60 hover:text-gray-900 transition"
        aria-label="Dismiss"
      >
        <FiX size={16} />
      </button>
    </div>
  );
};

export default SaleBanner;
