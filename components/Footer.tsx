"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiInstagram, FiTwitter, FiFacebook, FiYoutube,
  FiMail, FiPhone, FiMapPin, FiArrowRight, FiCheck,
} from "react-icons/fi";

// ── Animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const colVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ── Payment method SVG icons (inline, no external dep) ───────────────────────
const PaymentIcons = () => (
  <div className="flex items-center gap-2 flex-wrap">
    {["Visa", "MC", "Amex", "PayPal", "COD"].map((method) => (
      <span
        key={method}
        className="px-2 py-1 rounded border border-gray-700 text-[10px] font-semibold text-gray-500 bg-gray-900 tracking-wide"
      >
        {method}
      </span>
    ))}
  </div>
);

// ── Main Footer ───────────────────────────────────────────────────────────────
const Footer: React.FC = () => {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  // FIX 2: Derive year only on the client to avoid server/client timezone mismatch.
  // Initialise with null so the server renders nothing, then hydrate with the
  // real value — both sides agree and React is happy.
  const [year, setYear] = useState<number | null>(null);
  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || subscribed) return;
    setSubscribing(true);
    // Replace with your actual newsletter API call
    await new Promise((r) => setTimeout(r, 900));
    setSubscribed(true);
    setSubscribing(false);
  };

  const links = {
    shop: [
      { label: "All Products", href: "/shop" },
      { label: "Clothing", href: "/shop?category=clothing" },
      { label: "Furniture", href: "/shop?category=furniture" },
      { label: "Electronics", href: "/shop?category=electronics" },
      { label: "Accessories", href: "/shop?category=accessories" },
    ],
    account: [
      { label: "My Profile", href: "/account/profile" },
      { label: "My Orders", href: "/account/orders" },
      { label: "Wishlist", href: "/account/wishlist" },
      { label: "Cart", href: "/cart" },
      { label: "Sign In", href: "/account/login" },
    ],
  };

  const socials = [
    { icon: FiInstagram, href: "#", label: "Instagram" },
    { icon: FiFacebook, href: "#", label: "Facebook" },
    { icon: FiTwitter, href: "#", label: "Twitter" },
    { icon: FiYoutube, href: "#", label: "YouTube" },
  ];

  const isActive = (href: string) => pathname === href.split("?")[0];

  return (
    <footer className="bg-gray-950 border-t border-gray-800 text-gray-400">

      {/* ── Newsletter Banner ── */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div>
            <p className="text-white font-semibold text-base">Stay in the loop</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Get new arrivals, exclusive deals, and style tips — straight to your inbox.
            </p>
          </div>

          <form
            onSubmit={handleSubscribe}
            className="flex w-full sm:w-auto items-center gap-2 shrink-0"
          >
            {subscribed ? (
              <span className="flex items-center gap-2 text-sm text-yellow-400 font-medium">
                <FiCheck size={16} /> You&apos;re subscribed!
              </span>
            ) : (
              <>
                {/*
                  FIX 1: suppressHydrationWarning on <input> and <button> prevents
                  the hydration mismatch caused by browser extensions (LastPass,
                  1Password, Grammarly, etc.) injecting fdprocessedid attributes
                  into form fields after SSR. This is scoped to just these elements
                  and does not suppress warnings in their children.
                */}
                <input
                  suppressHydrationWarning
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 sm:w-60 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/40 transition"
                />
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={subscribing}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-gray-900 text-sm font-semibold transition disabled:opacity-60 shrink-0"
                >
                  {subscribing ? (
                    <span className="w-4 h-4 border-2 border-gray-900/40 border-t-gray-900 rounded-full animate-spin" />
                  ) : (
                    <>Subscribe <FiArrowRight size={14} /></>
                  )}
                </button>
              </>
            )}
          </form>
        </motion.div>
      </div>

      {/* ── Main Grid ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6 py-14"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <motion.div variants={colVariants} className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-gray-900 font-black text-sm">B</span>
              </div>
              <span className="font-bold text-white text-lg">BuyRova</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Premium products for modern lifestyles. Quality, elegance, and exceptional design — all in one place.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {socials.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-yellow-500/20 border border-gray-700 hover:border-yellow-500/40 flex items-center justify-center text-gray-500 hover:text-yellow-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                >
                  <Icon size={15} />
                </Link>
              ))}
            </div>

            {/* Payment methods */}
            <div className="pt-2">
              <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide">We accept</p>
              <PaymentIcons />
            </div>
          </motion.div>

          {/* Shop links */}
          <motion.div variants={colVariants}>
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5">Shop</h4>
            <ul className="space-y-3">
              {links.shop.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={`text-sm inline-flex items-center gap-1 transition-all duration-150 hover:translate-x-1 ${
                      isActive(href)
                        ? "text-yellow-400 font-medium"
                        : "hover:text-yellow-400"
                    }`}
                  >
                    {isActive(href) && (
                      <span className="w-1 h-1 rounded-full bg-yellow-400 shrink-0" />
                    )}
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Account links */}
          <motion.div variants={colVariants}>
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5">Account</h4>
            <ul className="space-y-3">
              {links.account.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={`text-sm inline-flex items-center gap-1 transition-all duration-150 hover:translate-x-1 ${
                      isActive(href)
                        ? "text-yellow-400 font-medium"
                        : "hover:text-yellow-400"
                    }`}
                  >
                    {isActive(href) && (
                      <span className="w-1 h-1 rounded-full bg-yellow-400 shrink-0" />
                    )}
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={colVariants}>
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:support@buyrova.com"
                  className="flex items-center gap-2.5 text-sm hover:text-yellow-400 transition group"
                >
                  <span className="w-7 h-7 rounded-md bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0 group-hover:border-yellow-500/40 transition">
                    <FiMail size={13} className="text-yellow-400" />
                  </span>
                  support@buyrova.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+12345678900"
                  className="flex items-center gap-2.5 text-sm hover:text-yellow-400 transition group"
                >
                  <span className="w-7 h-7 rounded-md bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0 group-hover:border-yellow-500/40 transition">
                    <FiPhone size={13} className="text-yellow-400" />
                  </span>
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <span className="w-7 h-7 rounded-md bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                  <FiMapPin size={13} className="text-yellow-400" />
                </span>
                <span className="leading-relaxed">
                  123 Commerce St,<br />New York, NY 10001
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* ── Bottom bar ── */}
        <motion.div
          variants={colVariants}
          className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          {/*
            FIX 2: year is null during SSR and set to the real value on the client
            via useEffect. Both server and client render the same initial null → no
            mismatch. The year appears instantly after hydration with no visible flash.
          */}
          <p className="text-xs text-gray-600 order-2 sm:order-1">
            © {year ?? "—"} BuyRova. All rights reserved.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center order-1 sm:order-2">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
              <Link
                key={t}
                href="#"
                className="text-xs text-gray-600 hover:text-gray-300 transition focus-visible:outline-none focus-visible:text-yellow-400"
              >
                {t}
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;