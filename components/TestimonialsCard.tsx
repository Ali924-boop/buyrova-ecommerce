"use client";
import React from "react";
import { motion } from "framer-motion";
import { FiStar } from "react-icons/fi";

interface TestimonialProps {
  name: string;
  review: string;
  avatar?: string;
  rating?: number;
  role?: string;
}

const TestimonialsCard: React.FC<TestimonialProps> = ({ name, review, avatar, rating = 5, role }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-gray-900 border border-gray-800 hover:border-yellow-500/20 rounded-2xl p-6 flex flex-col gap-4 h-full"
    >
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <FiStar
            key={i}
            size={14}
            className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-gray-300 text-sm leading-relaxed flex-1">
        &ldquo;{review}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-sm flex-shrink-0">
            {name[0].toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-white font-semibold text-sm">{name}</p>
          {role && <p className="text-gray-500 text-xs">{role}</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialsCard;
