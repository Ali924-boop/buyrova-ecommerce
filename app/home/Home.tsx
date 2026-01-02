"use client";
import React from "react";
import Hero from "../home/Hero";
import Features from "../home/Features";
import NewArrivals from "../home/NewArrivals";
import SalesPromotions from "../home/SalesPromotions";
import Testimonials from "../home/Testimonials";
import CTA from "../home/CTA";
import About from "../home/About";

const Home: React.FC = () => {
  return (
    <div className="bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <Hero />

      {/* Featured Products */}
      <Features />

      {/* About Brand Section */}
      <About />

      {/* New Arrivals */}
      <NewArrivals />

      {/* Sales / Promotions */}
      <SalesPromotions />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA / Newsletter */}
      <CTA />
    </div>
  );
};

export default Home;
