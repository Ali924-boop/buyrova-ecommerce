"use client";
import React, { useEffect, useState } from "react";
import { FiSearch, FiShield, FiTrash2, FiUser } from "react-icons/fi";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => { setUsers(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (user: User) => {
    setActionLoading(user._id);
    const newRole = user.role === "admin" ? "user" : "admin";
    await fetch(`/api/admin/users/${user._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    fetchUsers();
    setActionLoading(null);
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setActionLoading(id);
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    fetchUsers();
    setActionLoading(null);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} registered users</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide bg-gray-800/60">
                  <th className="text-left px-6 py-3">User</th>
                  <th className="text-left px-6 py-3">Email</th>
                  <th className="text-left px-6 py-3">Role</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.length ? filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                          <FiUser className="text-yellow-400 text-xs" />
                        </div>
                        <span className="font-medium text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${user.role === "admin" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-gray-800 text-gray-400 border-gray-700"}`}>
                        {user.role === "admin" ? "Admin" : "Customer"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRole(user)}
                          disabled={actionLoading === user._id}
                          className="inline-flex items-center gap-1.5 text-xs border border-blue-500/30 text-blue-400 hover:border-blue-500/60 hover:text-blue-300 rounded-lg px-3 py-1.5 transition disabled:opacity-40"
                        >
                          <FiShield size={12} />
                          {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          disabled={actionLoading === user._id}
                          className="inline-flex items-center gap-1.5 text-xs border border-red-500/30 text-red-400 hover:border-red-500/60 hover:text-red-300 rounded-lg px-3 py-1.5 transition disabled:opacity-40"
                        >
                          <FiTrash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-600">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
