import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuyRova E-commerce",
  description: "Luxury E-commerce experience with premium design",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`bg-neutral-950 text-white ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ IMPORTANT: Providers wraps EVERYTHING */}
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />

          <ToastContainer
            position="top-right"
            autoClose={2000}
            theme="dark"
          />
        </Providers>
      </body>
    </html>
  );
}