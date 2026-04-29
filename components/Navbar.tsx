"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  FiShoppingCart, FiSearch, FiMenu, FiX,
  FiChevronDown, FiHeart, FiMessageSquare,
  FiGrid, FiUser, FiLogOut, FiSettings,
  FiPackage, FiTag, FiSun, FiMoon,
} from "react-icons/fi";

interface CartItem {
  _id: string;
  quantity?: number;
}

// ── useLocalStorage synced counter ───────────────────────────────────────────
function useLSCount(key: string, reducer?: (raw: unknown) => number) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const read = () => {
      try {
        const stored = localStorage.getItem(key);
        const raw: unknown = JSON.parse(stored ?? (reducer ? "0" : "[]"));
        if (reducer) {
          setCount(reducer(raw));
        } else {
          setCount(
            Array.isArray(raw)
              ? (raw as CartItem[]).reduce((s, i) => s + (i.quantity ?? 1), 0)
              : 0
          );
        }
      } catch {
        setCount(0);
      }
    };

    read();
    window.addEventListener("storage", read);
    const interval = setInterval(read, 500);
    return () => {
      window.removeEventListener("storage", read);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return count;
}

// ── Theme hook ────────────────────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  return { theme, toggle };
}

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ name?: string; image?: string; size?: number }> = ({
  name, image, size = 34,
}) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";
  const s = `${size}px`;

  if (image)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name || "User"}
        style={{ width: s, height: s }}
        className="rounded-full ring-2 ring-yellow-400 object-cover"
      />
    );

  return (
    <div
      style={{ width: s, height: s }}
      className="rounded-full ring-2 ring-yellow-400 bg-yellow-500 flex items-center justify-center text-white text-xs font-bold select-none shrink-0"
    >
      {initials}
    </div>
  );
};

