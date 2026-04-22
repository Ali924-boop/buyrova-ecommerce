"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <SessionProvider>
      {!isAdminPage && <Navbar />}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
      />

      <main>{children}</main>

      {!isAdminPage && <Footer />}
    </SessionProvider>
  );
}