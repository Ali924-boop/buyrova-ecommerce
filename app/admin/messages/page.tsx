"use client";
import React, { useEffect, useState } from "react";
import { FiMail, FiTrash2, FiChevronDown, FiChevronUp, FiInbox } from "react-icons/fi";

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchMessages = () => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((d) => { setMessages(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const toggleRead = async (msg: Message) => {
    await fetch(`/api/admin/messages/${msg._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !msg.read }),
    });
    fetchMessages();
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    fetchMessages();
  };

  const expand = async (msg: Message) => {
    setExpanded(expanded === msg._id ? null : msg._id);
    if (!msg.read) {
      await fetch(`/api/admin/messages/${msg._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      setMessages((prev) => prev.map((m) => m._id === msg._id ? { ...m, read: true } : m));
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          {unreadCount > 0 && (
            <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm">{messages.length} total messages</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col items-center justify-center py-20 gap-3">
          <FiInbox className="text-gray-600 text-5xl" />
          <p className="text-gray-500">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`bg-gray-900 border rounded-xl overflow-hidden transition ${!msg.read ? "border-yellow-500/30" : "border-gray-800"}`}
            >
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-800/40 transition"
                onClick={() => expand(msg)}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${!msg.read ? "bg-yellow-400" : "bg-gray-700"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold text-sm ${!msg.read ? "text-white" : "text-gray-400"}`}>
                      {msg.name}
                    </span>
                    <span className="text-gray-600 text-xs">
                      <FiMail className="inline mr-1" />{msg.email}
                    </span>
                  </div>
                  <p className={`text-sm truncate mt-0.5 ${!msg.read ? "text-gray-300" : "text-gray-500"}`}>
                    {msg.subject}
                  </p>
                </div>
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  {expanded === msg._id ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                </div>
              </div>

              {expanded === msg._id && (
                <div className="border-t border-gray-800 px-5 py-4 bg-gray-800/20">
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">{msg.body}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleRead(msg)}
                      className="text-xs text-blue-400 border border-blue-500/30 hover:border-blue-500/60 rounded-lg px-3 py-1.5 transition"
                    >
                      Mark as {msg.read ? "Unread" : "Read"}
                    </button>
                    <button
                      onClick={() => deleteMessage(msg._id)}
                      className="text-xs text-red-400 border border-red-500/30 hover:border-red-500/60 rounded-lg px-3 py-1.5 transition flex items-center gap-1"
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
  );
}
