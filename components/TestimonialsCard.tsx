"use client";
import React from "react";
import { motion } from "framer-motion";

interface TestimonialProps {
  name: string;
  review: string;
  avatar?: string;
}

const TestimonialsCard: React.FC<TestimonialProps> = ({ name, review, avatar }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-gray-50 p-6 rounded-lg shadow-lg text-gray-900 flex flex-col items-center text-center"
    >
      {avatar && <img src={avatar} alt={name} className="w-16 h-16 rounded-full mb-4"/>}
      <p className="italic mb-2">&quot;{review}&quot;</p>
      <h4 className="font-bold">{name}</h4>
    </motion.div>
  );
};

export default TestimonialsCard;
