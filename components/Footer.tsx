"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

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

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-gray-950 border-t border-gray-800 text-gray-400"
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-black text-sm">B</span>
              </div>
              <span className="font-bold text-white text-lg">BuyRova</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Premium products for modern lifestyles. Quality, elegance, and exceptional design — all in one place.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {socials.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-yellow-500/20 border border-gray-700 hover:border-yellow-500/40 flex items-center justify-center text-gray-500 hover:text-yellow-400 transition"
                >
                  <Icon size={15} />
                </Link>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Shop</h4>
            <ul className="space-y-3">
              {links.shop.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-yellow-400 transition hover:translate-x-1 inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Account</h4>
            <ul className="space-y-3">
              {links.account.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-yellow-400 transition hover:translate-x-1 inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm">
                <FiMail size={14} className="text-yellow-400 flex-shrink-0" />
                <a href="mailto:support@buyrova.com" className="hover:text-yellow-400 transition">support@buyrova.com</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <FiPhone size={14} className="text-yellow-400 flex-shrink-0" />
                <span>+1 (234) 567-890</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <FiMapPin size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <span>123 Commerce St, New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {year} BuyRova. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
              <Link key={t} href="#" className="text-xs text-gray-600 hover:text-gray-400 transition">{t}</Link>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
