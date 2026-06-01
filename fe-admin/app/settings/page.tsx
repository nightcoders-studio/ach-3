"use client";

import React from "react";
import { Settings, Save, Store, BellRing, Lock, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-outline/10 shadow-[0px_2px_4px_rgba(0,0,0,0.03)]">
        <h3 className="text-lg font-bold text-on-surface">Store Configuration</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Customize global storefront and security variables</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-lg border border-outline/10 shadow-[0px_2px_4px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-outline/10 text-primary">
            <Store size={18} />
            <h4 className="font-bold text-on-surface">General Settings</h4>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Store Name</label>
              <input
                type="text"
                defaultValue="Mart2You Utama"
                className="w-full px-3 py-2 text-sm bg-surface-container-low text-on-surface rounded-md border border-outline/15 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Store Email Address</label>
              <input
                type="email"
                defaultValue="admin@mart2you.com"
                className="w-full px-3 py-2 text-sm bg-surface-container-low text-on-surface rounded-md border border-outline/15 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white p-6 rounded-lg border border-outline/10 shadow-[0px_2px_4px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-outline/10 text-primary">
            <Lock size={18} />
            <h4 className="font-bold text-on-surface">Security & Access</h4>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Change Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm bg-surface-container-low text-on-surface rounded-md border border-outline/15 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 py-2.5 px-6 bg-[#2E5A27] text-white hover:bg-[#1F3D1A] text-sm font-semibold rounded-md shadow-sm transition-all duration-150">
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
