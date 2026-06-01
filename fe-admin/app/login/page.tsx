"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Phone, AlertCircle, ShoppingBag } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!phone || !password) {
      setError("Nomor telepon dan password wajib diisi");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Gagal masuk. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      // Check if user is admin
      if (data.user?.role !== "admin") {
        setError("Akses ditolak. Akun Anda bukan Administrator.");
        setLoading(false);
        return;
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);

      // Store token in cookie for server-side verification
      document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax;`;

      // Redirect to admin dashboard
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Koneksi gagal. Silakan periksa jaringan Anda.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f9faf2] px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-lg border border-[#c2c9bb] shadow-[0px_4px_16px_rgba(26,28,24,0.04)] p-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-[#c5eab8]/20 text-[#164212] mb-3">
            <ShoppingBag size={32} className="stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1c18] font-mono">
            MarketDash
          </h1>
          <p className="text-xs font-semibold text-[#42493e] mt-1">
            ADMINISTRATOR PORTAL
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex gap-3 items-start p-3 bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#93000a] text-sm rounded-md animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#42493e] uppercase tracking-wider">
              Nomor Telepon
            </label>
            <div className="relative">
              <Phone
                size={16}
                className="absolute left-3 top-3 text-[#42493e]/60"
              />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f3f4ed] text-[#1a1c18] rounded-md border border-[#c2c9bb] focus:outline-none focus:border-[#2e5a27] focus:ring-1 focus:ring-[#2e5a27] disabled:opacity-65 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#42493e] uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-3 text-[#42493e]/60"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f3f4ed] text-[#1a1c18] rounded-md border border-[#c2c9bb] focus:outline-none focus:border-[#2e5a27] focus:ring-1 focus:ring-[#2e5a27] disabled:opacity-65 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#2E5A27] text-white hover:bg-[#1F3D1A] disabled:bg-[#2e5a27]/60 disabled:cursor-not-allowed text-sm font-semibold rounded-md shadow-sm active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-b-white"></div>
                <span>Memproses Masuk...</span>
              </>
            ) : (
              <span>Masuk Ke Dashboard</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
