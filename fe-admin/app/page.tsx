"use client";

import React, { useState } from "react";
import {
  ShoppingCart,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  Download,
  Eye,
  FileText,
  Truck,
  UserPlus,
  ChevronDown
} from "lucide-react";

// Mock data for the 12-bar chart
const chartData = [
  { label: "1-3 Jun", height: 35, revenue: "$350", isDark: false },
  { label: "4-6 Jun", height: 50, revenue: "$500", isDark: false },
  { label: "7-9 Jun", height: 38, revenue: "$380", isDark: false },
  { label: "10-12 Jun", height: 68, revenue: "$680", isDark: false },
  { label: "13-15 Jun", height: 58, revenue: "$580", isDark: false },
  { label: "16-18 Jun", height: 82, revenue: "$820", isDark: true }, // Darker Spinach Green
  { label: "19-21 Jun", height: 62, revenue: "$620", isDark: false },
  { label: "22-24 Jun", height: 45, revenue: "$450", isDark: false },
  { label: "25-27 Jun", height: 75, revenue: "$750", isDark: false },
  { label: "28-30 Jun", height: 88, revenue: "$880", isDark: true }, // Darker Spinach Green
  { label: "1-3 Jul", height: 80, revenue: "$800", isDark: false },
  { label: "4-6 Jul", height: 60, revenue: "$600", isDark: false },
];

