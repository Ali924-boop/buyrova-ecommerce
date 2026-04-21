"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiBarChart2,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiMail,
  FiSettings,
  FiPlus,
  FiList,
  FiChevronDown,
  FiMenu,
  FiX,
} from "react-icons/fi";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  children?: { label: string; href: string; icon?: React.ComponentType<{ className?: string; size?: number }> }[];
}

const navItems: NavItem[] = [
  { label: "Analytics", href: "/admin", icon: FiBarChart2 },
  {
    label: "Products",
    icon: FiBox,
    children: [
      { label: "All Products", href: "/admin/products", icon: FiList },
      { label: "Add Product", href: "/admin/products/add", icon: FiPlus },
    ],
  },
  {
    label: "Orders",
    icon: FiShoppingBag,
    children: [
      { label: "All Orders", href: "/admin/orders", icon: FiList },
    ],
  },
  { label: "Users", href: "/admin/users", icon: FiUsers },
  { label: "Messages", href: "/admin/messages", icon: FiMail },
  { label: "Settings", href: "/admin/settings", icon: FiSettings },
];

interface SidebarContentProps {
  pathname: string;
  openSections: Record<string, boolean>;
  toggleSection: (label: string) => void;
  unreadMessages: number;
}

function SidebarContent({ pathname, openSections, toggleSection, unreadMessages }: SidebarContentProps) {
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-black text-sm">B</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">BuyRova</p>
            <p className="text-xs text-gray-500 leading-tight">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group ${
                  isActive(item.href)
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {isActive(item.href) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-yellow-400 rounded-r-full" />
                )}
                <item.icon className={isActive(item.href) ? "text-yellow-400" : "text-gray-500 group-hover:text-gray-300"} />
                {item.label}
                {item.label === "Messages" && unreadMessages > 0 && (
                  <span className="ml-auto bg-yellow-500 text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {unreadMessages}
                  </span>
                )}
              </Link>
            );
          }

          const isGroupOpen = openSections[item.label];
          const isGroupActive = item.children?.some((c) =>
            c.href === "/admin" ? pathname === "/admin" : pathname.startsWith(c.href)
          );

          return (
            <div key={item.label}>
              <button
                onClick={() => toggleSection(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isGroupActive ? "text-yellow-400" : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <item.icon className={isGroupActive ? "text-yellow-400" : "text-gray-500 group-hover:text-gray-300"} />
                {item.label}
                <FiChevronDown
                  className={`ml-auto transition-transform ${isGroupOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isGroupOpen && (
                <div className="ml-8 mt-0.5 space-y-0.5">
                  {item.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive(child.href)
                          ? "text-yellow-400 bg-yellow-500/10"
                          : "text-gray-500 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      {child.icon && <child.icon className="text-xs" />}
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800">
        <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition">
          ← Back to Store
        </Link>
      </div>
    </div>
  );
}

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Products: true,
    Orders: true,
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((d: { read: boolean }[]) => {
        if (Array.isArray(d)) setUnreadMessages(d.filter((m) => !m.read).length);
      })
      .catch(() => {});
  }, [pathname]);

  const toggleSection = (label: string) =>
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));

  const sidebarProps = { pathname, openSections, toggleSection, unreadMessages };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
      >
        {mobileOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-64 bg-gray-950 border-r border-gray-800 h-screen fixed top-0 left-0 hidden md:flex flex-col z-40"
      >
        <SidebarContent {...sidebarProps} />
      </motion.aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: mobileOpen ? 0 : -260 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-64 bg-gray-950 border-r border-gray-800 h-screen fixed top-0 left-0 flex flex-col z-40 md:hidden"
      >
        <SidebarContent {...sidebarProps} />
      </motion.aside>
    </>
  );
};

export default AdminSidebar;
