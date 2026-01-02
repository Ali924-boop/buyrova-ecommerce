"use client";
import React from "react";
import AdminSidebar from "./AdminSidebar";

const dummyProducts = [
  { _id: "1", title: "Luxury Sofa", price: 499 },
  { _id: "2", title: "Modern Chair", price: 199 },
  { _id: "3", title: "Elegant Table", price: 299 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Products</h2>
          <table className="w-full table-auto bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-200 text-gray-900">
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dummyProducts.map((p) => (
                <tr key={p._id} className="border-b">
                  <td className="p-3">{p.title}</td>
                  <td className="p-3">${p.price}</td>
                  <td className="p-3">
                    <button className="text-blue-500 hover:underline mr-2">Edit</button>
                    <button className="text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
