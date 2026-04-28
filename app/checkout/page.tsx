"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser, FiMail, FiMapPin, FiCreditCard,
  FiArrowLeft, FiTruck, FiCheckCircle, FiCopy,
  FiCamera, FiX, FiZap,
} from "react-icons/fi";

interface CartItemType {
  _id: string; title: string; price: number;
  quantity: number; image: string;
}

type PaymentMethod = "cod" | "jazzcash" | "easypaisa" | "card";

const JAZZCASH_NUMBER  = "0302-0178286";
const EASYPAISA_NUMBER = "0302-0178286";
const ACCOUNT_NAME     = "Muhammad Ali Raza";

// ── BarcodeDetector types ─────────────────────────────────────────────────────
interface BarcodeDetectorResult { rawValue: string; }
interface BarcodeDetectorInstance {
  detect(source: HTMLVideoElement): Promise<BarcodeDetectorResult[]>;
}
interface WindowWithBarcodeDetector extends Window {
  BarcodeDetector: new (o: { formats: string[] }) => BarcodeDetectorInstance;
}

// ── Payment methods (outside component to avoid re-creation on every render) ──
const METHODS: {
  id:     PaymentMethod;
  label:  string;
  emoji:  string;
  color:  string;
  border: string;
  bg:     string;
}[] = [
  { id: "cod",       label: "Cash on Delivery", emoji: "🚚", color: "text-yellow-400", border: "border-yellow-500/60", bg: "bg-yellow-500/10" },
  { id: "jazzcash",  label: "JazzCash",         emoji: "🔴", color: "text-red-400",    border: "border-red-500/60",    bg: "bg-red-500/10"    },
  { id: "easypaisa", label: "EasyPaisa",        emoji: "🟢", color: "text-green-400",  border: "border-green-500/60",  bg: "bg-green-500/10"  },
  { id: "card",      label: "Debit / Credit",   emoji: "💳", color: "text-blue-400",   border: "border-blue-500/60",   bg: "bg-blue-500/10"   },
];

// ── Brand logos ───────────────────────────────────────────────────────────────
const JazzCashLogo = () => (
  <svg viewBox="0 0 80 28" fill="none" className="h-7 w-auto">
    <rect width="80" height="28" rx="6" fill="#C8102E"/>
    <text x="8" y="20" fontFamily="Arial Black, sans-serif"
      fontWeight="900" fontSize="14" fill="white">Jazz</text>
    <text x="40" y="20" fontFamily="Arial Black, sans-serif"
      fontWeight="900" fontSize="14" fill="#FFD700">Cash</text>
  </svg>
);

const EasypaisaLogo = () => (
  <svg viewBox="0 0 90 28" fill="none" className="h-7 w-auto">
    <rect width="90" height="28" rx="6" fill="#4CAF50"/>
    <circle cx="14" cy="14" r="8" fill="white"/>
    <text x="8" y="19" fontFamily="Arial Black, sans-serif"
      fontWeight="900" fontSize="11" fill="#4CAF50">e</text>
    <text x="26" y="20" fontFamily="Arial Black, sans-serif"
      fontWeight="900" fontSize="12" fill="white">easypaisa</text>
  </svg>
);

