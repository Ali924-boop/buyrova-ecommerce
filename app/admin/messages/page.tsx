"use client";
import React, { useEffect, useState } from "react";
import {
  FiMail, FiTrash2, FiChevronDown, FiChevronUp,
  FiInbox, FiArrowLeft, FiRefreshCw, FiExternalLink,
} from "react-icons/fi";
import { MdMarkEmailRead, MdMarkEmailUnread } from "react-icons/md";
import { useRouter } from "next/navigation";

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
}

type FilterType = "all" | "unread" | "read";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const toggleRead = async (msg: Message, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/admin/messages/${msg._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !msg.read }),
    });
    setMessages((prev) =>
      prev.map((m) => m._id === msg._id ? { ...m, read: !msg.read } : m)
    );
  };

  const deleteMessage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this message? This cannot be undone.")) return;
    setDeletingId(id);
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m._id !== id));
    if (expanded === id) setExpanded(null);
    setDeletingId(null);
  };

  const expand = async (msg: Message) => {
    setExpanded(expanded === msg._id ? null : msg._id);
    if (!msg.read) {
      await fetch(`/api/admin/messages/${msg._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      setMessages((prev) =>
        prev.map((m) => m._id === msg._id ? { ...m, read: true } : m)
      );
    }
  };

  const markAllRead = async () => {
    const unread = messages.filter((m) => !m.read);
    await Promise.all(
      unread.map((m) =>
        fetch(`/api/admin/messages/${m._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        })
      )
    );
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    if (hours < 24) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (hours < 48) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 shrink-0"
              title="Go back"
            >
              <FiArrowLeft className="text-sm" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
              <FiMail className="text-yellow-400 text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">Messages</h1>
                {unreadCount > 0 && (
                  <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                {messages.length} total message{messages.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 text-xs text-blue-400 border border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/5 px-3 py-2 rounded-lg transition"
              >
                <MdMarkEmailRead />
                Mark all read
              </button>
            )}
            <button
              onClick={() => fetchMessages(true)}
              disabled={refreshing}
              className="flex items-center gap-2 text-xs text-gray-400 border border-gray-700 hover:border-gray-600 hover:bg-gray-800 px-3 py-2 rounded-lg transition"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
          {(["all", "unread", "read"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize ${
                filter === f
                  ? "bg-yellow-500 text-gray-900"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {f}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 text-xs">({unreadCount})</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading messages...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col items-center justify-center py-24 gap-3">
            <FiInbox className="text-gray-700 text-5xl" />
            <p className="text-gray-500 font-medium">
              {filter === "all" ? "No messages yet" : `No ${filter} messages`}
            </p>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="text-xs text-yellow-400 hover:underline"
              >
                View all messages
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((msg) => (
              <div
                key={msg._id}
                className={`bg-gray-900 border rounded-xl overflow-hidden transition-all duration-200 ${
                  deletingId === msg._id ? "opacity-50 scale-95" : ""
                } ${!msg.read ? "border-yellow-500/30" : "border-gray-800"}`}
              >
                {/* Row */}
                <div
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 cursor-pointer hover:bg-gray-800/40 transition"
                  onClick={() => expand(msg)}
                >
                  {/* Unread dot */}
                  <div className={`w-2 h-2 rounded-full shrink-0 ${!msg.read ? "bg-yellow-400" : "bg-transparent"}`} />

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center shrink-0 text-sm font-bold text-white uppercase">
                    {msg.name.charAt(0)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${!msg.read ? "text-white" : "text-gray-400"}`}>
                        {msg.name}
                      </span>
                      <span className="text-gray-600 text-xs hidden sm:block">{msg.email}</span>
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${!msg.read ? "text-gray-300" : "text-gray-500"}`}>
                      {msg.subject}
                    </p>
                  </div>

                  {/* Date */}
                  <span className="text-xs text-gray-600 whitespace-nowrap shrink-0">
                    {formatDate(msg.createdAt)}
                  </span>

                  {/* Chevron */}
                  {expanded === msg._id
                    ? <FiChevronUp className="text-gray-500 shrink-0" />
                    : <FiChevronDown className="text-gray-500 shrink-0" />
                  }
                </div>

                {/* Expanded body */}
                {expanded === msg._id && (
                  <div className="border-t border-gray-800 px-4 sm:px-5 py-4 bg-gray-800/20 space-y-4">
                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                      <span><span className="text-gray-600">From:</span> {msg.name} &lt;{msg.email}&gt;</span>
                      <span><span className="text-gray-600">Subject:</span> {msg.subject}</span>
                      <span><span className="text-gray-600">Received:</span> {new Date(msg.createdAt).toLocaleString()}</span>
                    </div>

                    {/* Body */}
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-gray-900 rounded-lg p-4 border border-gray-800">
                      {msg.body}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {/* Reply via email client */}
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                        className="flex items-center gap-1.5 text-xs text-yellow-400 border border-yellow-500/30 hover:border-yellow-500/60 hover:bg-yellow-500/5 rounded-lg px-3 py-1.5 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiExternalLink size={11} /> Reply via Email
                      </a>

                      {/* Toggle read */}
                      <button
                        onClick={(e) => toggleRead(msg, e)}
                        className="flex items-center gap-1.5 text-xs text-blue-400 border border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/5 rounded-lg px-3 py-1.5 transition"
                      >
                        {msg.read
                          ? <><MdMarkEmailUnread size={12} /> Mark Unread</>
                          : <><MdMarkEmailRead size={12} /> Mark Read</>
                        }
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => deleteMessage(msg._id, e)}
                        className="flex items-center gap-1.5 text-xs text-red-400 border border-red-500/30 hover:border-red-500/60 hover:bg-red-500/5 rounded-lg px-3 py-1.5 transition"
                      >
                        <FiTrash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
