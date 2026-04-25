"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiShield,
  FiTrash2,
  FiUser,
  FiArrowLeft,
} from "react-icons/fi";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

    await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });

    fetchUsers();
    setActionLoading(null);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-gray-900 dark:text-white">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <FiArrowLeft />
        </button>

        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {users.length} registered users
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition"
        />
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No users found
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">

          {/* ================= TABLE ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">

                {filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">

                    {/* USER */}
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20">
                        <FiUser className="text-yellow-500" />
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </td>

                    {/* EMAIL */}
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {user.email}
                    </td>

                    {/* ROLE */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full border ${
                          user.role === "admin"
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 flex gap-2">

                      <button
                        onClick={() => toggleRole(user)}
                        disabled={actionLoading === user._id}
                        className="text-xs px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition disabled:opacity-40"
                      >
                        <FiShield className="inline mr-1" />
                        {user.role === "admin" ? "Remove" : "Make"}
                      </button>

                      <button
                        onClick={() => deleteUser(user._id)}
                        disabled={actionLoading === user._id}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition disabled:opacity-40"
                      >
                        <FiTrash2 className="inline mr-1" />
                        Delete
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          {/* ================= MOBILE ================= */}
          <div className="md:hidden p-4 space-y-3">

            {filtered.map((user) => (
              <div
                key={user._id}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-2"
              >

                <div className="flex justify-between items-center">
                  <p className="font-semibold">{user.name}</p>
                  <span className="text-xs text-gray-500">{user.role}</span>
                </div>

                <p className="text-sm text-gray-500">{user.email}</p>

                <div className="flex gap-2 pt-2">

                  <button
                    onClick={() => toggleRole(user)}
                    className="text-xs px-3 py-1 rounded border border-blue-500 text-blue-500"
                  >
                    Role
                  </button>

                  <button
                    onClick={() => deleteUser(user._id)}
                    className="text-xs px-3 py-1 rounded border border-red-500 text-red-500"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>

        </div>
      )}
    </div>
  );
}