// ── QR Scanner ────────────────────────────────────────────────────────────────
function QRScanner({ onClose, onScan }: {
  onClose: () => void;
  onScan:  (data: string) => void;
}) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // FIX 8: track mounted state so we never call setState after unmount
  const mountedRef = useRef(true);
  const [error,    setError]    = useState("");
  const [scanning, setScanning] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (mountedRef.current) setScanning(false);
  }, []);

  const startCamera = useCallback(async (): Promise<MediaStream | null> => {
    if (mountedRef.current) setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return stream;
    } catch {
      return null;
    }
  }, []);

  // FIX 8: use mountedRef guard so setState is never called after unmount
  useEffect(() => {
    mountedRef.current = true;

    startCamera().then((stream) => {
      if (!mountedRef.current) return; // component already unmounted — bail out
      if (stream) {
        setScanning(true);
      } else {
        setError("Camera access denied. Please allow camera permission and try again.");
      }
    });

    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // BarcodeDetector scan loop
  useEffect(() => {
    if (!scanning || !videoRef.current) return;
    if (!("BarcodeDetector" in window)) return;

    const win = window as unknown as WindowWithBarcodeDetector;
    const detector = new win.BarcodeDetector({ formats: ["qr_code"] });
    let active = true;

    const scan = async () => {
      if (!active || !videoRef.current) return;
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes.length > 0) {
          onScan(codes[0].rawValue);
          stopCamera();
          onClose();
          return;
        }
      } catch { /* continue scanning */ }
      if (active) requestAnimationFrame(scan);
    };

    videoRef.current.addEventListener("playing", () => scan(), { once: true });
    return () => { active = false; };
  }, [scanning, onScan, stopCamera, onClose]);

  // FIX 3: retry guard also respects mountedRef
  const handleRetry = () => {
    startCamera().then((stream) => {
      if (!mountedRef.current) return;
      if (stream) setScanning(true);
      else setError("Camera access denied. Please allow camera permission and try again.");
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiCamera className="text-yellow-400" size={18} />
            <p className="text-white font-semibold">Scan QR Code</p>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition">
            <FiX size={15} />
          </button>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-square">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <FiCamera size={32} className="text-gray-600" />
              <p className="text-gray-400 text-sm">{error}</p>
              <button onClick={handleRetry}
                className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg text-sm font-bold">
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video ref={videoRef} muted playsInline
                className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {[
                    "top-0 left-0 border-t-2 border-l-2",
                    "top-0 right-0 border-t-2 border-r-2",
                    "bottom-0 left-0 border-b-2 border-l-2",
                    "bottom-0 right-0 border-b-2 border-r-2",
                  ].map((cls, i) => (
                    <div key={`corner-${i}`}
                      className={`absolute w-8 h-8 border-yellow-400 rounded-sm ${cls}`} />
                  ))}
                  <motion.div
                    className="absolute left-1 right-1 h-0.5 bg-yellow-400/70"
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-gray-500 text-xs text-center mt-3">
          Point your camera at the merchant&apos;s QR code
        </p>

        {scanning && !("BarcodeDetector" in window) && (
          <div className="mt-3 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3">
            <p className="text-amber-400 text-xs text-center">
              Auto-detection not supported on this browser.
              Use your JazzCash / EasyPaisa app to scan instead.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Scan Panel ────────────────────────────────────────────────────────────────
// FIX 2: Split accentBg into separate bgClass + borderClass props so both
// Tailwind classes are applied correctly and independently.
function ScanPanel({
  qrSrc, number, label, color, bgClass, borderClass, logo, total, onOpenScanner,
}: {
  qrSrc:         string;
  number:        string;
  label:         string;
  color:         string;
  bgClass:       string;  // e.g. "bg-red-500/10"
  borderClass:   string;  // e.g. "border-red-500/25"
  logo:          React.ReactNode;
  total:         number;
  onOpenScanner: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // FIX 5: Round total so Rs amounts never show decimals
  const displayTotal = Math.round(total).toLocaleString();

  const steps = [
    `Open your ${label} app`,
    "Tap 'Send Money' or scan the QR code above",
    `Send Rs. ${displayTotal} to ${number}`,
    "Place your order — we'll verify & confirm within 24h",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      {/* Header banner */}
      <div className={`${bgClass} border ${borderClass} rounded-xl px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          {logo}
          <div>
            <p className="text-white text-xs font-semibold">Send payment via {label}</p>
            <p className="text-gray-400 text-[11px]">Scan QR or send to number below</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* QR code */}
        <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-3">
          <div className="relative w-36 h-36">
            <Image
              src={qrSrc}
              alt={`${label} QR`}
              fill
              className="object-contain"
              sizes="144px"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://api.qrserver.com/v1/create-qr-code/?size=144x144&data=${encodeURIComponent(number)}&bgcolor=ffffff&color=000000&margin=4`;
              }}
            />
          </div>
          <p className="text-gray-500 text-[10px] text-center font-medium">
            Scan with {label} app
          </p>
        </div>

        {/* Number + amount + scanner */}
        <div className="flex flex-col gap-3">
          <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 flex-1">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
              {label} Number
            </p>
            <p className="text-white font-mono font-bold text-base">{number}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{ACCOUNT_NAME}</p>
            <button onClick={copy}
              className="mt-2 flex items-center gap-1.5 text-[11px] px-3 py-1.5
                rounded-lg border border-gray-600 text-gray-400
                hover:text-white hover:border-gray-500 transition">
              {copied
                ? <><FiCheckCircle size={10} className="text-green-400" /> Copied!</>
                : <><FiCopy size={10} /> Copy Number</>
              }
            </button>
          </div>

          <div className={`${bgClass} border ${borderClass} rounded-xl px-4 py-3`}>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
              Amount to Send
            </p>
            <p className={`${color} font-bold text-lg`}>Rs. {displayTotal}</p>
          </div>

          <button type="button" onClick={onOpenScanner}
            className={`flex items-center justify-center gap-2 px-4 py-3
              rounded-xl border ${borderClass} font-semibold text-sm transition
              ${bgClass} ${color} hover:opacity-80`}>
            <FiCamera size={15} /> Open Scanner
          </button>
        </div>
      </div>

      {/* How-to steps */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-3">
          How to pay
        </p>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={`step-${i}-${label}`} className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full ${bgClass} border ${borderClass}
                flex items-center justify-center shrink-0 mt-0.5`}>
                <span className={`text-[10px] font-bold ${color}`}>{i + 1}</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main CheckoutPage ─────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();

  const [cart,          setCart]          = useState<CartItemType[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [showScanner,   setShowScanner]   = useState(false);
  // FIX 3: scannedData clears when payment method changes
  const [scannedData,   setScannedData]   = useState<string | null>(null);
  const [cardForm,      setCardForm]      = useState({ number: "", expiry: "", cvc: "", holder: "" });
  const [form,          setForm]          = useState({
    name: "", email: "", address: "", city: "", zip: "", country: "Pakistan",
  });

  // FIX 7: SSR-safe localStorage read
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored);
  }, []);

  // FIX 3: clear scanned QR data when payment method switches
  const handleSetPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setScannedData(null);
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  // FIX 5: round total so Pakistani Rupee amounts are always whole numbers
  const total    = Math.round(subtotal + shipping);
  const active   = METHODS.find((m) => m.id === paymentMethod)!;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    let value = e.target.value;
    if (name === "number") value = value.replace(/\D/g, "").slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    if (name === "expiry") {
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (name === "cvc") value = value.replace(/\D/g, "").slice(0, 3);
    setCardForm({ ...cardForm, [name]: value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (paymentMethod === "card" &&
      (!cardForm.number || !cardForm.expiry || !cardForm.cvc || !cardForm.holder)) {
      alert("Please fill in all card details.");
      return;
    }

    setLoading(true);
    try {
      // FIX 4: only include card data when the payment method is actually card
      // FIX 6: include scannedData (QR transaction reference) in payload
      const payload: Record<string, unknown> = {
        ...form,
        paymentMethod,
        products: cart.map((i) => ({ product: i._id, quantity: i.quantity })),
        total,
        ...(scannedData ? { qrReference: scannedData } : {}),
        ...(paymentMethod === "card" ? { cardHolder: cardForm.holder } : {}),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("storage"));
        router.push(`/checkout/success?orderId=${data._id ?? ""}`);
      } else {
        const err = await res.json();
        alert(err?.error || "Failed to place order.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full bg-gray-800 border border-gray-700 text-white
    placeholder-gray-500 text-sm rounded-xl px-4 py-3
    focus:outline-none focus:border-yellow-500 transition`;

  return (
    <>
      <AnimatePresence>
        {showScanner && (
          <QRScanner
            onClose={() => setShowScanner(false)}
            onScan={(data) => { setScannedData(data); setShowScanner(false); }}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gray-950 px-4 sm:px-6 py-10">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center gap-3 mb-8">
            <button onClick={() => router.back()}
              className="text-gray-500 hover:text-white transition">
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Checkout</h1>
              <p className="text-gray-400 text-sm">Complete your order details</p>
            </div>
          </div>

          <form onSubmit={handlePlaceOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── LEFT ─────────────────────────────────────────────── */}
              <div className="lg:col-span-2 space-y-5">

                {/* Contact */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FiUser className="text-yellow-400" /> Contact Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                      <input name="name" value={form.name} onChange={handleChange}
                        placeholder="Full Name" required className={inputClass + " pl-10"} />
                    </div>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                      <input name="email" type="email" value={form.email} onChange={handleChange}
                        placeholder="Email Address" required className={inputClass + " pl-10"} />
                    </div>
                  </div>
                </div>

                {/* Shipping */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FiMapPin className="text-yellow-400" /> Shipping Address
                  </h2>
                  <input name="address" value={form.address} onChange={handleChange}
                    placeholder="Street Address" required className={inputClass} />
                  <div className="grid grid-cols-2 gap-3">
                    <input name="city" value={form.city} onChange={handleChange}
                      placeholder="City" required className={inputClass} />
                    <input name="zip" value={form.zip} onChange={handleChange}
                      placeholder="ZIP / Postal Code" required className={inputClass} />
                  </div>
                  <select name="country" value={form.country} onChange={handleChange}
                    className={inputClass}>
                    {["Pakistan","United States","United Kingdom",
                      "Canada","Australia","Germany","France"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Payment */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FiCreditCard className="text-yellow-400" /> Payment Method
                  </h2>

                  {/* FIX 3: use handleSetPaymentMethod so scannedData clears on switch */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {METHODS.map((m) => (
                      <button key={m.id} type="button"
                        onClick={() => handleSetPaymentMethod(m.id)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl
                          border transition text-xs font-semibold
                          ${paymentMethod === m.id
                            ? `${m.border} ${m.bg} ${m.color}`
                            : "border-gray-700 bg-gray-800/50 text-gray-500 hover:border-gray-600"
                          }`}>
                        <span className="text-xl">{m.emoji}</span>
                        <span className="text-center leading-tight">{m.label}</span>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {paymentMethod === "cod" && (
                      <motion.div key="cod"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}
                        className="bg-yellow-500/10 border border-yellow-500/25
                          rounded-2xl px-5 py-4 flex items-start gap-3">
                        <FiTruck size={20} className="text-yellow-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-yellow-400 font-semibold text-sm">Cash on Delivery</p>
                          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                            Pay with cash when your order arrives. No advance payment required.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* FIX 2: bgClass + borderClass passed as separate props */}
                    {paymentMethod === "jazzcash" && (
                      <motion.div key="jazzcash"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}>
                        <ScanPanel
                          qrSrc="/qr/jazzcash.png" number={JAZZCASH_NUMBER}
                          label="JazzCash" color="text-red-400"
                          bgClass="bg-red-500/10" borderClass="border-red-500/25"
                          logo={<JazzCashLogo />} total={total}
                          onOpenScanner={() => setShowScanner(true)} />
                      </motion.div>
                    )}

                    {paymentMethod === "easypaisa" && (
                      <motion.div key="easypaisa"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}>
                        <ScanPanel
                          qrSrc="/qr/easypaisa.png" number={EASYPAISA_NUMBER}
                          label="EasyPaisa" color="text-green-400"
                          bgClass="bg-green-500/10" borderClass="border-green-500/25"
                          logo={<EasypaisaLogo />} total={total}
                          onOpenScanner={() => setShowScanner(true)} />
                      </motion.div>
                    )}

                    {paymentMethod === "card" && (
                      <motion.div key="card"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}
                        className="space-y-3">
                        {/* Card preview */}
                        <div className="relative h-44 rounded-2xl overflow-hidden
                          bg-gradient-to-br from-blue-900 via-gray-800 to-gray-900
                          border border-blue-800/40 p-5 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <p className="text-white font-bold text-sm tracking-widest">BUYROVA</p>
                            <div className="flex gap-1">
                              <div className="w-7 h-7 rounded-full bg-red-500/80" />
                              <div className="w-7 h-7 rounded-full bg-yellow-400/80 -ml-3" />
                            </div>
                          </div>
                          <div className="w-10 h-7 bg-yellow-400/80 rounded-md
                            grid grid-cols-2 gap-0.5 p-1">
                            {Array(4).fill(0).map((_, i) => (
                              <div key={`chip-${i}`} className="bg-yellow-600/60 rounded-sm" />
                            ))}
                          </div>
                          <div>
                            <p className="text-gray-200 font-mono text-base tracking-widest">
                              {cardForm.number || "•••• •••• •••• ••••"}
                            </p>
                            <div className="flex justify-between mt-1.5">
                              <p className="text-gray-400 text-xs uppercase tracking-wider">
                                {cardForm.holder || "Card Holder"}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {cardForm.expiry || "MM/YY"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <input name="holder" value={cardForm.holder}
                          onChange={handleCardChange} placeholder="Card Holder Name"
                          required={paymentMethod === "card"} className={inputClass} />
                        <input name="number" value={cardForm.number}
                          onChange={handleCardChange} placeholder="Card Number"
                          maxLength={19} required={paymentMethod === "card"}
                          className={inputClass + " font-mono tracking-widest"} />
                        <div className="grid grid-cols-2 gap-3">
                          <input name="expiry" value={cardForm.expiry}
                            onChange={handleCardChange} placeholder="MM/YY"
                            maxLength={5} required={paymentMethod === "card"}
                            className={inputClass} />
                          <input name="cvc" value={cardForm.cvc}
                            onChange={handleCardChange} placeholder="CVC"
                            maxLength={3} required={paymentMethod === "card"}
                            className={inputClass} />
                        </div>
                        <p className="text-[11px] text-gray-600">
                          🔒 Your card details are encrypted and secure
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* FIX 6: scannedData shown only for QR payment methods */}
                  {scannedData && (paymentMethod === "jazzcash" || paymentMethod === "easypaisa") && (
                    <div className="bg-green-500/10 border border-green-500/25
                      rounded-xl px-4 py-3 flex items-center gap-2">
                      <FiCheckCircle className="text-green-400 shrink-0" size={14} />
                      <div>
                        <p className="text-green-400 text-xs font-semibold">QR Scanned Successfully</p>
                        <p className="text-gray-500 text-[11px] font-mono mt-0.5 break-all">
                          {scannedData}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT ────────────────────────────────────────────── */}
              <div className="space-y-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                  <h2 className="text-sm font-semibold text-white">Order Summary</h2>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item._id} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg
                          overflow-hidden bg-gray-800 flex-shrink-0">
                          <Image src={item.image || "/placeholder.jpg"}
                            alt={item.title} fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{item.title}</p>
                          <p className="text-gray-500 text-xs">x{item.quantity}</p>
                        </div>
                        <p className="text-white text-xs font-semibold shrink-0">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-800 pt-3 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span className="text-white">Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? "text-green-400" : "text-white"}>
                        {shipping === 0 ? "FREE" : `Rs. ${Math.round(shipping)}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-white
                      text-base pt-1 border-t border-gray-800">
                      <span>Total</span>
                      <span>Rs. {total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className={`${active.bg} border ${active.border}
                    rounded-xl px-4 py-2.5 flex items-center justify-between`}>
                    <span className="text-gray-400 text-xs">Paying via</span>
                    <span className={`text-xs font-semibold ${active.color}`}>
                      {active.emoji} {active.label}
                    </span>
                  </div>

                  <button type="submit" disabled={loading || cart.length === 0}
                    className="w-full bg-yellow-500 hover:bg-yellow-400
                      disabled:opacity-50 disabled:cursor-not-allowed
                      text-gray-900 font-bold py-3.5 rounded-xl transition
                      text-sm flex items-center justify-center gap-2">
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-gray-900/30
                        border-t-gray-900 rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiZap size={14} />
                        {paymentMethod === "cod"       && "Place Order (COD)"}
                        {paymentMethod === "jazzcash"  && "Confirm JazzCash Order"}
                        {paymentMethod === "easypaisa" && "Confirm EasyPaisa Order"}
                        {paymentMethod === "card"      && "Pay & Place Order"}
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-gray-600 text-center">
                    By placing your order you agree to our terms &amp; conditions
                  </p>
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}