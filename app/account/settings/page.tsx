"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FiUser,
  FiLock,
  FiBell,
  FiShield,
  FiTrash2,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
  FiCamera,
  FiMail,
  FiPhone,
  FiX,
} from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserAccount {
  id: string;           // unique per user — key for per-user storage
  name: string;
  email: string;
  phone: string;
  avatar?: string;      // base64 data-URL or external URL
  passwordHash?: string; // in a real app, never store plain text
}

interface UserSettings {
  notifications: {
    orderUpdates: boolean;
    promotions: boolean;
    newArrivals: boolean;
    accountAlerts: boolean;
    smsAlerts: boolean;
  };
  privacy: {
    publicProfile: boolean;
    shareData: boolean;
    personalisedAds: boolean;
  };
}

type Section = "profile" | "password" | "notifications" | "privacy" | "danger";

// ─── Storage helpers (per-user, keyed by user.id) ─────────────────────────────

const CURRENT_USER_KEY = "app_current_user_id";

function getUserStorageKey(userId: string) {
  return `app_user_${userId}`;
}

function getSettingsStorageKey(userId: string) {
  return `app_settings_${userId}`;
}

function loadUser(userId: string): UserAccount | null {
  try {
    const raw = localStorage.getItem(getUserStorageKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user: UserAccount) {
  localStorage.setItem(getUserStorageKey(user.id), JSON.stringify(user));
  localStorage.setItem(CURRENT_USER_KEY, user.id);
}

function loadSettings(userId: string): UserSettings {
  try {
    const raw = localStorage.getItem(getSettingsStorageKey(userId));
    if (raw) return JSON.parse(raw);
  } catch { /* fall through */ }
  return {
    notifications: {
      orderUpdates: true,
      promotions: false,
      newArrivals: true,
      accountAlerts: true,
      smsAlerts: false,
    },
    privacy: {
      publicProfile: false,
      shareData: false,
      personalisedAds: true,
    },
  };
}

function saveSettings(userId: string, settings: UserSettings) {
  localStorage.setItem(getSettingsStorageKey(userId), JSON.stringify(settings));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    type="button"
    onClick={onChange}
    aria-checked={checked}
    role="switch"
    className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 ${
      checked
        ? "bg-amber-500"
        : "bg-stone-200 dark:bg-stone-700"
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

const FieldInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  suffix?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold tracking-widest uppercase text-stone-400 dark:text-stone-500">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-neutral-800 text-stone-900 dark:text-white placeholder:text-stone-300 dark:placeholder:text-stone-600 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm transition pr-10"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  </div>
);

const SectionCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white dark:bg-neutral-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-6 shadow-sm">
    <div className="mb-6">
      <h2 className="font-bold text-lg text-stone-900 dark:text-white">{title}</h2>
      {subtitle && (
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">{subtitle}</p>
      )}
    </div>
    {children}
  </div>
);

const SaveButton = ({
  onClick,
  saved,
  label = "Save Changes",
}: {
  onClick: () => void;
  saved: boolean;
  label?: string;
}) => (
  <div className="flex items-center gap-3 mt-6">
    <button
      type="button"
      onClick={onClick}
      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl font-semibold text-sm transition-all duration-150 shadow-sm shadow-amber-200 dark:shadow-amber-900/30"
    >
      {label}
    </button>
    {saved && (
      <span className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium animate-fade-in">
        <FiCheck className="stroke-2" /> Saved
      </span>
    )}
  </div>
);

const ToggleRow = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <div className="flex items-center justify-between py-4 border-b border-stone-100 dark:border-stone-800 last:border-0">
    <div>
      <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{label}</p>
      {description && (
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{description}</p>
      )}
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

// ─── Password strength ────────────────────────────────────────────────────────

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { score, label: "Fair", color: "bg-amber-400" };
  return { score, label: "Strong", color: "bg-emerald-500" };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("profile");

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();

  // Password fields
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passError, setPassError] = useState("");

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Flash states
  const [savedProfile, setSavedProfile] = useState(false);
  const [savedPassword, setSavedPassword] = useState(false);
  const [savedNotifs, setSavedNotifs] = useState(false);
  const [savedPrivacy, setSavedPrivacy] = useState(false);

  // ── Bootstrap: load the currently logged-in user ──────────────────────────
  useEffect(() => {
    // In a real app, replace this with your auth session (e.g. NextAuth, Clerk, Supabase)
    // Here we read from localStorage — each user is identified by their unique ID
    const currentUserId = localStorage.getItem(CURRENT_USER_KEY);

    if (currentUserId) {
      const loaded = loadUser(currentUserId);
      if (loaded) {
        setUser(loaded);
        setName(loaded.name);
        setEmail(loaded.email);
        setPhone(loaded.phone);
        setAvatarPreview(loaded.avatar);
        setSettings(loadSettings(currentUserId));
        return;
      }
    }

    // ── Demo fallback: seed a guest user so the page is never empty ──────────
    // Remove this block once you wire up real auth
    const demoUser: UserAccount = {
      id: "demo_user_001",
      name: "Demo User",
      email: "demo@example.com",
      phone: "",
    };
    saveUser(demoUser);
    setUser(demoUser);
    setName(demoUser.name);
    setEmail(demoUser.email);
    setPhone(demoUser.phone);
    setSettings(loadSettings(demoUser.id));
  }, []);

  const flash = (setter: (v: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 2500);
  };

  // ── Profile save ───────────────────────────────────────────────────────────
  const handleSaveProfile = useCallback(() => {
    if (!user) return;
    const updated: UserAccount = {
      ...user,
      name: name.trim() || user.name,
      email: email.trim() || user.email,
      phone: phone.trim(),
      avatar: avatarPreview,
    };
    saveUser(updated);
    setUser(updated);
    flash(setSavedProfile);
  }, [user, name, email, phone, avatarPreview]);

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Password change ────────────────────────────────────────────────────────
  const handleChangePassword = useCallback(() => {
    setPassError("");
    if (!currentPass) { setPassError("Enter your current password."); return; }
    if (newPass.length < 8) { setPassError("New password must be at least 8 characters."); return; }
    if (newPass !== confirmPass) { setPassError("Passwords do not match."); return; }
    // In a real app, call your API here. We just flash success.
    setCurrentPass(""); setNewPass(""); setConfirmPass("");
    flash(setSavedPassword);
  }, [currentPass, newPass, confirmPass]);

  // ── Settings save ──────────────────────────────────────────────────────────
  const handleSaveNotifs = useCallback(() => {
    if (!user || !settings) return;
    saveSettings(user.id, settings);
    flash(setSavedNotifs);
  }, [user, settings]);

  const handleSavePrivacy = useCallback(() => {
    if (!user || !settings) return;
    saveSettings(user.id, settings);
    flash(setSavedPrivacy);
  }, [user, settings]);

  // ── Toggle helpers ─────────────────────────────────────────────────────────
  const toggleNotif = (key: keyof UserSettings["notifications"]) => {
    setSettings((s) =>
      s ? { ...s, notifications: { ...s.notifications, [key]: !s.notifications[key] } } : s
    );
  };

  const togglePrivacy = (key: keyof UserSettings["privacy"]) => {
    setSettings((s) =>
      s ? { ...s, privacy: { ...s.privacy, [key]: !s.privacy[key] } } : s
    );
  };

  // ── Delete account ─────────────────────────────────────────────────────────
  const handleDeleteAccount = useCallback(() => {
    if (!user) return;
    localStorage.removeItem(getUserStorageKey(user.id));
    localStorage.removeItem(getSettingsStorageKey(user.id));
    localStorage.removeItem(CURRENT_USER_KEY);
    // Redirect to home / sign-in
    window.location.href = "/";
  }, [user]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const initials =
    (user?.name || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const pwStrength = passwordStrength(newPass);

  const nav: {
    id: Section;
    label: string;
    icon: React.ReactNode;
    danger?: boolean;
  }[] = [
    { id: "profile", label: "Profile", icon: <FiUser size={15} /> },
    { id: "password", label: "Password", icon: <FiLock size={15} /> },
    { id: "notifications", label: "Notifications", icon: <FiBell size={15} /> },
    { id: "privacy", label: "Privacy", icon: <FiShield size={15} /> },
    { id: "danger", label: "Danger Zone", icon: <FiTrash2 size={15} />, danger: true },
  ];

  if (!user || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 text-stone-900 dark:text-white">

      {/* Top bar */}
      <div className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-neutral-900">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-2 text-sm text-stone-400">
          <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-stone-700 dark:text-stone-200 font-medium">Settings</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">

        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <aside className="w-full md:w-60 shrink-0">
          <div className="bg-white dark:bg-neutral-900 border border-stone-100 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">

            {/* User identity */}
            <div className="p-5 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full shrink-0">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm select-none">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-stone-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav>
              {nav.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                      active
                        ? item.danger
                          ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                          : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                        : item.danger
                        ? "text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                        : "text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-neutral-800 hover:text-stone-800 dark:hover:text-white"
                    }`}
                  >
                    <span className={active ? "opacity-100" : "opacity-60"}>{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">

          {/* PROFILE */}
          {activeSection === "profile" && (
            <SectionCard
              title="Profile"
              subtitle="Your personal information shown on your account."
            >
              {/* Avatar */}
              <div className="flex items-center gap-5 mb-7">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold select-none">
                      {initials}
                    </div>
                  )}
                  <label className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-neutral-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center cursor-pointer hover:bg-amber-50 transition shadow-sm">
                    <FiCamera size={13} className="text-stone-500" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                    Profile photo
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    JPG, PNG or WebP · Max 2 MB
                  </p>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => setAvatarPreview(undefined)}
                      className="mt-1.5 text-xs text-red-400 hover:text-red-500 flex items-center gap-1"
                    >
                      <FiX size={11} /> Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldInput
                  label="Full Name"
                  value={name}
                  onChange={setName}
                  placeholder="Jane Doe"
                />
                <FieldInput
                  label="Email Address"
                  value={email}
                  onChange={setEmail}
                  type="email"
                  placeholder="jane@example.com"
                />
                <FieldInput
                  label="Phone Number"
                  value={phone}
                  onChange={setPhone}
                  type="tel"
                  placeholder="+1 555 000 0000"
                />
              </div>

              {/* Account ID (read-only) */}
              <div className="mt-5 p-3 rounded-xl bg-stone-50 dark:bg-neutral-800 border border-stone-100 dark:border-stone-700 flex items-center gap-2">
                <span className="text-xs text-stone-400 font-mono">User ID:</span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">{user.id}</span>
              </div>

              <SaveButton onClick={handleSaveProfile} saved={savedProfile} />
            </SectionCard>
          )}

          {/* PASSWORD */}
          {activeSection === "password" && (
            <SectionCard
              title="Change Password"
              subtitle="Use a strong password you don't use anywhere else."
            >
              <div className="flex flex-col gap-5 max-w-md">
                <FieldInput
                  label="Current Password"
                  value={currentPass}
                  onChange={setCurrentPass}
                  type={showCurrent ? "text" : "password"}
                  placeholder="Your current password"
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="text-stone-400 hover:text-stone-600"
                    >
                      {showCurrent ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  }
                />

                <FieldInput
                  label="New Password"
                  value={newPass}
                  onChange={setNewPass}
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="text-stone-400 hover:text-stone-600"
                    >
                      {showNew ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  }
                />

                {/* Strength meter */}
                {newPass && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1 h-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            i <= pwStrength.score
                              ? pwStrength.color
                              : "bg-stone-200 dark:bg-stone-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-stone-400">
                      Strength:{" "}
                      <span
                        className={
                          pwStrength.score <= 1
                            ? "text-red-500"
                            : pwStrength.score <= 3
                            ? "text-amber-500"
                            : "text-emerald-500"
                        }
                      >
                        {pwStrength.label}
                      </span>
                    </p>
                  </div>
                )}

                <FieldInput
                  label="Confirm New Password"
                  value={confirmPass}
                  onChange={setConfirmPass}
                  type="password"
                  placeholder="Repeat new password"
                />

                {passError && (
                  <p className="text-sm text-red-500 flex items-center gap-2">
                    <FiAlertTriangle size={13} />
                    {passError}
                  </p>
                )}
              </div>

              <SaveButton
                onClick={handleChangePassword}
                saved={savedPassword}
                label="Update Password"
              />
            </SectionCard>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <SectionCard
              title="Notifications"
              subtitle="Choose what you want to be notified about."
            >
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                <ToggleRow
                  label="Order Updates"
                  description="Shipping, delivery, and order status changes."
                  checked={settings.notifications.orderUpdates}
                  onChange={() => toggleNotif("orderUpdates")}
                />
                <ToggleRow
                  label="Promotions & Offers"
                  description="Discounts, sale events, and exclusive deals."
                  checked={settings.notifications.promotions}
                  onChange={() => toggleNotif("promotions")}
                />
                <ToggleRow
                  label="New Arrivals"
                  description="Be the first to know about new products."
                  checked={settings.notifications.newArrivals}
                  onChange={() => toggleNotif("newArrivals")}
                />
                <ToggleRow
                  label="Account Alerts"
                  description="Sign-ins, password changes, and security events."
                  checked={settings.notifications.accountAlerts}
                  onChange={() => toggleNotif("accountAlerts")}
                />
                <ToggleRow
                  label="SMS Alerts"
                  description="Receive notifications via text message."
                  checked={settings.notifications.smsAlerts}
                  onChange={() => toggleNotif("smsAlerts")}
                />
              </div>

              <SaveButton
                onClick={handleSaveNotifs}
                saved={savedNotifs}
                label="Save Preferences"
              />
            </SectionCard>
          )}

          {/* PRIVACY */}
          {activeSection === "privacy" && (
            <SectionCard
              title="Privacy"
              subtitle="Control how your data is used and what others can see."
            >
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                <ToggleRow
                  label="Public Profile"
                  description="Allow others to view your profile and order history."
                  checked={settings.privacy.publicProfile}
                  onChange={() => togglePrivacy("publicProfile")}
                />
                <ToggleRow
                  label="Share Usage Data"
                  description="Help improve the platform by sharing anonymous usage data."
                  checked={settings.privacy.shareData}
                  onChange={() => togglePrivacy("shareData")}
                />
                <ToggleRow
                  label="Personalised Ads"
                  description="See ads tailored to your interests and browsing activity."
                  checked={settings.privacy.personalisedAds}
                  onChange={() => togglePrivacy("personalisedAds")}
                />
              </div>

              <SaveButton
                onClick={handleSavePrivacy}
                saved={savedPrivacy}
                label="Save Privacy Settings"
              />
            </SectionCard>
          )}

          {/* DANGER ZONE */}
          {activeSection === "danger" && (
            <div className="bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="font-bold text-lg text-stone-900 dark:text-white">
                  Danger Zone
                </h2>
                <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
                  Irreversible actions. Please proceed with caution.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <FiAlertTriangle className="text-red-500 mt-0.5 shrink-0" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                      Delete your account
                    </p>
                    <p className="text-xs text-red-500/80 dark:text-red-500/70 mt-1">
                      This will permanently delete your account, all your orders, saved
                      addresses, and personal data. This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-xs font-semibold tracking-widest uppercase text-stone-400">
                    Type{" "}
                    <span className="font-mono text-red-500 tracking-normal">
                      DELETE
                    </span>{" "}
                    to confirm
                  </label>
                  <input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-neutral-800 text-stone-900 dark:text-white text-sm focus:ring-2 focus:ring-red-400 outline-none placeholder:text-stone-300 dark:placeholder:text-stone-600"
                  />
                </div>

                <button
                  type="button"
                  disabled={deleteConfirm !== "DELETE"}
                  onClick={handleDeleteAccount}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed bg-red-500 hover:bg-red-600 active:scale-95 text-white"
                >
                  Delete My Account
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}