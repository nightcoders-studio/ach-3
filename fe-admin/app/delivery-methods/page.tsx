"use client";

import React from "react";
import { Truck, ToggleLeft, ToggleRight, Plus, MapPin, DollarSign } from "lucide-react";

const deliveryMethods = [
  { id: "DEL-001", name: "Standard Courier", estimation: "2-3 Business Days", basePrice: "$2.50", status: true },
  { id: "DEL-002", name: "Instant Delivery (Gojek/Grab)", estimation: "1-2 Hours", basePrice: "$5.00", status: true },
  { id: "DEL-003", name: "Next Day Shipping", estimation: "Next Day by 5 PM", basePrice: "$3.75", status: true },
  { id: "DEL-004", name: "Store Pickup", estimation: "Within 2 Hours", basePrice: "$0.00", status: false },
];

export default function DeliveryMethodsPage() {
  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center bg-white p-5 rounded-lg border border-outline/10 shadow-[0px_2px_4px_rgba(0,0,0,0.03)]">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Logistics & Delivery</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Configure fulfillment options for your customers</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#2E5A27] text-white rounded-md hover:bg-[#1F3D1A] transition-all">
          <Plus size={14} />
          <span>Add Method</span>
        </button>
      </div>

      {/* Methods List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deliveryMethods.map((method) => (
          <div key={method.id} className="bg-white p-5 rounded-lg border border-outline/10 shadow-[0px_2px_4px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary-container/10 text-primary-container rounded-lg">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">{method.name}</h4>
                  <p className="text-[11px] text-on-surface-variant font-mono">{method.id}</p>
                </div>
              </div>
              <button className={`text-${method.status ? "primary" : "on-surface-variant/40"}`}>
                {method.status ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-outline/10 pt-4 text-sm text-on-surface-variant">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-on-surface-variant/70" />
                <span>{method.estimation}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-on-surface justify-end">
                <DollarSign size={15} />
                <span>{method.basePrice} base</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
