/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiShoppingCart,
  FiSearch,
  FiMenu,
  FiX,
  FiChevronDown,
  FiHeart,
  FiMessageSquare,
} from "react-icons/fi";

interface UserData {
  name?: string;
  email?: string;
  avatar?: string;
}

const Navbar: React.FC = () => {
  const [showAccount, setShowAccount] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const [hidden, setHidden] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const lastScroll = useRef(0);

  const categories = [
    { name: "T-Shirts", slug: "t-shirts" },
    { name: "Pants", slug: "pants" },
    { name: "Suits", slug: "suits" },
    { name: "Accessories", slug: "accessories" },
  ];

  // Auth check
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!token);
      if (user) {
        try {
          setUserData(JSON.parse(user));
        } catch {
          setUserData({});
        }
      }
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Cart count
  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const total = Array.isArray(cart)
        ? cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
        : 0;
      setCartCount(total);
    };
    updateCart();
    window.addEventListener("storage", updateCart);
    return () => window.removeEventListener("storage", updateCart);
  }, []);

  // Wishlist count
  useEffect(() => {
    const updateWishlist = () => {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
    };
    updateWishlist();
    window.addEventListener("storage", updateWishlist);
    return () => window.removeEventListener("storage", updateWishlist);
  }, []);

  // Unread messages count — reads from localStorage key "unreadMessages"
  // The messages page writes this key whenever new support messages arrive
  useEffect(() => {
    const updateUnread = () => {
      const count = parseInt(localStorage.getItem("unreadMessages") || "0", 10);
      setUnreadMessages(isNaN(count) ? 0 : count);
    };
    updateUnread();
    window.addEventListener("storage", updateUnread);
    return () => window.removeEventListener("storage", updateUnread);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setShowAccount(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node))
        setShowCategories(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll hide/show
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setHidden(current > lastScroll.current && current > 100);
      lastScroll.current = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim())
      window.location.href = `/shop?search=${searchQuery.trim()}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserData({});
    setShowAccount(false);
    window.location.href = "/";
  };

  // Avatar — initials fallback
  const Avatar = () => {
    const initials = userData.name
      ? userData.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
      : "U";

    if (userData.avatar) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={userData.avatar}
          alt={userData.name || "User"}
          className="w-[34px] h-[34px] rounded-full ring-2 ring-yellow-400 object-cover"
        />
      );
    }

    return (
      <div className="w-[34px] h-[34px] rounded-full ring-2 ring-yellow-400 bg-yellow-500 flex items-center justify-center text-white text-xs font-bold select-none">
        {initials}
      </div>
    );
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
              Categories
              <FiChevronDown className={`transition-transform duration-200 ${showCategories ? "rotate-180" : "rotate-0"}`} />
            </button>
            {showCategories && (
              <div className="absolute top-9 left-0 bg-white shadow-xl rounded-xl py-2 w-48 flex flex-col z-50 border border-gray-100">
                {categories.map((cat, idx) => (
                  <Link
                    key={idx}
                    href={`/shop?category=${cat.slug}`}
                    onClick={() => setShowCategories(false)}
                    className="px-4 py-2.5 hover:bg-yellow-50 hover:text-yellow-600 transition text-sm"
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

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500 transition"
            >
              <FiSearch size={18} />
            </button>
          </form>

          {/* Wishlist Icon */}
          <Link
            href="/account/wishlist"
            className="relative text-gray-700 hover:text-red-500 transition"
            title="Wishlist"
          >
            <FiHeart size={23} />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative text-gray-700 hover:text-yellow-500 transition"
            title="Cart"
          >
            <FiShoppingCart size={23} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Messages icon — only when logged in */}
          {isLoggedIn && (
            <Link
              href="/account/messages"
              className="relative text-gray-700 hover:text-yellow-500 transition"
              title="Messages"
            >
              <FiMessageSquare size={23} />
              {unreadMessages > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {unreadMessages}
                </span>
              )}
            </Link>
          )}

          {/* Account — desktop */}
          {isLoggedIn ? (
            <div className="relative hidden md:block" ref={accountRef}>
              <button
                onClick={() => setShowAccount(!showAccount)}
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                <Avatar />
              </button>

              {showAccount && (
                <div className="absolute right-0 mt-3 w-60 bg-white text-black shadow-2xl rounded-2xl py-3 z-50 border border-gray-100">

                  {/* User Info */}
                  <div className="px-4 pb-3 border-b border-gray-100 flex items-center gap-3">
                    <Avatar />
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {userData.name || "User"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {userData.email || ""}
                      </p>
                    </div>
                  </div>

                  {/* Account Links */}
                  <div className="pt-2">
                    <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Account
                    </p>
                    <Link href="/account/profile" onClick={() => setShowAccount(false)} className="block px-4 py-2 hover:bg-gray-50 hover:text-yellow-500 transition text-sm">Profile</Link>
                    <Link href="/account/orders" onClick={() => setShowAccount(false)} className="block px-4 py-2 hover:bg-gray-50 hover:text-yellow-500 transition text-sm">Orders</Link>
                    <Link href="/account/wishlist" onClick={() => setShowAccount(false)} className="block px-4 py-2 hover:bg-gray-50 hover:text-yellow-500 transition text-sm">Wishlist</Link>
                    <Link
                      href="/account/messages"
                      onClick={() => setShowAccount(false)}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 hover:text-yellow-500 transition text-sm"
                    >
                      Messages
                      {unreadMessages > 0 && (
                        <span className="text-xs bg-yellow-500 text-white rounded-full px-1.5 py-0.5 font-bold leading-none">
                          {unreadMessages}
                        </span>
                      )}
                    </Link>
                  </div>

                  <div className="my-2 border-t border-gray-100" />

                  {/* Actions */}
                  <div>
                    <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Actions
                    </p>
                    <Link href="/account/settings" onClick={() => setShowAccount(false)} className="block px-4 py-2 hover:bg-gray-50 hover:text-yellow-500 transition text-sm">Settings</Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-500 transition text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Link href="/account/login" className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition text-sm">Login</Link>
              <Link href="/account/signup" className="px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition text-sm">Signup</Link>
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
        <div className="md:hidden bg-gray-50 shadow-inner px-6 py-4 flex flex-col gap-4 border-t border-gray-200">

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition text-sm"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500">
              <FiSearch size={18} />
            </button>
          </form>

          {/* Mobile User Info */}
          {isLoggedIn && (
            <div className="flex items-center gap-3 bg-yellow-50 rounded-xl px-3 py-2 border border-yellow-100">
              <Avatar />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{userData.name || "User"}</p>
                <p className="text-xs text-gray-400 truncate">{userData.email || ""}</p>
              </div>
            </div>
          )}

          <Link href="/" onClick={() => setMobileMenu(false)} className="hover:text-yellow-500 transition text-sm font-medium">Home</Link>
          <Link href="/shop" onClick={() => setMobileMenu(false)} className="hover:text-yellow-500 transition text-sm font-medium">Shop</Link>

          {/* Mobile Categories */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex justify-between items-center w-full px-3 py-2 bg-gray-100 rounded-lg hover:bg-yellow-50 transition text-sm font-medium"
            >
              Categories
              <FiChevronDown className={`transition-transform duration-200 ${showCategories ? "rotate-180" : ""}`} />
            </button>
            {showCategories && (
              <div className="flex flex-col pl-4 gap-1 mt-1">
                {categories.map((cat, idx) => (
                  <Link
                    key={idx}
                    href={`/shop?category=${cat.slug}`}
                    onClick={() => { setShowCategories(false); setMobileMenu(false); }}
                    className="py-1.5 hover:text-yellow-500 transition text-sm"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {isLoggedIn ? (
            <>
              <Link href="/account/profile" onClick={() => setMobileMenu(false)} className="hover:text-yellow-500 transition text-sm">Profile</Link>
              <Link href="/account/orders" onClick={() => setMobileMenu(false)} className="hover:text-yellow-500 transition text-sm">Orders</Link>
              <Link href="/account/wishlist" onClick={() => setMobileMenu(false)} className="hover:text-yellow-500 transition text-sm">Wishlist</Link>
              <Link
                href="/account/messages"
                onClick={() => setMobileMenu(false)}
                className="flex items-center justify-between hover:text-yellow-500 transition text-sm"
              >
                Messages
                {unreadMessages > 0 && (
                  <span className="text-xs bg-yellow-500 text-white rounded-full px-1.5 py-0.5 font-bold leading-none">
                    {unreadMessages}
                  </span>
                )}
              </Link>
              <Link href="/account/settings" onClick={() => setMobileMenu(false)} className="hover:text-yellow-500 transition text-sm">Settings</Link>
              <button onClick={handleLogout} className="text-left text-red-500 hover:text-red-600 transition text-sm font-medium">Logout</button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/account/login" onClick={() => setMobileMenu(false)} className="flex-1 text-center px-4 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition text-sm">Login</Link>
              <Link href="/account/signup" onClick={() => setMobileMenu(false)} className="flex-1 text-center px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition text-sm">Signup</Link>
            </div>
          )}

          <Link href="/cart" onClick={() => setMobileMenu(false)} className="hover:text-yellow-500 transition text-sm">
            Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;