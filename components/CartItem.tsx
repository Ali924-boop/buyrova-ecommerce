"use client";

import React from "react";
import Image from "next/image";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";

interface CartItemProps {
  _id: string;
  productId?: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
  onQuantityChange: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  _id,
  productId,
  title,
  price,
  quantity,
  image,
  color,
  size,
  onQuantityChange,
  onRemove,
}) => {
  // ✅ Fix: use _id if present, fallback to productId
  const itemId = _id || productId || "";

  return (
    <div className="flex gap-4 p-4 rounded-xl border transition-colors duration-200
      bg-white dark:bg-gray-900
      border-gray-100 dark:border-gray-800">

      {/* Product Image */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden
        bg-gray-100 dark:bg-gray-800">
        {image ? (
          <Image src={image} alt={title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center
            text-gray-300 dark:text-gray-600 text-xs">
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
              {title}
            </p>
            {(color || size) && (
              <div className="flex gap-2 mt-0.5 flex-wrap">
                {color && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {color}
                  </span>
                )}
                {color && size && (
                  <span className="text-xs text-gray-300 dark:text-gray-700">·</span>
                )}
                {size && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Size: {size}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Remove button */}
          <button
            onClick={() => onRemove(itemId)}
            aria-label="Remove item"
            className="flex-shrink-0 p-1.5 rounded-lg transition-colors
              text-gray-400 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400
              hover:bg-red-50 dark:hover:bg-red-950"
          >
            <FiTrash2 size={15} />
          </button>
        </div>

        {/* Price + Qty row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
            Rs {(price * quantity).toLocaleString()}
            {quantity > 1 && (
              <span className="ml-1 font-normal text-xs text-gray-400 dark:text-gray-500">
                (Rs {price.toLocaleString()} each)
              </span>
            )}
          </p>

          {/* Quantity controls */}
          <div className="flex items-center border rounded-lg overflow-hidden
            border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onQuantityChange(itemId, -1)}
              aria-label="Decrease"
              className="w-8 h-8 flex items-center justify-center transition-colors
                bg-white dark:bg-gray-900
                text-gray-600 dark:text-gray-400
                hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FiMinus size={12} />
            </button>
            <span className="w-9 text-center text-sm font-semibold
              text-gray-800 dark:text-gray-100">
              {quantity}
            </span>
            <button
              onClick={() => onQuantityChange(itemId, 1)}
              aria-label="Increase"
              className="w-8 h-8 flex items-center justify-center transition-colors
                bg-white dark:bg-gray-900
                text-gray-600 dark:text-gray-400
                hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FiPlus size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;