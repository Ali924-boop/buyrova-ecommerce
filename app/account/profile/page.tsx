"use client";
import React from "react";
import Link from "next/link";

const dummyOrders = [
  { _id: "1", title: "Luxury Sofa", date: "2025-12-01", total: 499 },
  { _id: "2", title: "Modern Chair", date: "2025-12-05", total: 398 },
];

const AccountPage: React.FC = () => {
  return (
    <div className="pt-24 px-6 md:px-12 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">My Account</h1>

      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Profile Info</h2>
          <p className="text-gray-700">Name: Ali Raza</p>
          <p className="text-gray-700">Email: alirazasandha5@gmail.com</p>
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Orders</h2>
          <ul className="flex flex-col gap-4">
            {dummyOrders.map((order) => (
              <li
                key={order._id}
                className="flex justify-between bg-gray-50 p-4 rounded-lg"
              >
                <span>{order.title}</span>
                <span>{order.date}</span>
                <span>${order.total}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AccountPage;
