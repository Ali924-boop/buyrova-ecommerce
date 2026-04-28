"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch, FiSend, FiChevronLeft, FiPackage, FiHeadphones,
  FiAlertCircle, FiCheck, FiCheckCircle, FiMessageSquare,
  FiPlus, FiX, FiTrash2, FiMoreVertical, FiRefreshCw, FiWifi, FiWifiOff,
} from "react-icons/fi";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  _id: string;
  text: string;
  from: "user" | "support";
  createdAt: string;
  read: boolean;
  status: "sent" | "delivered" | "seen";
}

interface Thread {
  _id: string;
  subject: string;
  preview: string;
  icon: "order" | "support" | "alert";
  unread: number;
  updatedAt: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────
// All calls go to /api/messages on your Next.js server.
// Auth is handled by getServerSession on the server — no x-user-id needed.

const BASE = "/api/messages";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Icon config ──────────────────────────────────────────────────────────────

const ICON_CFG = {
  order:   { icon: <FiPackage size={14} />,     bg: "bg-blue-100 dark:bg-blue-900/40",       text: "text-blue-600 dark:text-blue-400" },
  support: { icon: <FiHeadphones size={14} />,  bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-600 dark:text-emerald-400" },
  alert:   { icon: <FiAlertCircle size={14} />, bg: "bg-red-100 dark:bg-red-900/40",         text: "text-red-500 dark:text-red-400" },
};

const ThreadIcon = ({ type }: { type: Thread["icon"] }) => {
  const cfg = ICON_CFG[type];
  return (
    <div className={`w-9 h-9 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center flex-shrink-0`}>
      {cfg.icon}
    </div>
  );
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Tick component ───────────────────────────────────────────────────────────

function MessageStatus({ status, read }: { status: Message["status"]; read: boolean }) {
  if (status === "seen" || read) return <FiCheckCircle size={9} className="text-amber-200" />;
  if (status === "delivered")    return <FiCheck size={9} className="opacity-70" />;
  return <FiCheck size={9} className="opacity-40" />;
}

// ─── New Thread Modal ─────────────────────────────────────────────────────────

const NewThreadModal = ({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (subject: string, message: string, icon: Thread["icon"]) => Promise<void>;
}) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [icon, setIcon] = useState<Thread["icon"]>("support");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!subject.trim() || !message.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onCreate(subject.trim(), message.trim(), icon);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to create conversation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-stone-100 dark:border-stone-800 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-stone-900 dark:text-white">New Conversation</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition"><FiX size={18} /></button>
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 block mb-2">Category</label>
          <div className="flex gap-2">
            {(["order", "support", "alert"] as Thread["icon"][]).map((type) => {
              const cfg = ICON_CFG[type];
              const labels = { order: "Order", support: "Support", alert: "Issue" };
              return (
                <button key={type} type="button" onClick={() => setIcon(type)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    icon === type
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                      : "border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-stone-300"
                  }`}
                >
                  <span className={cfg.text}>{cfg.icon}</span>
                  {labels[type]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 block mb-1.5">Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief description of your issue"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-neutral-800 text-stone-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>

        {/* Message */}
        <div className="mb-5">
          <label className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 block mb-1.5">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue in detail..." rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-neutral-800 text-stone-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-amber-400 resize-none transition"
          />
        </div>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-neutral-800 transition">
            Cancel
          </button>
          <button type="button" onClick={submit}
            disabled={!subject.trim() || !message.trim() || loading}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
          >
            {loading ? "Sending…" : "Send Message"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const POLL_INTERVAL = 4000;

export default function MessagesPage() {
  const [threads, setThreads]           = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [searchQuery, setSearchQuery]   = useState("");
  const [input, setInput]               = useState("");
  const [mobileView, setMobileView]     = useState<"list" | "chat">("list");
  const [showNewModal, setShowNewModal] = useState(false);
  const [threadMenu, setThreadMenu]     = useState<string | null>(null);

  const [loadingThreads, setLoadingThreads]   = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending]                 = useState(false);
  const [online, setOnline]                   = useState(true);
  const [error, setError]                     = useState("");

  const pollRef             = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeThreadRef     = useRef<Thread | null>(null);
  const bottomRef           = useRef<HTMLDivElement>(null);
  const inputRef            = useRef<HTMLInputElement>(null);

  useEffect(() => { activeThreadRef.current = activeThread; }, [activeThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ── Fetch thread list ──────────────────────────────────────────────────────
  // GET /api/messages → { threads }
  const fetchThreads = useCallback(async () => {
    try {
      const data = await apiFetch<{ threads: Thread[] }>("");
      setThreads(data.threads);
      const total = data.threads.reduce((s, t) => s + t.unread, 0);
      localStorage.setItem("unreadMessages", String(total));
      window.dispatchEvent(new Event("storage"));
      setOnline(true);
    } catch {
      setOnline(false);
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  // ── Fetch messages for a thread ────────────────────────────────────────────
  // GET /api/messages/:threadId → { thread, messages }
  const fetchMessages = useCallback(async (thread: Thread, silent = false) => {
    try {
      const data = await apiFetch<{ messages: Message[]; thread: Thread }>(
        `/${thread._id}`
      );

      if (silent) {
        // Polling: only append new messages
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));
          const newOnes = data.messages.filter((m) => !existingIds.has(m._id));
          return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
        });
      } else {
        setMessages(data.messages);
      }

      // Always sync thread metadata (unread count, preview)
      setThreads((prev) =>
        prev.map((t) => (t._id === thread._id ? { ...t, ...data.thread } : t))
      );
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, []);

  // ── Polling ────────────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const startPolling = useCallback((thread: Thread) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      const t = activeThreadRef.current;
      if (!t) return;
      await fetchMessages(t, true);
      // Refresh thread list for unread counts
      try {
        const data = await apiFetch<{ threads: Thread[] }>("");
        setThreads(data.threads);
      } catch { /* ignore */ }
    }, POLL_INTERVAL);
  }, [fetchMessages, stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  // ── Open thread ────────────────────────────────────────────────────────────
  const openThread = useCallback(async (thread: Thread) => {
    stopPolling();
    setActiveThread(thread);
    setMessages([]);
    setLoadingMessages(true);
    setMobileView("chat");

    await fetchMessages(thread, false);
    setLoadingMessages(false);
    startPolling(thread);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [fetchMessages, startPolling, stopPolling]);

  // ── Send message ───────────────────────────────────────────────────────────
  // POST /api/messages/reply → { message }
  // Body: { threadId, text }
  const sendMessage = useCallback(async () => {
    if (!input.trim() || !activeThread || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    setError("");

    // Optimistic bubble
    const optimistic: Message = {
      _id: `opt_${Date.now()}`,
      text,
      from: "user",
      createdAt: new Date().toISOString(),
      read: true,
      status: "sent",
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const data = await apiFetch<{ message: Message }>("/reply", {
        method: "POST",
        body: JSON.stringify({ threadId: activeThread._id, text }),
      });

      // Replace optimistic with real message from server
      setMessages((prev) =>
        prev.map((m) => (m._id === optimistic._id ? data.message : m))
      );

      // Update thread preview in sidebar
      setThreads((prev) =>
        prev.map((t) =>
          t._id === activeThread._id
            ? { ...t, preview: text, updatedAt: new Date().toISOString() }
            : t
        )
      );
    } catch (e: any) {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      setError("Failed to send. Please try again.");
      setInput(text);
    } finally {
      setSending(false);
    }
  }, [input, activeThread, sending]);

  // ── Create new thread ──────────────────────────────────────────────────────
  // POST /api/messages → { thread, message }
  // Body: { subject, icon, message }
  const handleCreateThread = useCallback(async (
    subject: string, message: string, icon: Thread["icon"]
  ) => {
    const data = await apiFetch<{ thread: Thread; message: Message }>("", {
      method: "POST",
      body: JSON.stringify({ subject, icon, message }),
    });
    setThreads((prev) => [data.thread, ...prev]);
    await openThread(data.thread);
  }, [openThread]);

  // ── Delete thread ──────────────────────────────────────────────────────────
  // DELETE /api/messages/:threadId
  const deleteThread = useCallback(async (threadId: string) => {
    setThreadMenu(null);
    setThreads((prev) => prev.filter((t) => t._id !== threadId));
    if (activeThread?._id === threadId) {
      stopPolling();
      setActiveThread(null);
      setMessages([]);
      setMobileView("list");
    }
    try {
      await apiFetch(`/${threadId}`, { method: "DELETE" });
    } catch {
      fetchThreads(); // restore on failure
    }
  }, [activeThread, fetchThreads, stopPolling]);

  // ── Mark all read ──────────────────────────────────────────────────────────
  // PATCH /api/messages/read for each unread thread
  const markAllRead = useCallback(async () => {
    const unreadThreads = threads.filter((t) => t.unread > 0);
    setThreads((prev) => prev.map((t) => ({ ...t, unread: 0 })));
    try {
      await Promise.all(
        unreadThreads.map((t) =>
          apiFetch("/read", {
            method: "PATCH",
            body: JSON.stringify({ threadId: t._id }),
          })
        )
      );
    } catch { /* optimistic — ignore */ }
  }, [threads]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = threads.filter(
    (t) =>
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-neutral-950">

      {/* Top bar */}
      <div className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-neutral-900">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-2 text-sm text-stone-400">
          <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/account/profile" className="hover:text-amber-500 transition-colors">Account</Link>
          <span>/</span>
          <span className="text-stone-700 dark:text-stone-200 font-medium">Messages</span>
          {totalUnread > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none">
              {totalUnread}
            </span>
          )}
          <span className={`ml-auto flex items-center gap-1.5 text-xs ${online ? "text-emerald-500" : "text-red-400"}`}>
            {online ? <FiWifi size={12} /> : <FiWifiOff size={12} />}
            {online ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden flex"
          style={{ height: 640 }}
        >

          {/* ── Thread list ─────────────────────────────────────────────────── */}
          <div className={`w-full md:w-72 flex-shrink-0 border-r border-stone-100 dark:border-stone-800 flex flex-col ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
            <div className="px-4 py-3.5 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-stone-900 dark:text-white">Messages</h2>
                  {totalUnread > 0 && (
                    <span className="text-[10px] bg-amber-500 text-white rounded-full px-1.5 py-0.5 font-bold leading-none">
                      {totalUnread}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={fetchThreads} title="Refresh"
                    className="w-7 h-7 rounded-lg hover:bg-stone-100 dark:hover:bg-neutral-800 flex items-center justify-center text-stone-400 hover:text-stone-600 transition">
                    <FiRefreshCw size={12} />
                  </button>
                  {totalUnread > 0 && (
                    <button type="button" onClick={markAllRead} title="Mark all read"
                      className="w-7 h-7 rounded-lg hover:bg-stone-100 dark:hover:bg-neutral-800 flex items-center justify-center text-stone-400 hover:text-amber-500 transition">
                      <FiCheckCircle size={13} />
                    </button>
                  )}
                  <button type="button" onClick={() => setShowNewModal(true)} title="New conversation"
                    className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-white transition shadow-sm">
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>
              <div className="relative">
                <FiSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="text" placeholder="Search…" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 text-xs rounded-lg bg-stone-50 dark:bg-neutral-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-400 transition"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500">
                    <FiX size={11} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingThreads ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-300 dark:text-stone-600 gap-2">
                  <FiSearch size={24} />
                  <p className="text-xs">{searchQuery ? "No results" : "No conversations yet"}</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filtered.map((thread) => (
                    <motion.div key={thread._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}
                      className="relative group">
                      <button type="button" onClick={() => openThread(thread)}
                        className={`w-full text-left px-4 py-3.5 border-b border-stone-50 dark:border-stone-800/50 flex items-start gap-3 transition-all ${
                          activeThread?._id === thread._id
                            ? "bg-amber-50 dark:bg-amber-900/10 border-l-2 border-l-amber-500"
                            : "hover:bg-stone-50 dark:hover:bg-neutral-800/50"
                        }`}>
                        <ThreadIcon type={thread.icon} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <p className={`text-xs truncate pr-2 ${thread.unread > 0 ? "font-bold text-stone-900 dark:text-white" : "font-medium text-stone-600 dark:text-stone-300"}`}>
                              {thread.subject}
                            </p>
                            <span className="text-[10px] text-stone-400 flex-shrink-0">{formatTime(thread.updatedAt)}</span>
                          </div>
                          <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate">{thread.preview}</p>
                        </div>
                        {thread.unread > 0 && (
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {thread.unread}
                          </span>
                        )}
                      </button>

                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); setThreadMenu(threadMenu === thread._id ? null : thread._id); }}
                        className="absolute right-2 top-3 w-6 h-6 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 dark:hover:bg-neutral-700 transition">
                        <FiMoreVertical size={12} />
                      </button>

                      <AnimatePresence>
                        {threadMenu === thread._id && (
                          <motion.div initial={{ opacity: 0, scale: 0.92, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.1 }}
                            className="absolute right-2 top-9 z-20 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-stone-100 dark:border-stone-700 py-1 min-w-40">
                            <button type="button" onClick={() => deleteThread(thread._id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                              <FiTrash2 size={12} /> Delete conversation
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* ── Chat pane ───────────────────────────────────────────────────── */}
          <div
            className={`flex-1 flex flex-col min-w-0 ${mobileView === "list" ? "hidden md:flex" : "flex"}`}
            onClick={() => threadMenu && setThreadMenu(null)}
          >
            {activeThread ? (
              <>
                {/* Chat header */}
                <div className="px-5 py-3.5 border-b border-stone-100 dark:border-stone-800 flex items-center gap-3 flex-shrink-0 bg-white dark:bg-neutral-900">
                  <button type="button" onClick={() => { stopPolling(); setMobileView("list"); }}
                    className="md:hidden text-stone-400 hover:text-amber-500 transition">
                    <FiChevronLeft size={20} />
                  </button>
                  <ThreadIcon type={activeThread.icon} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-stone-900 dark:text-white truncate">{activeThread.subject}</p>
                    <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      Support team active · auto-refreshes every {POLL_INTERVAL / 1000}s
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5 bg-stone-50/50 dark:bg-neutral-950/30">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-stone-300 text-xs">
                      No messages yet
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {messages.map((msg, i) => {
                        const isUser = msg.from === "user";
                        const isOptimistic = msg._id.startsWith("opt_");
                        const sameAuthor = messages[i - 1]?.from === msg.from;

                        return (
                          <motion.div key={msg._id}
                            initial={{ opacity: 0, y: 10, scale: 0.97 }}
                            animate={{ opacity: isOptimistic ? 0.7 : 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.18 }}
                            className={`flex ${isUser ? "justify-end" : "justify-start"} ${sameAuthor ? "mt-0.5" : "mt-1.5"}`}
                          >
                            {!isUser && !sameAuthor && (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mr-2 mt-auto mb-0.5">
                                S
                              </div>
                            )}
                            {!isUser && sameAuthor && <div className="w-7 mr-2 flex-shrink-0" />}

                            <div className={`max-w-[72%] px-3.5 py-2.5 text-sm leading-relaxed ${
                              isUser
                                ? "bg-amber-500 text-white rounded-2xl rounded-br-sm shadow-sm shadow-amber-200 dark:shadow-amber-900/20"
                                : "bg-white dark:bg-neutral-800 text-stone-800 dark:text-stone-200 rounded-2xl rounded-bl-sm shadow-sm border border-stone-100 dark:border-stone-700"
                            }`}>
                              {msg.text}
                              <div className={`flex items-center gap-1 mt-1 ${isUser ? "justify-end" : ""}`}>
                                <span className={`text-[9px] ${isUser ? "text-amber-200/80" : "text-stone-400"}`}>
                                  {formatTime(msg.createdAt)}
                                </span>
                                {isUser && (
                                  <MessageStatus status={msg.status} read={msg.read} />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Error banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mx-4 mb-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-xs text-red-500 flex items-center justify-between">
                      {error}
                      <button type="button" onClick={() => setError("")}><FiX size={12} /></button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input bar */}
                <div className="px-4 py-3.5 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2.5 flex-shrink-0 bg-white dark:bg-neutral-900">
                  <input ref={inputRef} type="text" value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Type a message…"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-neutral-800 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 text-sm outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white dark:focus:bg-neutral-700 transition"
                  />
                  <motion.button type="button" onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm flex-shrink-0">
                    {sending
                      ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <FiSend size={14} />
                    }
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-stone-300 dark:text-stone-600">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-neutral-800 flex items-center justify-center">
                  <FiMessageSquare size={28} className="text-stone-300 dark:text-stone-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-stone-400 dark:text-stone-500">No conversation selected</p>
                  <p className="text-xs text-stone-300 dark:text-stone-600 mt-1 max-w-40">Pick a thread or start a new one</p>
                </div>
                <button type="button" onClick={() => setShowNewModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition shadow-sm">
                  <FiPlus size={14} /> New Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showNewModal && (
          <NewThreadModal onClose={() => setShowNewModal(false)} onCreate={handleCreateThread} />
        )}
      </AnimatePresence>
    </div>
  );
}