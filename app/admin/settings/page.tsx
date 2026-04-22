"use client";
import React, { useEffect, useState } from "react";
import { FiSave, FiSettings, FiAlertCircle, FiCheckCircle, FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import {
  MdStorefront,
  MdEmail,
  MdAttachMoney,
  MdLocalShipping,
  MdPercent,
  MdBuildCircle,
} from "react-icons/md";

const DEFAULT_SETTINGS = {
  siteName: "BuyRova",
  contactEmail: "support@buyrova.com",
  currency: "USD",
  maintenanceMode: "false",
  freeShippingThreshold: "100",
  taxRate: "0",
};

type SettingsMap = Record<string, string>;
type SaveStatus = "idle" | "saving" | "saved" | "error";

const fieldIcons: Record<string, React.ReactNode> = {
  siteName: <MdStorefront className="text-yellow-400" />,
  contactEmail: <MdEmail className="text-blue-400" />,
  currency: <MdAttachMoney className="text-green-400" />,
  freeShippingThreshold: <MdLocalShipping className="text-purple-400" />,
  taxRate: <MdPercent className="text-orange-400" />,
  maintenanceMode: <MdBuildCircle className="text-red-400" />,
};

const fields: {
  key: keyof typeof DEFAULT_SETTINGS;
  label: string;
  description: string;
  type?: "text" | "email" | "number" | "select";
  options?: { value: string; label: string }[];
}[] = [
  {
    key: "siteName",
    label: "Site Name",
    description: "The public name of your store",
  },
  {
    key: "contactEmail",
    label: "Contact Email",
    description: "Primary support email address",
    type: "email",
  },
  {
    key: "currency",
    label: "Currency",
    description: "Default currency for product pricing",
    type: "select",
    options: [
      { value: "USD", label: "🇺🇸 USD — US Dollar" },
      { value: "EUR", label: "🇪🇺 EUR — Euro" },
      { value: "GBP", label: "🇬🇧 GBP — British Pound" },
      { value: "PKR", label: "🇵🇰 PKR — Pakistani Rupee" },
    ],
  },
  {
    key: "freeShippingThreshold",
    label: "Free Shipping Threshold",
    description: "Minimum order amount to qualify for free shipping",
    type: "number",
  },
  {
    key: "taxRate",
    label: "Tax Rate (%)",
    description: "Applied tax percentage on all orders",
    type: "number",
  },
  {
    key: "maintenanceMode",
    label: "Maintenance Mode",
    description: "Temporarily disable the storefront for visitors",
    type: "select",
    options: [
      { value: "false", label: "✅ Off — Store is live" },
      { value: "true", label: "🔧 On — Store is under maintenance" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>(DEFAULT_SETTINGS);
  const [original, setOriginal] = useState<SettingsMap>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(original);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        const merged = { ...DEFAULT_SETTINGS, ...d };
        setSettings(merged);
        setOriginal(merged);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaveStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      setOriginal(settings);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setErrorMsg("Failed to save settings. Please try again.");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  const reset = () => {
    setSettings(original);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

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
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <FiSettings className="text-yellow-400 text-lg" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Site Settings</h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Manage your store configuration</p>
            </div>
          </div>

          {/* Unsaved changes badge */}
          {hasChanges && (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-full animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              Unsaved changes
            </div>
          )}
        </div>

        {/* Status messages */}
        {saveStatus === "saved" && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-xl">
            <FiCheckCircle className="shrink-0" />
            Settings saved successfully!
          </div>
        )}
        {saveStatus === "error" && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            <FiAlertCircle className="shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading settings...</p>
          </div>
        ) : (
          <>
            {/* Settings grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(({ key, label, description, type = "text", options }) => (
                <div
                  key={key}
                  className={`bg-gray-900 border rounded-xl p-4 sm:p-5 transition-all duration-200 ${
                    settings[key] !== original[key]
                      ? "border-yellow-500/40 shadow-lg shadow-yellow-500/5"
                      : "border-gray-800 hover:border-gray-700"
                  } ${key === "siteName" || key === "contactEmail" ? "md:col-span-2" : ""}`}
                >
                  {/* Field header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                      {fieldIcons[key]}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white">
                        {label}
                      </label>
                      <p className="text-gray-500 text-xs mt-0.5">{description}</p>
                    </div>
                    {/* Changed indicator */}
                    {settings[key] !== original[key] && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-yellow-400 mt-1 shrink-0" />
                    )}
                  </div>

                  {/* Input */}
                  {type === "select" ? (
                    <select
                      value={settings[key]}
                      onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition cursor-pointer"
                    >
                      {options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type}
                      value={settings[key]}
                      onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 transition"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={save}
                disabled={saveStatus === "saving" || !hasChanges}
                className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-bold px-6 py-2.5 rounded-xl transition-all duration-200 text-sm"
              >
                {saveStatus === "saving" ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Saving...
                  </>
                ) : saveStatus === "saved" ? (
                  <>
                    <FiCheckCircle />
                    Saved!
                  </>
                ) : (
                  <>
                    <FiSave />
                    Save Settings
                  </>
                )}
              </button>

              {hasChanges && (
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 font-medium px-6 py-2.5 rounded-xl transition-all duration-200 text-sm"
                >
                  <FiRefreshCw className="text-sm" />
                  Reset Changes
                </button>
              )}

              <p className="sm:ml-auto text-gray-600 text-xs text-center sm:text-right">
                {hasChanges
                  ? "You have unsaved changes"
                  : "All changes saved"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}