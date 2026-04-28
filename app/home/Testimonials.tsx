"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame } from "framer-motion";

// ── Data ──────────────────────────────────────────────────────────────────────
const testimonials = [
  {
    name: "John Doe",
    role: "Interior Designer",
    feedback: "Absolutely luxurious! The quality exceeded every expectation. Highly recommended to anyone who values craftsmanship.",
    rating: 5,
    accent: "from-yellow-400 to-amber-500",
  },
  {
    name: "Jane Smith",
    role: "Lifestyle Blogger",
    feedback: "Top-notch quality and design. Every product feels intentional — like it was made exactly for my space. Love it!",
    rating: 5,
    accent: "from-pink-400 to-rose-500",
  },
  {
    name: "David Lee",
    role: "Architect",
    feedback: "Elegant products that genuinely stand out. The attention to detail in packaging and finish is second to none.",
    rating: 5,
    accent: "from-sky-400 to-blue-500",
  },
  {
    name: "Sara Khan",
    role: "Home Stylist",
    feedback: "I've ordered three times now and each experience has been flawless. Fast delivery, beautiful products, zero complaints.",
    rating: 5,
    accent: "from-violet-400 to-purple-500",
  },
  {
    name: "Tariq Mehmood",
    role: "Entrepreneur",
    feedback: "Premium quality at a fair price. BuyRova has become my go-to for gifting — everyone is always impressed.",
    rating: 4,
    accent: "from-emerald-400 to-green-500",
  },
];

// ── Star rating ───────────────────────────────────────────────────────────────
function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          fill={i < count ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.5}
          className={`w-4 h-4 ${i < count ? "text-yellow-400" : "text-gray-300"}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      ))}
    </div>
  );
}

// ── Single card ───────────────────────────────────────────────────────────────
function TestimonialCard({
  name, role, feedback, rating, accent,
}: (typeof testimonials)[0]) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(0,0,0,0.12)" }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="w-72 shrink-0 bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 select-none"
    >
      {/* Quote mark */}
      <span className="text-5xl leading-none text-yellow-400 font-serif -mb-2">&ldquo;</span>

      {/* Feedback */}
      <p className="text-gray-600 text-sm leading-relaxed flex-1">
        {feedback}
      </p>

      {/* Stars */}
      <Stars count={rating} />

      {/* Author row */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${accent} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
          {initials}
        </div>
        <div>
          <p className="text-gray-900 font-semibold text-sm leading-tight">{name}</p>
          <p className="text-gray-400 text-xs">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Infinite marquee strip ────────────────────────────────────────────────────
function MarqueeRow({
  items,
  direction = 1,
  speed = 35,
}: {
  items: typeof testimonials;
  direction?: 1 | -1;
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef     = useRef(0);
  // pause on hover
  const pausedRef = useRef(false);

  // duplicate list so the strip loops seamlessly
  const doubled = [...items, ...items];

  useAnimationFrame((_, delta) => {
    const el = trackRef.current;
    if (!el || pausedRef.current) return;

    const px = (speed * delta) / 1000;
    xRef.current += direction * px;

    // Width of one copy = total scroll width / 2
    const halfWidth = el.scrollWidth / 2;
    if (direction === 1 && xRef.current >= halfWidth) xRef.current -= halfWidth;
    if (direction === -1 && xRef.current <= -halfWidth) xRef.current += halfWidth;

    el.style.transform = `translateX(${-xRef.current}px)`;
  });

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div ref={trackRef} className="flex gap-5 w-max will-change-transform">
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} {...t} />
        ))}
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
const Testimonials: React.FC = () => {
  // Split into two rows for a staggered marquee effect
  const row1 = testimonials.slice(0, 3);
  const row2 = testimonials.slice(2);   // slight overlap keeps variety

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">

      {/* Decorative blobs */}
      <motion.div
        className="absolute w-64 h-64 bg-yellow-200 rounded-full -top-16 -left-16 opacity-30 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-72 h-72 bg-pink-200 rounded-full -bottom-20 -right-20 opacity-20 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />

      {/* Heading */}
      <div className="px-6 md:px-12 mb-12 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-yellow-500 text-sm font-semibold uppercase tracking-widest mb-2"
        >
          Customer Reviews
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl font-bold text-gray-900"
        >
          What Our Clients Say
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-500 mt-3 text-sm max-w-md mx-auto"
        >
          Thousands of happy customers — here&apos;s what a few of them had to share.
        </motion.p>
      </div>

      {/* Marquee rows */}
      <div className="flex flex-col gap-5">
        <MarqueeRow items={row1} direction={1}  speed={30} />
        <MarqueeRow items={row2} direction={-1} speed={25} />
      </div>

      {/* Aggregate rating pill */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 flex justify-center"
      >
        <div className="inline-flex items-center gap-3 bg-white border border-gray-200
          rounded-full px-6 py-3 shadow-sm text-sm text-gray-600">
          <Stars count={5} />
          <span className="font-bold text-gray-900">4.9</span>
          <span className="text-gray-400">·</span>
          <span>Based on 2,400+ reviews</span>
        </div>
      </motion.div>
    </section>
  );
};

export default Testimonials;