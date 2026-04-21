"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiUser, FiMail, FiMapPin, FiCreditCard, FiArrowLeft, FiTruck } from "react-icons/fi";

interface CartItemType {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  const [form, setForm] = useState({
    name: "", email: "", address: "", city: "", zip: "", country: "United States",
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, paymentMethod, items: cart, total }),
      });
      if (res.ok) {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("storage"));
        router.push("/checkout/success");
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition";

  return (
    <div className="min-h-screen bg-gray-950 px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-white transition">
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Checkout</h1>
            <p className="text-gray-400 text-sm">Complete your order details</p>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — Billing */}
            <div className="lg:col-span-2 space-y-5">
              {/* Contact */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FiUser className="text-yellow-400" /> Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required className={inputClass + " pl-10"} />
                  </div>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email Address" required className={inputClass + " pl-10"} />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FiMapPin className="text-yellow-400" /> Shipping Address
                </h2>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Street Address" required className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <input name="city" value={form.city} onChange={handleChange} placeholder="City" required className={inputClass} />
                  <input name="zip" value={form.zip} onChange={handleChange} placeholder="ZIP / Postal Code" required className={inputClass} />
                </div>
                <select name="country" value={form.country} onChange={handleChange} className={inputClass}>
                  {["United States", "United Kingdom", "Canada", "Australia", "Pakistan", "Germany", "France"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Payment */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FiCreditCard className="text-yellow-400" /> Payment Method
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {(["cod", "card"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition text-sm font-medium ${
                        paymentMethod === method
                          ? "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                          : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      {method === "cod" ? <FiTruck size={20} /> : <FiCreditCard size={20} />}
                      {method === "cod" ? "Cash on Delivery" : "Credit / Debit Card"}
                    </button>
                  ))}
                </div>
                {paymentMethod === "card" && (
                  <div className="space-y-3 pt-1">
                    <input placeholder="Card Number" className={inputClass} disabled />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="MM / YY" className={inputClass} disabled />
                      <input placeholder="CVC" className={inputClass} disabled />
                    </div>
                    <p className="text-xs text-gray-600">Card payment integration coming soon.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right — Summary */}
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-white">Order Summary</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                        <Image src={item.image || "/placeholder.jpg"} alt={item.title} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{item.title}</p>
                        <p className="text-gray-500 text-xs">x{item.quantity}</p>
                      </div>
                      <p className="text-white text-xs font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-800 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span><span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-400" : "text-white"}>
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-white text-base pt-1 border-t border-gray-800">
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-gray-900 font-bold py-3.5 rounded-xl transition text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                  ) : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
