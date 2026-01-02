import React from "react";

interface VIPBadgeProps {
  label?: string;
}

const VIPBadge: React.FC<VIPBadgeProps> = ({ label = "VIP" }) => {
  return (
    <span className="bg-yellow-500 text-gray-900 font-bold px-2 py-1 rounded-full text-xs">
      {label}
    </span>
  );
};

export default VIPBadge;
