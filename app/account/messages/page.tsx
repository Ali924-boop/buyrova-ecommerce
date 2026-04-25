"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiSend,
  FiChevronLeft,
  FiPackage,
  FiHeadphones,
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiMessageSquare,
} from "react-icons/fi";

/* ─── Types ─────────────────────────────────────────── */
interface Message {
  id: string;
  text: string;
  from: "user" | "support";
  time: string;
  read: boolean;
}

interface Thread {
  id: string;
  subject: string;
  preview: string;
  time: string;
  unread: number;
  icon: "order" | "support" | "alert";
  messages: Message[];
}

/* ─── Static seed threads ────────────────────────────── */
// In production swap these for real API calls to /api/admin/messages
const SEED_THREADS: Thread[] = [
  {
    id: "t1",
    subject: "Order shipped — track your package",
    preview: "Your order is on its way! Expected delivery Friday.",
    time: "10:32 AM",
    unread: 1,
    icon: "order",
    messages: [
      { id: "m1", text: "Hi! Your order has been dispatched and is on its way.", from: "support", time: "10:28 AM", read: true },
      { id: "m2", text: "You can track your package using the link in your confirmation email.", from: "support", time: "10:30 AM", read: true },
      { id: "m3", text: "Your order is on its way! Expected delivery Friday.", from: "support", time: "10:32 AM", read: false },
    ],
  },
  {
    id: "t2",
    subject: "Return request approved",
    preview: "We've approved your return. Refund in 3–5 days.",
    time: "Yesterday",
    unread: 0,
    icon: "support",
    messages: [
      { id: "m4", text: "Hello, I'd like to return the item I ordered — it doesn't fit well.", from: "user", time: "Yesterday 2:10 PM", read: true },
      { id: "m5", text: "No problem! We've approved your return. Please pack the item and drop it at any courier.", from: "support", time: "Yesterday 3:45 PM", read: true },
      { id: "m6", text: "Your refund will be processed within 3–5 business days.", from: "support", time: "Yesterday 3:46 PM", read: true },
    ],
  },
  {
    id: "t3",
    subject: "Payment issue — action needed",
    preview: "Please update your card to complete your order.",
    time: "Apr 22",
    unread: 0,
    icon: "alert",
    messages: [
      { id: "m7", text: "We noticed your recent payment attempt failed.", from: "support", time: "Apr 22 9:00 AM", read: true },
      { id: "m8", text: "Please update your billing details so we can complete your order.", from: "support", time: "Apr 22 9:01 AM", read: true },
    ],
  },
];

/* ─── Icon per thread type ───────────────────────────── */
const ThreadIcon = ({ type }: { type: Thread["icon"] }) => {
  const cfg = {
    order:   { icon: <FiPackage size={15} />,     bg: "bg-blue-50",   text: "text-blue-600" },
    support: { icon: <FiHeadphones size={15} />,  bg: "bg-green-50",  text: "text-green-600" },
    alert:   { icon: <FiAlertCircle size={15} />, bg: "bg-red-50",    text: "text-red-500" },
  }[type];
  return (
    <div className={`w-10 h-10 rounded-full ${cfg.bg} ${cfg.text} flex items-center justify-center flex-shrink-0`}>
      {cfg.icon}
    </div>
  );
};

