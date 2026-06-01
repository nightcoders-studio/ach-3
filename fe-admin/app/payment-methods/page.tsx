"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  ToggleLeft,
  ToggleRight,
  Plus,
  X,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  ShieldCheck
} from "lucide-react";

interface PaymentOption {
  payment_option_id: string;
  name: string;
  is_available: boolean;
  created_by: string | null;
  created_at: string;
  payment_code?: string;
}

export default function PaymentMethodsPage() {
  const [options, setOptions] = useState<PaymentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<PaymentOption | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");

  const fetchOptions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payment-options");
      const data = await res.json();
      if (res.ok) {
        setOptions(data.payment_options || []);
      } else {
        throw new Error(data.error || "Gagal memuat opsi pembayaran");
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal memuat data opsi pembayaran";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  // Open modal for Adding a new option
  const openAddModal = () => {
    setEditingOption(null);
    setName("");
    setIsModalOpen(true);
  };

  // Open modal for Editing an option
  const openEditModal = (option: PaymentOption) => {
    setEditingOption(option);
    setName(option.name);
    setIsModalOpen(true);
  };

  // Handle toggle availability status (is_available)
  const handleToggleStatus = async (option: PaymentOption) => {
    setError("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/payment-options/${option.payment_option_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_available: !option.is_available }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui status pembayaran");
      }

      fetchOptions();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal memperbarui status pembayaran";
      setError(message);
    }
  };

  // Save/Update Payment Option form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const token = localStorage.getItem("token");
    const payload = {
      name,
    };

    try {
      const url = editingOption
        ? `/api/payment-options/${editingOption.payment_option_id}`
        : "/api/payment-options";
      const method = editingOption ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan opsi pembayaran");
      }

      setIsModalOpen(false);
      fetchOptions();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal menyimpan opsi pembayaran";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Payment Option
  const handleDelete = async (option_id: string, optionName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus opsi pembayaran "${optionName}"?`)) return;

    setError("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/payment-options/${option_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus opsi pembayaran");
      }

      fetchOptions();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal menghapus opsi pembayaran";
      setError(message);
    }
  };

  // Helpers to get short readable ID
  const getDisplayId = (option: PaymentOption) => {
    return option.payment_code || `PAY-${option.payment_option_id.substring(0, 8).toUpperCase()}`;
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-3">
        <Loader2 size={36} className="animate-spin text-[#2E5A27]" />
        <p className="text-sm font-semibold text-[#2E5A27]/80">
          Memuat data metode pembayaran...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Error Alert */}
      {error && (
        <div className="flex gap-3 items-start p-4 bg-[#ffdad6] border border-[#ba1a1a]/25 text-[#93000a] text-sm rounded-md shadow-sm">
          <AlertTriangle size={20} className="shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Terjadi Kesalahan</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError("")} className="text-[#93000a] hover:opacity-75">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header and Add Button */}
      <div className="flex justify-between items-center bg-white p-5 rounded-lg border border-[#c2c9bb]/40 shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Metode Pembayaran</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Konfigurasi opsi pembayaran pesanan bagi pelanggan Anda</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#2E5A27] text-white rounded-md hover:bg-[#1F3D1A] transition-all"
        >
          <Plus size={14} />
          <span>Tambah Metode</span>
        </button>
      </div>

      {/* Methods List Grid */}
      {options.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-[#c2c9bb]/40 text-center text-on-surface-variant/60 font-medium">
          Belum ada metode pembayaran yang terdaftar. Klik "Tambah Metode" untuk membuat baru.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((method) => (
            <div
              key={method.payment_option_id}
              className="bg-white p-5 rounded-lg border border-[#c2c9bb]/40 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#c5eab8]/20 text-[#2e5a27] rounded-lg">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">{method.name}</h4>
                    <p className="text-[11px] text-on-surface-variant font-mono">{getDisplayId(method)}</p>
                  </div>
                </div>
                
                {/* Actions (Toggle status, edit, delete) */}
                <div className="flex items-center gap-3">
                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(method)}
                    title="Edit Metode"
                    className="p-1 rounded-md hover:bg-[#f3f4ed] text-on-surface-variant hover:text-primary transition-all"
                  >
                    <Edit2 size={16} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(method.payment_option_id, method.name)}
                    title="Hapus Metode"
                    className="p-1 rounded-md hover:bg-[#ffdad6]/20 text-[#ba1a1a] transition-all"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Active Toggle Switch */}
                  <button
                    onClick={() => handleToggleStatus(method)}
                    className={method.is_available ? "text-[#2e5a27]" : "text-on-surface-variant/40"}
                    title={method.is_available ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {method.is_available ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-[#c2c9bb]/20 pt-4 text-sm text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[#2e5a27]" />
                  <span className="text-xs font-semibold">
                    {method.is_available ? "Aktif & Dapat Digunakan" : "Nonaktif"}
                  </span>
                </div>
                <div className="text-xs text-on-surface-variant/75">
                  Ditambahkan: {new Date(method.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Payment Option Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-[#c2c9bb]/40 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-[#c2c9bb]/20">
              <h4 className="text-lg font-bold text-on-surface">
                {editingOption ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran"}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-on-surface-variant"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Option Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Nama Metode Pembayaran *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Transfer Bank Mandiri, E-Wallet GoPay, Cash"
                  className="w-full px-3 py-2 text-sm bg-[#f3f4ed] text-on-surface rounded-md border border-[#c2c9bb] focus:outline-none focus:border-[#2e5a27]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-[#c2c9bb]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold bg-[#f3f4ed] text-on-surface-variant rounded hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold bg-[#2E5A27] text-white hover:bg-[#1F3D1A] disabled:opacity-60 rounded flex items-center gap-1.5"
                >
                  {submitting && <Loader2 size={12} className="animate-spin" />}
                  <span>{editingOption ? "Simpan Perubahan" : "Tambah Opsi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