export default function Dashboard() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const orders = [
    { id: "#ORD-2094", customer: "Jonathan Miller", status: "Completed", amount: "$452.10" },
    { id: "#ORD-2093", customer: "Sarah Kensington", status: "Pending", amount: "$128.50" },
    { id: "#ORD-2092", customer: "Michael Chen", status: "Completed", amount: "$89.90" },
    { id: "#ORD-2091", customer: "Amanda Ross", status: "Failed", amount: "$210.00" },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Orders */}
        <div className="bg-white rounded-lg border border-outline/10 p-5 shadow-[0px_2px_4px_rgba(0,0,0,0.03)] relative overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-md bg-secondary-container/15 text-primary-container">
              <ShoppingCart size={20} />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-container/30 text-secondary-container font-mono">
              +12%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
              Total Orders
            </p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">1,284</h3>
          </div>
        </div>

        {/* Card 2: Total Customers */}
        <div className="bg-white rounded-lg border border-outline/10 p-5 shadow-[0px_2px_4px_rgba(0,0,0,0.03)] relative overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-md bg-secondary-container/15 text-primary-container">
              <Users size={20} />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-container/30 text-secondary-container font-mono">
              +5.4%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
              Total Customers
            </p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">850</h3>
          </div>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div className="bg-white rounded-lg border-l-4 border-error border-y border-r border-outline/10 p-5 shadow-[0px_2px_4px_rgba(0,0,0,0.03)] relative overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-md bg-error-container/20 text-error">
              <AlertTriangle size={20} />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-error-container/30 text-error/90 font-sans">
              Action Required
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
              Low Stock Alerts
            </p>
            <h3 className="text-2xl font-bold text-error mt-1">12</h3>
          </div>
        </div>

        {/* Card 4: Pending Orders */}
        <div className="bg-white rounded-lg border border-outline/10 p-5 shadow-[0px_2px_4px_rgba(0,0,0,0.03)] relative overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-md bg-tertiary-container/15 text-tertiary">
              <Clock size={20} />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-sans">
              Today
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
              Pending Orders
            </p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">45</h3>
          </div>
        </div>
      </div>

      {/* Main Charts & Activities Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Overview Chart Container */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-outline/10 p-6 shadow-[0px_2px_4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Performance Overview</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Revenue trend over the last 30 days
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-surface-container-high/40 text-on-surface border border-outline/10 rounded-md hover:bg-surface-container-high/80 transition-all duration-150">
              <span>Last 30 Days</span>
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Interactive Chart Canvas using CSS-Flex and SVG details */}
          <div className="relative h-64 flex items-end justify-between px-2 pt-6 border-b border-outline/10">
            {/* Background Grid Lines */}
            <div className="absolute inset-x-0 bottom-0 top-6 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-t border-dashed border-outline/10" />
              <div className="w-full border-t border-dashed border-outline/10" />
              <div className="w-full border-t border-dashed border-outline/10" />
              <div className="w-full border-t border-dashed border-outline/10" />
            </div>

            {/* Render bars dynamically */}
            <div className="relative w-full h-full flex items-end justify-between gap-2.5 z-10">
              {chartData.map((bar, idx) => {
                const isHovered = hoveredBar === idx;
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer"
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-2 bg-inverse-surface text-inverse-on-surface text-[10px] font-semibold py-1 px-2 rounded shadow-lg z-20 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
                        Revenue: {bar.revenue}
                      </div>
                    )}

                    {/* Bar graphic */}
                    <div
                      className={`w-full rounded-t-[2px] transition-all duration-200 origin-bottom ${
                        bar.isDark
                          ? "bg-primary-container hover:bg-primary"
                          : "bg-on-primary-container/60 hover:bg-on-primary-container"
                      }`}
                      style={{
                        height: `${bar.height}%`,
                        transform: isHovered ? "scaleY(1.03)" : "scaleY(1)",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between items-center px-4 mt-2 text-[10px] font-bold text-on-surface-variant/80 font-sans tracking-wide">
            {chartData.map((bar, idx) => (
              <span key={idx} className="flex-1 text-center truncate">
                {bar.label.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Alerts Container */}
        <div className="bg-white rounded-lg border border-outline/10 p-6 shadow-[0px_2px_4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-on-surface mb-5">Recent Alerts</h3>
            <div className="space-y-4">
              {/* Alert 1 */}
              <div className="flex gap-4 items-start p-2 rounded-md hover:bg-surface-container-low/20 transition-all duration-150">
                <div className="p-2.5 rounded-lg bg-error-container/20 text-error shrink-0 mt-0.5">
                  <FileText size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface leading-snug">
                    Fresh Spinach is out of stock
                  </p>
                  <p className="text-xs text-on-surface-variant/70 mt-0.5">2 minutes ago</p>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="flex gap-4 items-start p-2 rounded-md hover:bg-surface-container-low/20 transition-all duration-150">
                <div className="p-2.5 rounded-lg bg-secondary-container/20 text-secondary-container shrink-0 mt-0.5">
                  <Truck size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface leading-snug">
                    Delivery #9402 dispatched
                  </p>
                  <p className="text-xs text-on-surface-variant/70 mt-0.5">14 minutes ago</p>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="flex gap-4 items-start p-2 rounded-md hover:bg-surface-container-low/20 transition-all duration-150">
                <div className="p-2.5 rounded-lg bg-secondary-container/20 text-secondary-container shrink-0 mt-0.5">
                  <UserPlus size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface leading-snug">
                    New wholesale customer joined
                  </p>
                  <p className="text-xs text-on-surface-variant/70 mt-0.5">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 py-2 text-xs font-bold text-primary hover:text-primary-container hover:bg-surface-container-low/30 border border-outline/10 rounded-md transition-all duration-150 text-center">
            View All Activity
          </button>
        </div>
      </div>

      {/* Bottom Row: Recent Orders Table */}
      <div className="bg-white rounded-lg border border-outline/10 shadow-[0px_2px_4px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Table Header Section */}
        <div className="flex justify-between items-center p-5 border-b border-outline/10">
          <h3 className="text-lg font-bold text-on-surface">Recent Orders</h3>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-on-surface-variant bg-white border border-outline/15 rounded-md hover:bg-surface-container-low/50 hover:text-on-surface transition-all duration-150">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/40 border-b border-outline/10 text-[10px] font-bold text-on-surface-variant/90 tracking-wider uppercase">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-surface-container-low/20 transition-all duration-100"
                >
                  <td className="py-4 px-6 font-bold text-sm text-on-surface font-mono">{order.id}</td>
                  <td className="py-4 px-6 text-sm text-on-surface-variant">{order.customer}</td>
                  <td className="py-4 px-6 text-sm">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans ${
                        order.status === "Completed"
                          ? "bg-secondary-container/30 text-on-secondary-container"
                          : order.status === "Pending"
                          ? "bg-tertiary-container/30 text-on-tertiary-container"
                          : "bg-error-container/20 text-error"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-sm text-on-surface">{order.amount}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedOrder(order.id)}
                      className="p-1.5 rounded hover:bg-surface-container-low/50 text-on-surface-variant hover:text-primary transition-all duration-150"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Order Detail Drawer / Modal for richer interactivity */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-outline/10 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <h4 className="text-lg font-bold text-on-surface">Order Details</h4>
            <p className="text-xs text-on-surface-variant/80 mt-1">Details for order ID {selectedOrder}</p>
            <div className="mt-4 p-4 rounded bg-surface-container-low/40 space-y-2 text-sm text-on-surface-variant">
              <div className="flex justify-between"><span className="font-semibold">Status:</span><span className="text-primary font-bold">Processed</span></div>
              <div className="flex justify-between"><span className="font-semibold">Estimated Delivery:</span><span>Next Business Day</span></div>
              <div className="flex justify-between"><span className="font-semibold">Shipping Zone:</span><span>Zone A</span></div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-semibold bg-surface-container-high/60 text-on-surface rounded hover:bg-surface-container-high transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
