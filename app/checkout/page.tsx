"use client";
import React, { useState } from "react";

const CheckoutPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Order placed successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 md:px-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-10 text-center">
        Checkout
      </h1>

      <form
        onSubmit={handlePlaceOrder}
        className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-xl flex flex-col gap-6"
      >
        <h2 className="text-2xl font-semibold text-gray-900">Billing Details</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          required
        />

        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="border border-gray-300 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          required
        />

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border border-gray-300 rounded px-4 py-3 w-1/2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
          <input
            type="text"
            placeholder="ZIP Code"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="border border-gray-300 rounded px-4 py-3 w-1/2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
        >
          Place Order
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
