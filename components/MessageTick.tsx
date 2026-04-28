"use client";

type TickStatus = "sent" | "delivered" | "seen";

interface MessageTickProps {
  status: TickStatus;
}

export default function MessageTick({ status }: MessageTickProps) {
  // Single grey tick — saved to DB, not yet delivered
  if (status === "sent") {
    return (
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="inline-block shrink-0">
        <path d="M1 5L4.5 8.5L11 1.5" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Double grey tick — recipient opened the thread
  if (status === "delivered") {
    return (
      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" className="inline-block shrink-0">
        <path d="M1 5L4.5 8.5L11 1.5"  stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 5L8.5 8.5L15 1.5"  stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Double blue tick — recipient read the message
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" className="inline-block shrink-0">
      <path d="M1 5L4.5 8.5L11 1.5"  stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5L8.5 8.5L15 1.5"  stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}