// ── Main Navbar ───────────────────────────────────────────────────────────────
const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router   = useRouter();
  const { theme, toggle: toggleTheme } = useTheme();

  // ✅ NextAuth session — replaces localStorage token check
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const user       = session?.user;

  const [showAccount,          setShowAccount]          = useState(false);
  const [mobileMenu,           setMobileMenu]           = useState(false);
  const [showCategories,       setShowCategories]       = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [searchQuery,          setSearchQuery]          = useState("");
  const [showMobileSearch,     setShowMobileSearch]     = useState(false);
  const [hidden,               setHidden]               = useState(false);
  const [categories,           setCategories]           = useState<string[]>([]);
  const [categoriesLoading,    setCategoriesLoading]    = useState(true);

  const accountRef      = useRef<HTMLDivElement>(null);
  const categoryRef     = useRef<HTMLLIElement>(null);
  const lastScroll      = useRef(0);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const cartCount      = useLSCount("cart");
  const wishlistCount  = useLSCount("wishlist");
  const unreadMessages = useLSCount("unreadMessages", (raw) => {
    const n = parseInt(String(raw), 10);
    return isNaN(n) ? 0 : n;
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res  = await fetch("/api/products");
        const data = await res.json() as Array<{ category?: string }>;
        const cats = Array.from(
          new Set(
            data
              .map((p) => p.category)
              .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
              .map((c) => c.trim())
          )
        ).sort();
        setCategories(cats);
      } catch {
        setCategories(["T-Shirts", "Pants", "Suits", "Accessories"]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current  && !accountRef.current.contains(e.target as Node))  setShowAccount(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setShowCategories(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Hide navbar on scroll down
  useEffect(() => {
    const handle = () => {
      const cur = window.scrollY;
      setHidden(cur > lastScroll.current && cur > 80);
      lastScroll.current = cur;
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenu(false);
    setShowAccount(false);
    setShowCategories(false);
  }, [pathname]);

  // Auto-focus mobile search
  useEffect(() => {
    if (showMobileSearch) setTimeout(() => mobileSearchRef.current?.focus(), 100);
  }, [showMobileSearch]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/shop?search=${encodeURIComponent(q)}`);
      setShowMobileSearch(false);
    }
  }, [searchQuery, router]);

  // ✅ NextAuth signOut — no more localStorage.removeItem
  const handleLogout = async () => {
    setShowAccount(false);
    await signOut({ callbackUrl: "/" });
  };

  const isActive = (href: string) => pathname === href;

  const navLink = (href: string) =>
    `transition-colors duration-150 ${
      isActive(href)
        ? "text-yellow-500 font-semibold"
        : "text-gray-700 dark:text-gray-200 hover:text-yellow-500 dark:hover:text-yellow-400"
    }`;

  const Badge: React.FC<{ count: number; color?: string }> = ({ count, color = "bg-red-500" }) =>
    count > 0 ? (
      <span className={`absolute -top-2 -right-2 ${color} text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none`}>
        {count > 99 ? "99+" : count}
      </span>
    ) : null;

  return (
    <>
      <motion.nav
        className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 sm:px-6 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-yellow-500 dark:bg-yellow-400 flex-shrink-0">
              <span className="text-gray-900 font-black text-sm">B</span>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white whitespace-nowrap">
              BuyRova
            </span>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-1 text-sm font-medium">
            <li><Link href="/"     className={`px-3 py-2 rounded-lg ${navLink("/")}`}>Home</Link></li>
            <li><Link href="/shop" className={`px-3 py-2 rounded-lg ${navLink("/shop")}`}>Shop</Link></li>

            {/* Categories Dropdown */}
            <li className="relative" ref={categoryRef}>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  showCategories
                    ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10"
                    : "text-gray-700 dark:text-gray-200 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <FiGrid size={14} />
                Categories
                <FiChevronDown size={14} className={`transition-transform duration-200 ${showCategories ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-11 left-0 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl py-2 min-w-[200px] z-50 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="px-3 pb-2 pt-1 border-b border-gray-100 dark:border-gray-700 mb-1">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Browse by</p>
                    </div>

                    <Link href="/shop" onClick={() => setShowCategories(false)}
                      className={`flex items-center gap-2.5 mx-1 px-3 py-2 rounded-xl text-sm transition-all ${
                        pathname === "/shop"
                          ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-medium"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-yellow-500 dark:hover:text-yellow-400"
                      }`}>
                      <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs">🛍️</span>
                      All Products
                    </Link>

                    <Link href="/shop?category=sale" onClick={() => setShowCategories(false)}
                      className="flex items-center gap-2.5 mx-1 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all">
                      <span className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                        <FiTag size={12} className="text-red-500" />
                      </span>
                      <span>Sale</span>
                      <span className="ml-auto text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">HOT</span>
                    </Link>

                    {categoriesLoading ? (
                      <div className="px-4 py-3 flex gap-2 items-center text-xs text-gray-400 dark:text-gray-500">
                        <span className="w-3 h-3 border-2 border-gray-200 dark:border-gray-600 border-t-gray-400 rounded-full animate-spin" />
                        Loading...
                      </div>
                    ) : categories.length === 0 ? (
                      <p className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500">No categories found</p>
                    ) : (
                      categories.map((cat) => (
                        <Link key={cat}
                          href={`/shop/category/${encodeURIComponent(cat.toLowerCase())}`}
                          onClick={() => setShowCategories(false)}
                          className={`flex items-center gap-2.5 mx-1 px-3 py-2 rounded-xl text-sm transition-all ${
                            pathname === `/shop/category/${cat.toLowerCase()}`
                              ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-medium"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-yellow-500 dark:hover:text-yellow-400"
                          }`}>
                          <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs capitalize">
                            {cat[0]}
                          </span>
                          {cat}
                        </Link>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>

          {/* Right Side */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="relative hidden md:flex items-center">
              <input
                suppressHydrationWarning
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 lg:w-56 pl-3 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 transition text-sm"
              />
              <button suppressHydrationWarning type="submit" className="absolute right-2 text-gray-400 hover:text-yellow-500 transition">
                <FiSearch size={15} />
              </button>
            </form>

            {/* Mobile search toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>

            {/* Wishlist */}
            <Link href="/account/wishlist"
              className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
              title="Wishlist">
              <FiHeart size={20} />
              <Badge count={wishlistCount} />
            </Link>

            {/* Cart */}
            <Link href="/cart"
              className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 transition"
              title="Cart">
              <FiShoppingCart size={20} />
              <Badge count={cartCount} />
            </Link>

            {/* Messages */}
            {isLoggedIn && (
              <Link href="/account/messages"
                className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 transition hidden sm:flex"
                title="Messages">
                <FiMessageSquare size={20} />
                <Badge count={unreadMessages} color="bg-yellow-500" />
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === "dark" ? (
                  <motion.span key="sun"
                    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} className="block">
                    <FiSun size={20} />
                  </motion.span>
                ) : (
                  <motion.span key="moon"
                    initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} className="block">
                    <FiMoon size={20} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Account — desktop */}
            {/* ✅ show skeleton while session loads to avoid flash */}
            {status === "loading" ? (
              <div className="hidden md:block w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : isLoggedIn ? (
              <div className="relative hidden md:block" ref={accountRef}>
                <button
                  onClick={() => setShowAccount(!showAccount)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  aria-expanded={showAccount}
                >
                  <Avatar name={user?.name ?? ""} image={user?.image ?? ""} />
                  <FiChevronDown size={14} className={`text-gray-400 dark:text-gray-500 transition-transform ${showAccount ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showAccount && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl py-2 z-50 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                        <Avatar name={user?.name ?? ""} image={user?.image ?? ""} size={38} />
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || "User"}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email || ""}</p>
                        </div>
                      </div>

                      <div className="py-1 px-2">
                        {[
                          { href: "/account/profile",  icon: FiUser,    label: "Profile"   },
                          { href: "/account/orders",   icon: FiPackage, label: "My Orders" },
                          { href: "/account/wishlist", icon: FiHeart,   label: "Wishlist"  },
                        ].map(({ href, icon: Icon, label }) => (
                          <Link key={href} href={href} onClick={() => setShowAccount(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                              isActive(href)
                                ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-medium"
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-yellow-500 dark:hover:text-yellow-400"
                            }`}>
                            <Icon size={15} />{label}
                          </Link>
                        ))}

                        <Link href="/account/messages" onClick={() => setShowAccount(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                            isActive("/account/messages")
                              ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-medium"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-yellow-500 dark:hover:text-yellow-400"
                          }`}>
                          <FiMessageSquare size={15} />
                          Messages
                          {unreadMessages > 0 && (
                            <span className="ml-auto text-xs bg-yellow-500 text-white rounded-full px-1.5 py-0.5 font-bold leading-none">
                              {unreadMessages}
                            </span>
                          )}
                        </Link>
                      </div>

                      <div className="my-1 border-t border-gray-100 dark:border-gray-700 mx-2" />

                      <div className="py-1 px-2">
                        <Link href="/account/settings" onClick={() => setShowAccount(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all">
                          <FiSettings size={15} />Settings
                        </Link>
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                          <FiLogOut size={15} />Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link href="/account/login"  className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-400 transition text-sm shadow-sm">Login</Link>
                <Link href="/account/signup" className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm">Sign up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label={mobileMenu ? "Close menu" : "Open menu"}
            >
              {mobileMenu ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showMobileSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-gray-100 dark:border-gray-800"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2 px-4 py-3">
                <div className="relative flex-1">
                  <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    suppressHydrationWarning
                    ref={mobileSearchRef}
                    type="text"
                    placeholder="Search products…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white dark:focus:bg-gray-700 focus:border-yellow-400 focus:outline-none text-sm transition"
                  />
                </div>
                <button suppressHydrationWarning type="submit"
                  className="px-4 py-2.5 bg-yellow-500 text-white rounded-xl text-sm font-semibold hover:bg-yellow-400 transition shrink-0">
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <div className="px-4 py-4 flex flex-col gap-1">

                {isLoggedIn && (
                  <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 rounded-2xl px-4 py-3 mb-3">
                    <Avatar name={user?.name ?? ""} image={user?.image ?? ""} />
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email || ""}</p>
                    </div>
                  </div>
                )}

                {[{ href: "/", label: "Home" }, { href: "/shop", label: "Shop" }].map(({ href, label }) => (
                  <Link key={href} href={href}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive(href)
                        ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-yellow-500 dark:hover:text-yellow-400"
                    }`}>
                    {label}
                  </Link>
                ))}

                <button
                  onClick={() => setShowMobileCategories(!showMobileCategories)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all"
                >
                  <span className="flex items-center gap-2"><FiGrid size={15} />Categories</span>
                  <FiChevronDown size={14} className={`transition-transform ${showMobileCategories ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showMobileCategories && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-5 flex flex-col gap-0.5 pb-1">
                        <Link href="/shop" onClick={() => setMobileMenu(false)}
                          className="px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all">
                          🛍️ All Products
                        </Link>
                        <Link href="/shop?category=sale" onClick={() => setMobileMenu(false)}
                          className="px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-between">
                          🔥 Sale
                          <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">HOT</span>
                        </Link>
                        {categoriesLoading ? (
                          <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">Loading categories…</p>
                        ) : (
                          categories.map((cat) => (
                            <Link key={cat}
                              href={`/shop/category/${encodeURIComponent(cat.toLowerCase())}`}
                              onClick={() => setMobileMenu(false)}
                              className={`px-3 py-2 rounded-xl text-sm transition-all ${
                                pathname === `/shop/category/${cat.toLowerCase()}`
                                  ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-medium"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 hover:text-yellow-600 dark:hover:text-yellow-400"
                              }`}>
                              {cat}
                            </Link>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

                {/* Mobile theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all"
                >
                  {theme === "dark" ? <FiSun size={15} /> : <FiMoon size={15} />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>

                <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

                {isLoggedIn ? (
                  <>
                    {[
                      { href: "/account/profile",  label: "Profile",   icon: FiUser     },
                      { href: "/account/orders",   label: "My Orders", icon: FiPackage  },
                      { href: "/account/wishlist", label: "Wishlist",  icon: FiHeart    },
                      { href: "/account/settings", label: "Settings",  icon: FiSettings },
                    ].map(({ href, label, icon: Icon }) => (
                      <Link key={href} href={href}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive(href)
                            ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-yellow-500 dark:hover:text-yellow-400"
                        }`}>
                        <Icon size={15} />{label}
                      </Link>
                    ))}

                    <Link href="/account/messages"
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all">
                      <span className="flex items-center gap-2.5"><FiMessageSquare size={15} />Messages</span>
                      {unreadMessages > 0 && (
                        <span className="text-xs bg-yellow-500 text-white rounded-full px-2 py-0.5 font-bold">{unreadMessages}</span>
                      )}
                    </Link>

                    <button onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all mt-1">
                      <FiLogOut size={15} />Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Link href="/account/login" onClick={() => setMobileMenu(false)}
                      className="flex-1 text-center py-2.5 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-400 transition text-sm shadow-sm">
                      Login
                    </Link>
                    <Link href="/account/signup" onClick={() => setMobileMenu(false)}
                      className="flex-1 text-center py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm">
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;