"use client";
import React from "react";

interface CartItemProps {
  title: string;
  price: number;
  quantity: number;
  image: string;
}

const CartItem: React.FC<CartItemProps> = ({ title, price, quantity, image }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow mb-4">
      <img src={image} alt={title} className="w-24 h-24 object-cover rounded"/>
      <div className="flex-1">
        <h4 className="text-gray-900 font-semibold">{title}</h4>
        <p className="text-gray-700">${price} x {quantity}</p>
      </div>
      <button className="text-red-500 font-bold">Remove</button>
    </div>
  );
};

export default CartItem;
