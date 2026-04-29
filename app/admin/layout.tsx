// app/admin/layout.tsx
// Shared layout wrapper for all /admin/* pages.
// Keeps a consistent dark background across the entire admin section.

import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117]">
      {children}
    </div>
  );
}