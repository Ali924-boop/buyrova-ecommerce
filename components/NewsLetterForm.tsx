"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiArrowRight, FiCheck } from "react-icons/fi";

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000)); // Simulate API call
    setLoading(false);
    setSuccess(true);
    setEmail("");
  };

  return (
    <section className="bg-gradient-to-r from-gray-900 mb-10 via-gray-800 to-gray-900 border-y border-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl mb-4">
            <FiMail className="text-yellow-400 text-xl" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Stay in the Loop</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm">
            Subscribe for exclusive deals, new arrivals, and style inspiration straight to your inbox.
          </p>

          {success ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-3 rounded-full text-sm font-semibold"
            >
              <FiCheck /> You&apos;re subscribed — thank you!
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-yellow-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-gray-900 font-bold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  <><FiArrowRight /> Subscribe</>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterForm;
