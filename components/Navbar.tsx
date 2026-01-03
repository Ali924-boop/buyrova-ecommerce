/* eslint-disable react-hooks/immutability */
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiMenu,
  FiX,
  FiChevronDown,
} from "react-icons/fi";

const Navbar: React.FC = () => {
  const [showAccount, setShowAccount] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hidden, setHidden] = useState(false); // scroll hide/show

  const accountRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  let lastScroll = 0;

  const categories = [
    { name: "Clothing", slug: "clothing" },
    { name: "Furniture", slug: "furniture" },
    { name: "Electronics", slug: "electronics" },
    { name: "Accessories", slug: "accessories" },
  ];

  // Check cart count
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const totalQty = Array.isArray(cart)
      ? cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
      : 0;
    setCartCount(totalQty);
  }, []);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setShowAccount(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategories(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScroll = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      window.location.href = `/shop?search=${searchQuery.trim()}`;
    }
  };

  return (
    <motion.nav
      className={`bg-gray-50 shadow-lg sticky top-0 z-50 transition-transform duration-300 ${
        hidden ? "-translate-y-28" : "translate-y-0"
      }`}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <div className="text-2xl font-bold text-gray-900">
          <Link href="/">BuyRova</Link>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6 text-gray-700 font-medium items-center">
          <li>
            <Link href="/" className="hover:text-yellow-500 transition">Home</Link>
          </li>
          <li>
            <Link href="/shop" className="hover:text-yellow-500 transition">Shop</Link>
          </li>

          {/* Categories Dropdown */}
          <li className="relative" ref={categoryRef}>
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-1 hover:text-yellow-500 transition"
            >
              Categories <FiChevronDown className={`transition-transform ${showCategories ? "rotate-180" : "rotate-0"}`} />
            </button>

            {showCategories && (
              <div className="absolute top-8 left-0 bg-white shadow-lg rounded-lg py-2 w-48 flex flex-col z-50">
                {categories.map((cat, idx) => (
                  <Link
                    key={idx}
                    href={`/shop?category=${cat.slug}`}
                    className="px-4 py-2 hover:bg-yellow-50 transition"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </li>
        </ul>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-700 hover:text-yellow-500 transition"
            >
              <FiSearch size={20} />
            </button>
          </form>

          {/* Cart */}
          <Link href="/cart" className="relative text-gray-700 hover:text-yellow-500 transition">
            <FiShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Account */}
          {isLoggedIn ? (
            <div className="relative hidden md:block" ref={accountRef}>
              <button
                onClick={() => setShowAccount(!showAccount)}
                className="text-gray-700 hover:text-yellow-500 transition"
              >
                <FiUser size={24} />
              </button>
              {showAccount && (
                <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg py-2 flex flex-col gap-2 z-50">
                  <Link href="/account/profile" className="px-4 py-2 hover:text-yellow-500 transition">
                    Profile
                  </Link>
                  <Link href="/account/orders" className="px-4 py-2 hover:text-yellow-500 transition">
                    Orders
                  </Link>
                  <Link href="/account/wishlist" className="px-4 py-2 hover:text-yellow-500 transition">
                    Wishlist
                  </Link>
                  <Link href="/account/logout" className="px-4 py-2 hover:text-yellow-500 transition">
                    Logout
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Link href="/account/login" className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition">
                Login
              </Link>
              <Link href="/account/signup" className="px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition">
                Signup
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-yellow-500 transition"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden bg-gray-50 shadow-lg px-6 py-4 flex flex-col gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-700 hover:text-yellow-500 transition"
            >
              <FiSearch size={20} />
            </button>
          </form>

          {/* Links */}
          <Link href="/" className="hover:text-yellow-500 transition">Home</Link>
          <Link href="/shop" className="hover:text-yellow-500 transition">Shop</Link>

          {/* Mobile Categories */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex justify-between items-center w-full px-2 py-2 bg-gray-100 rounded-lg hover:bg-yellow-50 transition"
            >
              Categories <FiChevronDown className={`transition-transform ${showCategories ? "rotate-180" : "rotate-0"}`} />
            </button>
            {showCategories && (
              <div className="flex flex-col pl-4 mt-2 gap-2">
                {categories.map((cat, idx) => (
                  <Link
                    key={idx}
                    href={`/shop?category=${cat.slug}`}
                    className="hover:text-yellow-500 transition"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Account / Auth Links */}
          {isLoggedIn ? (
            <>
              <Link href="/account/profile" className="hover:text-yellow-500 transition">Profile</Link>
              <Link href="/account/orders" className="hover:text-yellow-500 transition">Orders</Link>
              <Link href="/account/wishlist" className="hover:text-yellow-500 transition">Wishlist</Link>
              <Link href="/account/logout" className="hover:text-yellow-500 transition">Logout</Link>
            </>
          ) : (
            <>
              <Link href="/account/login" className="hover:text-yellow-500 transition">Login</Link>
              <Link href="/account/signup" className="hover:text-yellow-500 transition">Signup</Link>
            </>
          )}

          <Link href="/cart" className="hover:text-yellow-500 transition">Cart</Link>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
