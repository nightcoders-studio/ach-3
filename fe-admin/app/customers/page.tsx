"use client";

import React from "react";
import { Users, Search, Plus, Mail, ShieldAlert, Award } from "lucide-react";

const customers = [
  { id: "CUST-8201", name: "Jonathan Miller", email: "jonathan.m@gmail.com", tier: "Wholesale", spending: "$4,850.00", status: "Active" },
  { id: "CUST-7392", name: "Sarah Kensington", email: "sarah.k@yahoo.com", tier: "Retail", spending: "$350.20", status: "Active" },
  { id: "CUST-1902", name: "Michael Chen", email: "mchen@gmail.com", tier: "Wholesale", spending: "$8,210.50", status: "Active" },
  { id: "CUST-9402", name: "Amanda Ross", email: "amanda.r@outlook.com", tier: "Retail", spending: "$58.00", status: "Suspended" },
];

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center bg-white p-5 rounded-lg border border-outline/10 shadow-[0px_2px_4px_rgba(0,0,0,0.03)]">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Customer Directory</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Manage user profiles and wholesaling tier access</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#2E5A27] text-white rounded-md hover:bg-[#1F3D1A] transition-all">
          <Plus size={14} />
          <span>New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-outline/10 shadow-[0px_2px_4px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-3 text-on-surface-variant/60" />
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-surface-container-low text-on-surface rounded-md border border-outline/15 focus:outline-none"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-lg border border-outline/10 shadow-[0px_2px_4px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/40 border-b border-outline/10 text-[10px] font-bold text-on-surface-variant/90 tracking-wider uppercase">
                <th className="py-4 px-6">Customer ID</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Tier</th>
                <th className="py-4 px-6">Total Spent</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10 text-sm">
              {customers.map((cust) => (
                <tr key={cust.id} className="hover:bg-surface-container-low/20 transition-all duration-100">
                  <td className="py-4 px-6 font-mono font-semibold text-on-surface">{cust.id}</td>
                  <td className="py-4 px-6 font-semibold text-on-surface">{cust.name}</td>
                  <td className="py-4 px-6 text-on-surface-variant flex items-center gap-1.5 py-4">
                    <Mail size={13} />
                    <span>{cust.email}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      cust.tier === "Wholesale" 
                        ? "bg-primary-container/15 text-primary-container"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}>
                      {cust.tier === "Wholesale" && <Award size={12} />}
                      {cust.tier}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-on-surface">{cust.spending}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      cust.status === "Active"
                        ? "bg-secondary-container/30 text-on-secondary-container"
                        : "bg-error-container/20 text-error"
                    }`}>
                      {cust.status}
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
