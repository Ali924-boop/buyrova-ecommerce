"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiUser,
  FiLock,
  FiBell,
  FiShield,
  FiTrash2,
  FiChevronRight,
  FiCheck,
  FiUpload,
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
} from "react-icons/fi";

interface UserData {
  name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
}

type Section = "profile" | "password" | "notifications" | "privacy" | "danger";

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 ${
      checked ? "bg-yellow-500" : "bg-gray-200"
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [userData, setUserData] = useState<UserData>({});
  const [saved, setSaved] = useState(false);

  // Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Password
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({
    orderUpdates: true,
    promotions: false,
    newArrivals: true,
    accountAlerts: true,
    smsAlerts: false,
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    shareData: false,
    personalisedAds: true,
  });

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUserData(parsed);
        setName(parsed.name || "");
        setEmail(parsed.email || "");
        setPhone(parsed.phone || "");
      } catch {}
    }
  }, []);

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const handleSaveProfile = () => {
    const updated = { ...userData, name, email, phone };
    localStorage.setItem("user", JSON.stringify(updated));
    setUserData(updated);
    window.dispatchEvent(new Event("storage"));
    flash();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      const updated = { ...userData, avatar: url };
      localStorage.setItem("user", JSON.stringify(updated));
      setUserData(updated);
      window.dispatchEvent(new Event("storage"));
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm === "DELETE") {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const initials = userData.name
    ? userData.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const nav: { id: Section; label: string; icon: React.ReactNode; danger?: boolean }[] = [
    { id: "profile", label: "Profile", icon: <FiUser size={16} /> },
    { id: "password", label: "Password", icon: <FiLock size={16} /> },
    { id: "notifications", label: "Notifications", icon: <FiBell size={16} /> },
    { id: "privacy", label: "Privacy", icon: <FiShield size={16} /> },
    { id: "danger", label: "Danger Zone", icon: <FiTrash2 size={16} />, danger: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <p className="text-sm text-gray-400">
          <Link href="/" className="hover:text-yellow-500 transition">Home</Link>
          {" / "}
          <Link href="/account/profile" className="hover:text-yellow-500 transition">Account</Link>
          {" / "}
          <span className="text-gray-700 font-medium">Settings</span>
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">

        {/* ── Sidebar ── */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* User card */}
            <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="relative">
                {userData.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={userData.avatar} alt="avatar" className="w-11 h-11 rounded-full object-cover ring-2 ring-yellow-400" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-yellow-500 ring-2 ring-yellow-400 flex items-center justify-center text-white font-bold text-sm select-none">
                    {initials}
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{userData.name || "User"}</p>
                <p className="text-xs text-gray-400 truncate">{userData.email}</p>
              </div>
            </div>

            <nav className="py-2">
              {nav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all ${
                    item.danger
                      ? activeSection === item.id
                        ? "bg-red-50 text-red-500 border-r-4 border-red-400"
                        : "text-red-400 hover:bg-red-50 hover:text-red-500"
                      : activeSection === item.id
                      ? "bg-yellow-50 text-yellow-600 border-r-4 border-yellow-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  {activeSection === item.id && !item.danger && (
                    <FiChevronRight size={13} className="text-yellow-400" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Main ── */}
        <motion.main
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-w-0"
        >

          {/* ── PROFILE ── */}
          {activeSection === "profile" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Information</h2>

              {/* Avatar */}
              <div className="flex items-center gap-5 mb-8">
                <div className="relative">
                  {userData.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={userData.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover ring-4 ring-yellow-200" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-yellow-500 ring-4 ring-yellow-200 flex items-center justify-center text-white font-bold text-xl select-none">
                      {initials}
                    </div>
                  )}
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center cursor-pointer hover:bg-yellow-500 transition shadow">
                    <FiUpload size={13} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{userData.name || "User"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or GIF · max 5 MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: "Full name", value: name, set: setName, type: "text", placeholder: "Your name" },
                  { label: "Email", value: email, set: setEmail, type: "email", placeholder: "you@email.com" },
                  { label: "Phone", value: phone, set: setPhone, type: "tel", placeholder: "+92 300 0000000" },
                ].map(({ label, value, set, type, placeholder }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm transition bg-gray-50 focus:bg-white"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-7 flex items-center gap-3">
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2.5 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition text-sm shadow-sm"
                >
                  Save changes
                </button>
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1.5 text-sm text-green-600 font-medium"
                  >
                    <FiCheck size={14} /> Saved!
                  </motion.span>
                )}
              </div>
            </div>
          )}

          {/* ── PASSWORD ── */}
          {activeSection === "password" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Change Password</h2>
              <p className="text-sm text-gray-400 mb-7">Use a strong password you don't use anywhere else.</p>

              <div className="flex flex-col gap-5 max-w-md">
                {[
                  { label: "Current password", value: currentPass, set: setCurrentPass, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                  { label: "New password", value: newPass, set: setNewPass, show: showNew, toggle: () => setShowNew(!showNew) },
                  { label: "Confirm new password", value: confirmPass, set: setConfirmPass, show: showNew, toggle: () => setShowNew(!showNew) },
                ].map(({ label, value, set, show, toggle }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                    <div className="relative">
                      <input
                        type={show ? "text" : "password"}
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm transition bg-gray-50 focus:bg-white"
                      />
                      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}

                {newPass && confirmPass && newPass !== confirmPass && (
                  <p className="text-xs text-red-500 font-medium -mt-2">Passwords don't match.</p>
                )}

                {/* Strength bar */}
                {newPass && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">
                      Strength:{" "}
                      <span className={newPass.length >= 12 ? "text-green-600 font-semibold" : newPass.length >= 8 ? "text-yellow-600 font-semibold" : "text-red-500 font-semibold"}>
                        {newPass.length >= 12 ? "Strong" : newPass.length >= 8 ? "Medium" : "Weak"}
                      </span>
                    </p>
                    <div className="flex gap-1.5">
                      {[3, 6, 9, 12].map((threshold) => (
                        <div
                          key={threshold}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            newPass.length >= threshold
                              ? newPass.length >= 12 ? "bg-green-500" : "bg-yellow-400"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <button
                  disabled={!currentPass || !newPass || newPass !== confirmPass}
                  className="px-6 py-2.5 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm shadow-sm w-fit"
                >
                  Update password
                </button>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeSection === "notifications" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Notification Preferences</h2>
              <p className="text-sm text-gray-400 mb-7">Choose what you hear from us and how.</p>

              <div className="divide-y divide-gray-100">
                {(
                  [
                    { key: "orderUpdates", title: "Order updates", desc: "Shipping, delivery and order confirmations" },
                    { key: "promotions", title: "Promotions & deals", desc: "Sales, coupons and exclusive offers" },
                    { key: "newArrivals", title: "New arrivals", desc: "Latest products in categories you follow" },
                    { key: "accountAlerts", title: "Account alerts", desc: "Login activity and password changes" },
                    { key: "smsAlerts", title: "SMS alerts", desc: "Text messages for urgent updates" },
                  ] as { key: keyof typeof notifs; title: string; desc: string }[]
                ).map(({ key, title, desc }) => (
                  <div key={key} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <Toggle checked={notifs[key]} onChange={() => setNotifs((p) => ({ ...p, [key]: !p[key] }))} />
                  </div>
                ))}
              </div>

              <button
                onClick={flash}
                className="mt-6 px-6 py-2.5 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition text-sm shadow-sm flex items-center gap-2"
              >
                {saved ? <><FiCheck size={14} /> Saved!</> : "Save preferences"}
              </button>
            </div>
          )}

          {/* ── PRIVACY ── */}
          {activeSection === "privacy" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Privacy Settings</h2>
              <p className="text-sm text-gray-400 mb-7">Control how your data is used and who can see you.</p>

              <div className="divide-y divide-gray-100">
                {(
                  [
                    { key: "publicProfile", title: "Public profile", desc: "Let others see your reviews and wishlist" },
                    { key: "shareData", title: "Share usage data", desc: "Help us improve with anonymous analytics" },
                    { key: "personalisedAds", title: "Personalised ads", desc: "See ads based on your shopping behaviour" },
                  ] as { key: keyof typeof privacy; title: string; desc: string }[]
                ).map(({ key, title, desc }) => (
                  <div key={key} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <Toggle checked={privacy[key]} onChange={() => setPrivacy((p) => ({ ...p, [key]: !p[key] }))} />
                  </div>
                ))}
              </div>

              <div className="mt-5 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-500">
                  You can request a full export of your data or ask us to delete it permanently.{" "}
                  <Link href="/account/messages" className="text-yellow-600 hover:underline">Contact support →</Link>
                </p>
              </div>

              <button
                onClick={flash}
                className="mt-5 px-6 py-2.5 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition text-sm shadow-sm flex items-center gap-2"
              >
                {saved ? <><FiCheck size={14} /> Saved!</> : "Save privacy settings"}
              </button>
            </div>
          )}

          {/* ── DANGER ZONE ── */}
          {activeSection === "danger" && (
            <div className="space-y-5">
              {/* Sign out all */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Sign out everywhere</h3>
                <p className="text-xs text-gray-400 mb-4">Log out of all active sessions on all your devices.</p>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition text-sm"
                >
                  Sign out all devices
                </button>
              </div>

              {/* Delete account */}
              <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
                <div className="flex items-start gap-3 mb-5">
                  <FiAlertTriangle size={19} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-red-600 mb-1">Delete account</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Permanently deletes your account, orders, saved addresses, and all data. This cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Type <span className="text-red-500 font-bold">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm transition"
                  />
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== "DELETE"}
                  className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
                >
                  Permanently delete account
                </button>
              </div>
            </div>
          )}
        </motion.main>
      </div>
    </div>
  );
}