"use client";
import React, { useEffect, useState } from "react";
import { FiSave, FiSettings } from "react-icons/fi";

const DEFAULT_SETTINGS = {
  siteName: "BuyRova",
  contactEmail: "support@buyrova.com",
  currency: "USD",
  maintenanceMode: "false",
  freeShippingThreshold: "100",
  taxRate: "0",
};

type SettingsMap = Record<string, string>;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings((prev) => ({ ...prev, ...d }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields: { key: keyof typeof DEFAULT_SETTINGS; label: string; type?: "text" | "email" | "number" | "select"; options?: string[] }[] = [
    { key: "siteName", label: "Site Name" },
    { key: "contactEmail", label: "Contact Email", type: "email" },
    { key: "currency", label: "Currency", type: "select", options: ["USD", "EUR", "GBP", "PKR"] },
    { key: "freeShippingThreshold", label: "Free Shipping Threshold ($)", type: "number" },
    { key: "taxRate", label: "Tax Rate (%)", type: "number" },
    { key: "maintenanceMode", label: "Maintenance Mode", type: "select", options: ["false", "true"] },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <FiSettings className="text-yellow-400 text-xl" />
        <div>
          <h1 className="text-2xl font-bold text-white">Site Settings</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your store configuration</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          {fields.map(({ key, label, type = "text", options }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                {label}
              </label>
              {type === "select" ? (
                <select
                  value={settings[key]}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition"
                >
                  {options?.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  value={settings[key]}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 transition"
                />
              )}
            </div>
          ))}

          <div className="pt-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-gray-900 font-bold px-6 py-2.5 rounded-lg transition"
            >
              <FiSave />
              {saving ? "Saving..." : saved ? "Saved ✓" : "Save Settings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
