"use client";
import React from "react";
import Image from "next/image";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";

interface CartItemProps {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  slug?: string;
  onQuantityChange: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  _id, title, price, quantity, image, onQuantityChange, onRemove,
}) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition group">
      {/* Image */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
        <Image src={image || "/placeholder.jpg"} alt={title} fill className="object-cover" sizes="80px" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-semibold text-sm truncate">{title}</h4>
        <p className="text-yellow-400 font-bold text-base mt-0.5">${price.toLocaleString()}</p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onQuantityChange(_id, -1)}
            className="w-7 h-7 flex items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-gray-400 hover:text-white transition"
          >
            <FiMinus size={12} />
          </button>
          <span className="w-6 text-center text-white text-sm font-semibold">{quantity}</span>
          <button
            onClick={() => onQuantityChange(_id, 1)}
            className="w-7 h-7 flex items-center justify-center bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-gray-400 hover:text-white transition"
          >
            <FiPlus size={12} />
          </button>
        </div>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <p className="text-white font-bold text-sm">${(price * quantity).toLocaleString()}</p>
        <button
          onClick={() => onRemove(_id)}
          className="text-gray-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
          aria-label="Remove item"
        >
          <FiTrash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
