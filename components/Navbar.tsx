"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  Heart,
  Sun,
  Moon,
} from "lucide-react";

const categories = [
  { name: "Clothing", slug: "clothing" },
  { name: "Furniture", slug: "furniture" },
  { name: "Electronics", slug: "electronics" },
  { name: "Accessories", slug: "accessories" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const pathname = usePathname();
  const router = useRouter();

  const [showCategories, setShowCategories] = useState(false);
  const [mobileCategories, setMobileCategories] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const categoryRef = useRef<HTMLLIElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const total = Array.isArray(cart)
        ? cart.reduce((s, i) => s + (i.quantity || 1), 0)
        : 0;
      setCartCount(total);
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    return () => window.removeEventListener("storage", syncCart);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node))
        setShowCategories(false);

      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setShowAccount(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/shop?search=${searchQuery}`);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all ${scrolled
          ? "bg-neutral-950/95 border-b border-white/10 backdrop-blur-xl"
          : "bg-neutral-950/80 backdrop-blur-md"
          }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-black text-xs sm:text-sm">B</span>
            </div>
            <span className="font-bold text-white text-sm sm:text-lg">
              BuyRova
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <ul className="hidden md:flex items-center gap-3">
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm ${isActive(item.href)
                    ? "text-yellow-400 bg-yellow-500/10"
                    : "text-gray-300 hover:text-white"
                    }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Categories */}
            <li ref={categoryRef} className="relative">
              <button
                onClick={() => setShowCategories(prev => !prev)}
                className="flex items-center gap-1 px-3 py-2 text-gray-300 text-sm"
              >
                Categories <ChevronDown size={14} />
              </button>

              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-full left-0 w-44 sm:w-48 lg:w-30 bg-white border border-white/10 rounded-lg shadow-lg z-50"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        className="block px-3 py-2 text-sm hover:bg-gray-100 hover:rounded-lg"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* SEARCH */}
            <form onSubmit={handleSearch} className="hidden md:block relative">
              <Search
                size={16}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-white/5 border border-white/10 text-sm pl-8 pr-3 py-1.5 rounded-lg text-white w-32 lg:w-48"
              />
            </form>

            {/* WISHLIST */}
            <Link href="/account/wishlist" className="text-white">
              <Heart size={18} />
            </Link>

            {/* CART */}
            <Link href="/cart" className="relative text-white">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* DARK MODE */}
            <button onClick={() => setDarkMode(!darkMode)} className="text-white">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* LOGIN / SIGNUP */}
            {!user && (
              <div className="hidden md:flex items-center gap-2 lg:gap-3">

                <Link
                  href="/account/login"
                  className=" 
        bg-blue-300 text-black 
        px-2 sm:px-3 py-1.5 
        rounded-lg text-xs sm:text-sm 
        font-semibold 
        hover:bg-blue-500 
        transition 
        whitespace-nowrap
      "
                >
                  Login
                </Link>

                <Link
                  href="/account/signup"
                  className="
        bg-yellow-400 text-black 
        px-2 sm:px-3 py-1.5 
        rounded-lg text-xs sm:text-sm 
        font-semibold 
        hover:bg-yellow-300 
        transition 
        whitespace-nowrap
      "
                >
                  Sign Up
                </Link>

              </div>
            )}

            {/* MOBILE BUTTON */}
            <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU (ONLY RESPONSIVE FIXED) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed right-0 top-0 bottom-0 w-[50%] max-w-xs bg-gray-700 border-l border-white/10 z-50 p-4 overflow-y-auto"
          >
            <button onClick={() => setMobileOpen(false)} className="text-white mb-4">
              <X />
            </button>

            <div className="flex flex-col gap-3 text-white text-sm">

              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-gray-300" size={16} />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-gray-800 text-white pl-9 py-2 rounded-lg"
                  />
                </div>
              </form>

              <Link href="/">Home</Link>
              <Link href="/shop">Shop</Link>

              {/* 📂 CATEGORIES */}
              <div className="border-t border-white/10 pt-2">
                <button
                  onClick={() => setMobileCategories(prev => !prev)}
                  className="flex items-center justify-between w-full py-2 text-left"
                >
                  <span>Categories</span>

                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${mobileCategories ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* FIXED DROPDOWN */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${mobileCategories
                    ? "max-h-60 opacity-100 translate-y-0"
                    : "max-h-0 opacity-0 -translate-y-2"
                    }`}
                >
                  <div className="flex flex-col pl-3 mt-2 space-y-2 pb-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        onClick={() => {
                          setMobileOpen(false);
                          setMobileCategories(false);
                        }}
                        className="text-gray-300 hover:text-yellow-400 text-sm"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link href="/wishlist">Wishlist</Link>
              <Link href="/cart">Cart</Link>

              {!user && (
                <>
                  <Link href="/login">Login</Link>
                  <Link
                    href="/signup"
                    className="bg-yellow-500 text-black px-3 py-2 rounded-lg text-center"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}