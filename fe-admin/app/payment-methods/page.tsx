"use client";

import React from "react";
import { CreditCard, ToggleLeft, ToggleRight, Plus, ShieldCheck, Settings } from "lucide-react";

const paymentMethods = [
  { id: "PAY-001", name: "Credit/Debit Card", gateway: "Stripe", fee: "2.9% + $0.30", status: true },
  { id: "PAY-002", name: "E-Wallet (GoPay/OVO)", gateway: "Midtrans", fee: "1.5%", status: true },
  { id: "PAY-003", name: "Bank Transfer (Virtual Account)", gateway: "Xendit", fee: "$0.30 flat", status: true },
  { id: "PAY-004", name: "Cash on Delivery", gateway: "Manual", fee: "0%", status: false },
];

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center bg-white p-5 rounded-lg border border-outline/10 shadow-[0px_2px_4px_rgba(0,0,0,0.03)]">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Payment Gateways</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Manage incoming transaction methods and fees</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#2E5A27] text-white rounded-md hover:bg-[#1F3D1A] transition-all">
          <Plus size={14} />
          <span>Add Gateway</span>
        </button>
      </div>

      {/* Methods List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paymentMethods.map((method) => (
          <div key={method.id} className="bg-white p-5 rounded-lg border border-outline/10 shadow-[0px_2px_4px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary-container/10 text-primary-container rounded-lg">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">{method.name}</h4>
                  <p className="text-xs text-on-surface-variant">Gateway: <span className="font-semibold">{method.gateway}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1 rounded-md hover:bg-surface-container-low text-on-surface-variant">
                  <Settings size={16} />
                </button>
                <button className={`text-${method.status ? "primary" : "on-surface-variant/40"}`}>
                  {method.status ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center border-t border-outline/10 pt-4 text-xs">
              <div className="flex items-center gap-1.5 text-on-secondary-container font-semibold">
                <ShieldCheck size={14} className="text-secondary" />
                <span>Secure PCI-DSS</span>
              </div>
              <div className="font-bold text-on-surface">
                Fee: {method.fee}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