/* ─── Page ───────────────────────────────────────────── */
export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>(SEED_THREADS);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Sync unread count to localStorage so Navbar badge updates live
  useEffect(() => {
    const total = threads.reduce((s, t) => s + t.unread, 0);
    localStorage.setItem("unreadMessages", String(total));
    window.dispatchEvent(new Event("storage"));
  }, [threads]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length, typing]);

  const openThread = (thread: Thread) => {
    const updated = threads.map((t) =>
      t.id === thread.id
        ? { ...t, unread: 0, messages: t.messages.map((m) => ({ ...m, read: true })) }
        : t
    );
    setThreads(updated);
    setActiveThread(updated.find((t) => t.id === thread.id) || null);
    setMobileView("chat");
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeThread) return;

    const text = input.trim();
    setInput("");

    const newMsg: Message = {
      id: `m${Date.now()}`,
      text,
      from: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: true,
    };

    // Optimistic update
    const updatedThread: Thread = {
      ...activeThread,
      messages: [...activeThread.messages, newMsg],
      preview: text,
      time: "Just now",
    };
    setThreads((prev) => prev.map((t) => (t.id === activeThread.id ? updatedThread : t)));
    setActiveThread(updatedThread);

    // Post to /api/contact (your existing route)
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: activeThread.subject,
          message: text,
          threadId: activeThread.id,
        }),
      });
    } catch {
      // Silently fail — message still shows optimistically
    }

    // Simulate support reply
    setTyping(true);
    setTimeout(() => {
      const reply: Message = {
        id: `m${Date.now() + 1}`,
        text: "Thanks for reaching out! Our support team will get back to you within a few hours.",
        from: "support",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      };
      setActiveThread((prev) => {
        if (!prev) return prev;
        const withReply = { ...prev, messages: [...prev.messages, reply] };
        setThreads((ts) => ts.map((t) => (t.id === prev.id ? withReply : t)));
        return withReply;
      });
      setTyping(false);
    }, 1800);
  };

  const filtered = threads.filter(
    (t) =>
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <p className="text-sm text-gray-400">
          <Link href="/" className="hover:text-yellow-500 transition">Home</Link>
          {" / "}
          <Link href="/account/profile" className="hover:text-yellow-500 transition">Account</Link>
          {" / "}
          <span className="text-gray-700 font-medium">Messages</span>
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex" style={{ height: 620 }}>

          {/* ── Thread list ── */}
          <div className={`w-full md:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-base font-bold text-gray-900">Messages</h2>
                {totalUnread > 0 && (
                  <span className="text-xs bg-yellow-500 text-white rounded-full px-2 py-0.5 font-bold leading-none">
                    {totalUnread}
                  </span>
                )}
              </div>
              <div className="relative">
                <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                />
              </div>
            </div>

            {/* Thread rows */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                  <FiSearch size={26} />
                  <p className="text-sm">No results</p>
                </div>
              ) : (
                filtered.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => openThread(thread)}
                    className={`w-full text-left px-5 py-4 border-b border-gray-50 flex items-start gap-3 hover:bg-yellow-50 transition-all ${
                      activeThread?.id === thread.id ? "bg-yellow-50 border-l-4 border-l-yellow-500" : ""
                    }`}
                  >
                    <ThreadIcon type={thread.icon} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className={`text-sm truncate pr-2 ${thread.unread > 0 ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                          {thread.subject}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0">{thread.time}</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{thread.preview}</p>
                    </div>
                    {thread.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-yellow-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {thread.unread}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Chat pane ── */}
          <div className={`flex-1 flex flex-col min-w-0 ${mobileView === "list" ? "hidden md:flex" : "flex"}`}>
            {activeThread ? (
              <>
                {/* Chat header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                  <button onClick={() => setMobileView("list")} className="md:hidden text-gray-500 hover:text-yellow-500 transition">
                    <FiChevronLeft size={22} />
                  </button>
                  <ThreadIcon type={activeThread.icon} />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{activeThread.subject}</p>
                    <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                      <FiCheckCircle size={11} /> Support team active
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {activeThread.messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.16 }}
                        className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            msg.from === "user"
                              ? "bg-yellow-500 text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-800 rounded-bl-sm"
                          }`}
                        >
                          {msg.text}
                          <div className={`flex items-center gap-1 mt-1 ${msg.from === "user" ? "justify-end text-yellow-200" : "text-gray-400"}`}>
                            <span className="text-[10px]">{msg.time}</span>
                            {msg.from === "user" && <FiCheck size={10} />}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  {typing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div ref={bottomRef} />
                </div>

                {/* Input bar */}
                <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3 flex-shrink-0">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm transition focus:bg-white"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="w-10 h-10 rounded-xl bg-yellow-500 text-white flex items-center justify-center hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm flex-shrink-0"
                  >
                    <FiSend size={15} />
                  </button>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-300">
                <FiMessageSquare size={38} />
                <p className="text-sm font-medium text-gray-400">Select a conversation</p>
                <p className="text-xs text-gray-300 text-center max-w-48">
                  Your messages with BuyRova support appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}