"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  FiMail, FiTrash2, FiChevronDown, FiChevronUp,
  FiInbox, FiArrowLeft, FiRefreshCw, FiSend,
  FiPackage, FiHeadphones, FiAlertCircle, FiUser,
} from "react-icons/fi";
import { MdMarkEmailRead, MdMarkEmailUnread } from "react-icons/md";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Thread {
  _id: string;
  userId: string;
  subject: string;
  icon: "order" | "support" | "alert";
  preview: string;
  unread: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  _id: string;
  threadId: string;
  text: string;
  from: "user" | "support";
  userId: string;
  read: boolean;
  status: "sent" | "delivered" | "seen";
  createdAt: string;
}

type FilterType = "all" | "unread" | "read";

// ─── Icon config ──────────────────────────────────────────────────────────────

const ICON_CFG = {
  order:   { icon: <FiPackage size={14} />,     bg: "bg-blue-50 dark:bg-blue-900/30",       text: "text-blue-500" },
  support: { icon: <FiHeadphones size={14} />,  bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-500" },
  alert:   { icon: <FiAlertCircle size={14} />, bg: "bg-red-50 dark:bg-red-900/30",         text: "text-red-500" },
};

const avatarGradients = [
  "from-yellow-400 to-orange-500",
  "from-blue-400 to-indigo-600",
  "from-emerald-400 to-teal-600",
  "from-violet-400 to-pink-600",
  "from-rose-400 to-red-600",
  "from-cyan-400 to-sky-600",
];
const nameGradient = (str: string) =>
  avatarGradients[str.charCodeAt(0) % avatarGradients.length];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const hours = (now.getTime() - date.getTime()) / 3600000;
  if (hours < 24) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (hours < 48) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminMessagesPage() {
  const [threads, setThreads]       = useState<Thread[]>([]);
  const [messages, setMessages]     = useState<Record<string, Message[]>>({});
  const [loadingMsgs, setLoadingMsgs] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [filter, setFilter]         = useState<FilterType>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [replyText, setReplyText]   = useState<Record<string, string>>({});
  const [sending, setSending]       = useState<string | null>(null);
  const [error, setError]           = useState<Record<string, string>>({});
  const router = useRouter();
  const bottomRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ── Fetch all threads ──────────────────────────────────────────────────────
  const fetchThreads = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/admin/messages");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setThreads(Array.isArray(data.threads) ? data.threads : []);
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  // ── Fetch messages for a thread (always fresh) ─────────────────────────────
  const fetchMessages = useCallback(async (threadId: string) => {
    setLoadingMsgs((prev) => ({ ...prev, [threadId]: true }));
    try {
      const res = await fetch(`/api/admin/messages/${threadId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages((prev) => ({ ...prev, [threadId]: data.messages ?? [] }));
      // Mark thread as read locally
      setThreads((prev) =>
        prev.map((t) => t._id === threadId ? { ...t, unread: 0 } : t)
      );
    } catch {
      setError((prev) => ({ ...prev, [threadId]: "Failed to load messages." }));
    } finally {
      setLoadingMsgs((prev) => ({ ...prev, [threadId]: false }));
    }
  }, []);

  // ── Toggle expand — always re-fetch on open ────────────────────────────────
  const toggleExpand = useCallback(async (thread: Thread) => {
    if (expanded === thread._id) {
      setExpanded(null);
      return;
    }
    setExpanded(thread._id);
    await fetchMessages(thread._id);
    setTimeout(() => {
      bottomRefs.current[thread._id]?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }, [expanded, fetchMessages]);

  // ── Mark thread read/unread ────────────────────────────────────────────────
  const toggleRead = useCallback(async (thread: Thread, e: React.MouseEvent) => {
    e.stopPropagation();
    const markAsRead = thread.unread > 0;
    setThreads((prev) =>
      prev.map((t) =>
        t._id === thread._id ? { ...t, unread: markAsRead ? 0 : 1 } : t
      )
    );
    await fetch(`/api/admin/messages/${thread._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: markAsRead }),
    });
  }, []);

  // ── Mark all read ──────────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    const unread = threads.filter((t) => t.unread > 0);
    setThreads((prev) => prev.map((t) => ({ ...t, unread: 0 })));
    await Promise.all(
      unread.map((t) =>
        fetch(`/api/admin/messages/${t._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        })
      )
    );
  }, [threads]);

  // ── Delete thread ──────────────────────────────────────────────────────────
  const deleteThread = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      setThreads((prev) => prev.filter((t) => t._id !== id));
      if (expanded === id) setExpanded(null);
    } catch {
      fetchThreads(true);
    } finally {
      setDeletingId(null);
    }
  }, [expanded, fetchThreads]);

  // ── Admin reply ────────────────────────────────────────────────────────────
  const sendReply = useCallback(async (threadId: string) => {
    const text = replyText[threadId]?.trim();
    if (!text || sending === threadId) return;
    setSending(threadId);
    setError((prev) => ({ ...prev, [threadId]: "" }));

    try {
      const res = await fetch(`/api/admin/messages/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      setMessages((prev) => ({
        ...prev,
        [threadId]: [...(prev[threadId] ?? []), data.message],
      }));
      setThreads((prev) =>
        prev.map((t) =>
          t._id === threadId
            ? { ...t, preview: text, updatedAt: new Date().toISOString() }
            : t
        )
      );
      setReplyText((prev) => ({ ...prev, [threadId]: "" }));
      setTimeout(() => {
        bottomRefs.current[threadId]?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setError((prev) => ({ ...prev, [threadId]: "Failed to send reply. Try again." }));
    } finally {
      setSending(null);
    }
  }, [replyText, sending]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const unreadCount = threads.filter((t) => t.unread > 0).length;
  const filtered = threads.filter((t) => {
    if (filter === "unread") return t.unread > 0;
    if (filter === "read")   return t.unread === 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                bg-white dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700
                text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-150"
            >
              <FiArrowLeft className="text-sm" />
            </button>

            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20">
              <FiMail className="text-yellow-500 dark:text-yellow-400 text-lg" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Messages
                </h1>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5
                    rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {threads.length} conversation{threads.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg
                  text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10
                  border border-blue-200 dark:border-blue-500/25
                  hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all duration-150">
                <MdMarkEmailRead className="text-sm" /> Mark all read
              </button>
            )}
            <button onClick={() => fetchThreads(true)} disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg
                text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800/70
                border border-gray-200 dark:border-gray-700
                hover:border-gray-300 dark:hover:border-gray-600
                hover:text-gray-900 dark:hover:text-white
                transition-all duration-150 disabled:opacity-50">
              <FiRefreshCw className={`text-xs ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── FILTER TABS ── */}
        <div className="flex gap-1 p-1 rounded-xl w-fit
          bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 shadow-sm">
          {(["all", "unread", "read"] as FilterType[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 capitalize ${
                filter === f
                  ? "bg-yellow-500 text-gray-900 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}>
              {f}
              {f === "unread" && unreadCount > 0 && (
                <span className={`ml-1.5 text-xs ${filter === f ? "text-gray-800" : "text-gray-400"}`}>
                  ({unreadCount})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-400 dark:text-gray-500">Loading messages…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 rounded-2xl
            bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800">
            <FiInbox className="text-5xl text-gray-200 dark:text-gray-700" />
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
              {filter === "all" ? "No messages yet" : `No ${filter} messages`}
            </p>
            {filter !== "all" && (
              <button onClick={() => setFilter("all")}
                className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors">
                View all messages
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((thread) => {
              const isUnread    = thread.unread > 0;
              const isExpanded  = expanded === thread._id;
              const threadMsgs  = messages[thread._id] ?? [];
              const isLoadingMs = loadingMsgs[thread._id];
              const threadError = error[thread._id];
              const cfg         = ICON_CFG[thread.icon] ?? ICON_CFG.support;

              return (
                <div key={thread._id}
                  className={`rounded-2xl overflow-hidden transition-all duration-200
                    bg-white dark:bg-gray-900/80
                    ${deletingId === thread._id ? "opacity-40 scale-[0.98] pointer-events-none" : ""}
                    ${isUnread
                      ? "border border-yellow-300 dark:border-yellow-500/30 shadow-sm shadow-yellow-500/5"
                      : "border border-gray-100 dark:border-gray-800"
                    }`}
                >
                  {/* ── THREAD ROW ── */}
                  <div
                    className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 cursor-pointer
                      hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors duration-150"
                    onClick={() => toggleExpand(thread)}
                  >
                    {/* Unread dot */}
                    <div className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                      isUnread ? "bg-yellow-500" : "bg-transparent"
                    }`} />

                    {/* Thread icon */}
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} ${cfg.text}
                      flex items-center justify-center shrink-0`}>
                      {cfg.icon}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${
                          isUnread
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-600 dark:text-gray-400"
                        }`}>
                          {thread.subject}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize
                          ${cfg.bg} ${cfg.text} font-medium hidden sm:inline-flex`}>
                          {thread.icon}
                        </span>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${
                        isUnread
                          ? "text-gray-700 dark:text-gray-300 font-medium"
                          : "text-gray-400 dark:text-gray-600"
                      }`}>
                        {thread.preview}
                      </p>
                      {/* User ID pill */}
                      <p className="text-[10px] text-gray-300 dark:text-gray-700 truncate mt-0.5 font-mono">
                        uid: {thread.userId}
                      </p>
                    </div>

                    {/* Date + unread badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-gray-400 dark:text-gray-600 whitespace-nowrap">
                        {formatDate(thread.updatedAt)}
                      </span>
                      {isUnread && (
                        <span className="w-5 h-5 rounded-full bg-yellow-500 text-white
                          text-[9px] font-bold flex items-center justify-center">
                          {thread.unread}
                        </span>
                      )}
                    </div>

                    {isExpanded
                      ? <FiChevronUp className="text-gray-300 dark:text-gray-600 shrink-0 text-sm" />
                      : <FiChevronDown className="text-gray-300 dark:text-gray-600 shrink-0 text-sm" />
                    }
                  </div>

                  {/* ── EXPANDED ── */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-800
                      bg-gray-50/60 dark:bg-gray-800/20">

                      {/* Message bubbles */}
                      <div className="px-4 sm:px-5 py-4 space-y-3 max-h-72 overflow-y-auto">
                        {isLoadingMs ? (
                          <div className="flex justify-center py-6">
                            <div className="w-5 h-5 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                          </div>
                        ) : threadError ? (
                          <p className="text-xs text-center text-red-400 py-4">{threadError}</p>
                        ) : threadMsgs.length === 0 ? (
                          <p className="text-xs text-center text-gray-400 dark:text-gray-600 py-4">
                            No messages in this thread.
                          </p>
                        ) : (
                          threadMsgs.map((msg) => {
                            const isSupport = msg.from === "support";
                            return (
                              <div key={msg._id}
                                className={`flex ${isSupport ? "justify-end" : "justify-start"}`}>
                                {!isSupport && (
                                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br
                                    ${nameGradient(thread.userId)}
                                    flex items-center justify-center text-white text-[10px]
                                    font-bold shrink-0 mr-2 mt-auto`}>
                                    <FiUser size={10} />
                                  </div>
                                )}
                                <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                  isSupport
                                    ? "bg-yellow-500 text-white rounded-br-sm"
                                    : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-100 dark:border-gray-800 shadow-sm"
                                }`}>
                                  {msg.text}
                                  <div className={`text-[9px] mt-1 ${
                                    isSupport ? "text-yellow-200/80 text-right" : "text-gray-400"
                                  }`}>
                                    {formatDate(msg.createdAt)}
                                    {isSupport && ` · ${msg.status}`}
                                  </div>
                                </div>
                                {isSupport && (
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500
                                    flex items-center justify-center text-white text-[10px]
                                    font-bold shrink-0 ml-2 mt-auto">
                                    A
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                        <div ref={(el) => { bottomRefs.current[thread._id] = el; }} />
                      </div>

                      {/* Reply box */}
                      <div className="px-4 sm:px-5 pb-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                        <input
                          type="text"
                          value={replyText[thread._id] ?? ""}
                          onChange={(e) =>
                            setReplyText((prev) => ({ ...prev, [thread._id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === "Enter" && sendReply(thread._id)}
                          placeholder="Reply to this conversation…"
                          className="flex-1 px-4 py-2.5 rounded-xl text-sm
                            bg-white dark:bg-gray-900
                            border border-gray-200 dark:border-gray-700
                            text-gray-800 dark:text-gray-200
                            placeholder:text-gray-400 dark:placeholder:text-gray-600
                            outline-none focus:ring-2 focus:ring-yellow-400
                            transition-all duration-150"
                        />
                        <button
                          onClick={() => sendReply(thread._id)}
                          disabled={!replyText[thread._id]?.trim() || sending === thread._id}
                          className="w-10 h-10 rounded-xl bg-yellow-500 hover:bg-yellow-600
                            text-white flex items-center justify-center
                            disabled:opacity-40 disabled:cursor-not-allowed
                            transition-all duration-150 shrink-0"
                        >
                          {sending === thread._id
                            ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <FiSend size={14} />
                          }
                        </button>
                      </div>

                      {/* Send error */}
                      {error[thread._id] && (
                        <p className="px-4 sm:px-5 pb-2 text-xs text-red-400">{error[thread._id]}</p>
                      )}

                      {/* Action buttons */}
                      <div className="px-4 sm:px-5 pb-4 pt-2 flex flex-wrap gap-2">
                        <button
                          onClick={(e) => toggleRead(thread, e)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                            text-blue-600 dark:text-blue-400
                            bg-blue-50 dark:bg-blue-500/10
                            border border-blue-200 dark:border-blue-500/25
                            hover:bg-blue-100 dark:hover:bg-blue-500/20
                            transition-all duration-150"
                        >
                          {thread.unread === 0
                            ? <><MdMarkEmailUnread size={12} /> Mark Unread</>
                            : <><MdMarkEmailRead size={12} /> Mark Read</>
                          }
                        </button>

                        <button
                          onClick={(e) => deleteThread(thread._id, e)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                            text-red-500 dark:text-red-400
                            bg-red-50 dark:bg-red-500/10
                            border border-red-200 dark:border-red-500/25
                            hover:bg-red-100 dark:hover:bg-red-500/20
                            transition-all duration-150"
                        >
                          <FiTrash2 size={11} /> Delete conversation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}