"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiAward, FiHeart, FiStar, FiShoppingBag } from "react-icons/fi";

const stats = [
  { label: "Happy Customers", value: "12K+" },
  { label: "Products",        value: "500+" },
  { label: "Countries",       value: "30+"  },
  { label: "Years",           value: "5+"   },
];

const highlights = [
  { icon: FiAward,       label: "Premium Quality", desc: "Only the finest materials",     bg: "bg-yellow-50 dark:bg-yellow-500/10",   text: "text-yellow-600 dark:text-yellow-400",   border: "border-yellow-200 dark:border-yellow-500/20"   },
  { icon: FiStar,        label: "Modern Design",   desc: "Timeless meets contemporary",   bg: "bg-pink-50 dark:bg-pink-500/10",        text: "text-pink-600 dark:text-pink-400",        border: "border-pink-200 dark:border-pink-500/20"       },
  { icon: FiHeart,       label: "Limited Edition", desc: "Exclusive curated collections", bg: "bg-blue-50 dark:bg-blue-500/10",        text: "text-blue-600 dark:text-blue-400",        border: "border-blue-200 dark:border-blue-500/20"       },
  { icon: FiShoppingBag, label: "Free Shipping",   desc: "On all orders over $50",        bg: "bg-emerald-50 dark:bg-emerald-500/10",  text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20" },
];

// FIX — as const on all ease strings
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

const values = [
  { emoji: "🌍", title: "Worldwide Shipping", desc: "Delivered to 30+ countries"  },
  { emoji: "🔒", title: "Secure Payments",    desc: "100% safe transactions"       },
  { emoji: "↩️", title: "Easy Returns",       desc: "30-day hassle-free returns"   },
  { emoji: "💬", title: "24/7 Support",       desc: "Always here to help you"      },
];

export default function AboutBrand() {
  const [hovered, setHovered] = useState(false);

  return (
    <section className="relative bg-white dark:bg-neutral-950 overflow-hidden">

      {/* ── HERO ── */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-12 bg-gray-50 dark:bg-neutral-900/60">

        {/* Floating blobs — FIX: ease as const */}
        <motion.div
          className="absolute w-64 h-64 bg-yellow-200 dark:bg-yellow-500/10
            rounded-full -top-16 -left-16 opacity-40 blur-3xl pointer-events-none"
          animate={{ y: [0, -20, 0], x: [0, 14, 0] }}
          transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" as const }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-pink-200 dark:bg-pink-500/10
            rounded-full -bottom-20 -right-20 opacity-30 blur-3xl pointer-events-none"
          animate={{ y: [0, 20, 0], x: [0, -14, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" as const }}
        />

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2
          items-center gap-12 lg:gap-16">

          {/* ── IMAGE ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
            className="w-full"
          >
            <div
              className="relative w-full h-72 sm:h-96 lg:h-[460px]
                rounded-2xl overflow-hidden shadow-xl cursor-pointer"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <Image
                src="/products/male_t-shirts/f6.jpg"
                alt="BuyRova Brand"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`object-cover transition-opacity duration-500
                  ${hovered ? "opacity-0" : "opacity-100"}`}
                priority
              />
              <Image
                src="/products/male_t-shirts/f2.jpg"
                alt="BuyRova Brand — hover"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`object-cover transition-opacity duration-500
                  ${hovered ? "opacity-100" : "opacity-0"}`}
              />
              <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-neutral-900/90
                backdrop-blur-sm px-4 py-2 rounded-xl shadow-md flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-gray-800 dark:text-white">
                  New Collection 2025
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {stats.map((s) => (
                <div key={s.label}
                  className="bg-white dark:bg-neutral-900 border border-gray-100
                    dark:border-neutral-800 rounded-xl px-2 py-3 text-center shadow-sm">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── TEXT ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-block text-xs font-bold tracking-widest uppercase
                text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10
                border border-yellow-200 dark:border-yellow-500/20
                px-3 py-1 rounded-full mb-3">
                Our Story
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold
                text-gray-900 dark:text-white leading-tight">
                About <span className="text-yellow-500">BuyRova</span>
              </h2>
            </motion.div>

            <motion.p variants={fadeUp}
              className="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed">
              At <span className="font-semibold text-gray-900 dark:text-white">BuyRova</span>, we
              craft luxury products blending timeless elegance with modern design. Each piece is
              curated to inspire, elevate your lifestyle, and provide unmatched quality you can feel.
            </motion.p>

            <motion.p variants={fadeUp}
              className="text-gray-500 dark:text-gray-500 text-sm sm:text-base leading-relaxed">
              Founded with a passion for excellence, we source materials from around the world and
              work with artisans who share our commitment to craftsmanship. Every product tells a story.
            </motion.p>

            {/* Highlight cards */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {highlights.map((h) => (
                <div key={h.label}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border ${h.bg} ${h.border}`}>
                  <div className={`w-8 h-8 rounded-lg ${h.bg} ${h.text}
                    flex items-center justify-center shrink-0`}>
                    <h.icon size={15} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${h.text}`}>{h.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{h.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mt-2">
              <Link href="/shop">
                <motion.span
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600
                    text-white px-6 py-3 rounded-xl font-semibold text-sm
                    transition-colors duration-150 shadow-sm
                    shadow-yellow-200 dark:shadow-yellow-900/20 cursor-pointer"
                >
                  Explore Products <FiArrowRight size={14} />
                </motion.span>
              </Link>
              <Link href="/account/messages">
                <motion.span
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2
                    bg-white dark:bg-neutral-900
                    border border-gray-200 dark:border-neutral-700
                    text-gray-700 dark:text-gray-300
                    hover:border-yellow-400 dark:hover:border-yellow-500
                    hover:text-yellow-600 dark:hover:text-yellow-400
                    px-6 py-3 rounded-xl font-semibold text-sm
                    transition-all duration-150 shadow-sm cursor-pointer"
                >
                  Contact Us <FiArrowRight size={14} />
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── VALUES STRIP ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="border-t border-gray-100 dark:border-neutral-800
          bg-white dark:bg-neutral-900 px-4 sm:px-6 lg:px-12 py-12"
      >
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-bold tracking-widest uppercase
            text-gray-400 dark:text-gray-600 mb-8">
            Why Choose BuyRova
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {values.map((v) => (
              <div key={v.title} className="flex flex-col items-center gap-2">
                <span className="text-3xl">{v.emoji}</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{v.title}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </section>
  );
}