"use client";

import React from "react";
import { Package, Search, Plus, Filter, AlertCircle, RefreshCw } from "lucide-react";

const stockItems = [
  { id: "PROD-001", name: "Fresh Spinach", category: "Vegetables", stock: 0, status: "Out of Stock", price: "$1.50" },
  { id: "PROD-002", name: "Organic Red Apples", category: "Fruits", stock: 15, status: "Low Stock", price: "$2.99" },
  { id: "PROD-003", name: "Whole Milk 1L", category: "Dairy", stock: 120, status: "In Stock", price: "$1.89" },
  { id: "PROD-004", name: "Brown Eggs 12pk", category: "Dairy", stock: 8, status: "Low Stock", price: "$3.50" },
  { id: "PROD-005", name: "Sourdough Bread", category: "Bakery", stock: 45, status: "In Stock", price: "$4.00" },
  { id: "PROD-006", name: "Fresh Salmon 250g", category: "Meat & Seafood", stock: 0, status: "Out of Stock", price: "$9.99" },
];

export default function StockPage() {
  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg border border-outline/10 shadow-[0px_2px_4px_rgba(0,0,0,0.03)]">
          <p className="text-[11px] font-bold text-on-surface-variant/75 uppercase tracking-wider">Total Products</p>
          <h3 className="text-2xl font-bold text-on-surface mt-1">342</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border border-outline/10 border-l-4 border-error shadow-[0px_2px_4px_rgba(0,0,0,0.03)]">
          <p className="text-[11px] font-bold text-on-surface-variant/75 uppercase tracking-wider">Out of Stock</p>
          <h3 className="text-2xl font-bold text-error mt-1">5</h3>
        </div>
        <div className="bg-white p-5 rounded-lg border border-outline/10 border-l-4 border-amber-500 shadow-[0px_2px_4px_rgba(0,0,0,0.03)]">
          <p className="text-[11px] font-bold text-on-surface-variant/75 uppercase tracking-wider">Low Stock Warnings</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">12</h3>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white p-4 rounded-lg border border-outline/10 shadow-[0px_2px_4px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row gap-3 justify-between items-center">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-3 text-on-surface-variant/60" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-surface-container-low text-on-surface rounded-md border border-outline/15 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-outline/15 rounded-md hover:bg-surface-container-low/50 transition-all duration-150">
            <Filter size={14} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#2E5A27] text-white rounded-md hover:bg-[#1F3D1A] transition-all duration-150">
            <Plus size={14} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg border border-outline/10 shadow-[0px_2px_4px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/40 border-b border-outline/10 text-[10px] font-bold text-on-surface-variant/90 tracking-wider uppercase">
                <th className="py-4 px-6">SKU ID</th>
                <th className="py-4 px-6">Product Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock Level</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10 text-sm">
              {stockItems.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/20 transition-all duration-100">
                  <td className="py-4 px-6 font-mono font-semibold text-on-surface">{item.id}</td>
                  <td className="py-4 px-6 font-semibold text-on-surface">{item.name}</td>
                  <td className="py-4 px-6 text-on-surface-variant">{item.category}</td>
                  <td className="py-4 px-6 font-semibold text-on-surface">{item.price}</td>
                  <td className="py-4 px-6 font-bold text-on-surface">{item.stock} units</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.status === "In Stock"
                          ? "bg-secondary-container/30 text-on-secondary-container"
                          : item.status === "Low Stock"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-error-container/20 text-error"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
