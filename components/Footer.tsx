"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-gray-50 text-gray-700 py-12 px-6 md:px-12"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-gray-900 font-bold text-lg mb-4">BUYROVA</h3>
          <p className="text-gray-600 text-sm">
            Premium furniture for modern lifestyles. Elegant, high-quality, and luxurious.
          </p>
        </div>

        <div>
          <h3 className="text-gray-900 font-bold text-lg mb-4">Quick Links</h3>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li><Link href="/" className="hover:text-yellow-500 transition">Home</Link></li>
            <li><Link href="/shop" className="hover:text-yellow-500 transition">Shop</Link></li>
            <li><Link href="/account" className="hover:text-yellow-500 transition">Account</Link></li>
            <li><Link href="/cart" className="hover:text-yellow-500 transition">Cart</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-gray-900 font-bold text-lg mb-4">Contact</h3>
          <p className="text-gray-600 text-sm">support@buyrova.com</p>
          <p className="text-gray-600 text-sm">+1 234 567 890</p>
          <div className="flex gap-4 mt-4">
            <Link href="#"><span className="hover:text-yellow-500 transition">Instagram</span></Link>
            <Link href="#"><span className="hover:text-yellow-500 transition">Facebook</span></Link>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm mt-8">
        © {new Date().getFullYear()} BuyRova. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default Footer;
