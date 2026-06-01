"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  X,
  Eye,
  Loader2,
  AlertTriangle,
  ShoppingBag
} from "lucide-react";

interface Customer {
  user_id: string;
  name: string;
  phone: string;
  created_at: string;
}

interface OrderItem {
  order_item_id: string;
  product_id: string;
  quantity: number;
  price_per_unit: number;
  subtotal: number;
  products?: {
    name: string;
    unit: string;
  };
}

interface Order {
  order_id: string;
  delivery_option_id: string;
  payment_option_id: string | null;
  status: string;
  total_price: number;
  ordered_at: string;
  order_items: OrderItem[];
  delivery_options?: {
    name: string;
    type: string;
  };
}

interface CustomerDetail {
  customer: Customer;
  orders: Order[];
  total_orders: number;
  total_spent: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Customer details states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<CustomerDetail | null>(null);
  const [detailError, setDetailError] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setCustomers(data.customers || []);
      } else {
        throw new Error(data.error || "Gagal memuat daftar pelanggan");
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal memuat data pelanggan";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetail = async (id: string) => {
    setDetailLoading(true);
    setDetailError("");
    setDetailData(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/customers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setDetailData(data);
      } else {
        throw new Error(data.error || "Gagal memuat detail pelanggan");
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal memuat detail data";
      setDetailError(message);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleViewDetail = (id: string) => {
    setSelectedCustomerId(id);
    fetchCustomerDetail(id);
  };

  const handleCloseDetail = () => {
    setSelectedCustomerId(null);
    setDetailData(null);
    setDetailError("");
  };

  // Filter customers by search query
  const filteredCustomers = customers.filter(
    (cust) =>
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phone.includes(searchQuery)
  );

  const getDisplayId = (id: string) => {
    return `CUST-${id.substring(0, 8).toUpperCase()}`;
  };

  const getOrderDisplayId = (id: string) => {
    return `ORD-${id.substring(0, 8).toUpperCase()}`;
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-3">
        <Loader2 size={36} className="animate-spin text-[#2E5A27]" />
        <p className="text-sm font-semibold text-[#2E5A27]/80">
          Memuat data daftar pelanggan...
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

      {/* Header (No "New Customer" button per request) */}
      <div className="bg-white p-5 rounded-lg border border-[#c2c9bb]/40 shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#c5eab8]/20 text-[#2e5a27] rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface">Daftar Pelanggan</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Daftar seluruh pelanggan yang telah melakukan registrasi dan transaksi melalui aplikasi mobile
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#c2c9bb]/40 shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-3 text-on-surface-variant/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau nomor telepon..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#f3f4ed] text-on-surface rounded-md border border-[#c2c9bb] focus:outline-none focus:border-[#2e5a27]"
          />
        </div>
      </div>

      {/* Customers Table */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-[#c2c9bb]/40 text-center text-on-surface-variant/60 font-medium">
          {searchQuery ? "Tidak ditemukan pelanggan yang cocok." : "Belum ada pelanggan terdaftar saat ini."}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#c2c9bb]/40 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f3f4ed] border-b border-[#c2c9bb]/40 text-[10px] font-bold text-on-surface-variant/90 tracking-wider uppercase">
                  <th className="py-4 px-6">ID Pelanggan</th>
                  <th className="py-4 px-6">Nama Lengkap</th>
                  <th className="py-4 px-6">Nomor Telepon</th>
                  <th className="py-4 px-6">Tanggal Bergabung</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c2c9bb]/20 text-sm">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.user_id}
                    className="hover:bg-slate-50/50 transition-all duration-100"
                  >
                    <td className="py-4 px-6 font-mono font-semibold text-on-surface">
                      {getDisplayId(cust.user_id)}
                    </td>
                    <td className="py-4 px-6 font-semibold text-on-surface">
                      {cust.name}
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant font-mono">
                      {cust.phone}
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">
                      {new Date(cust.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleViewDetail(cust.user_id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#2E5A27] text-white rounded hover:bg-[#1F3D1A] transition-all"
                        title="Lihat Detail Belanja"
                      >
                        <Eye size={12} />
                        <span>Riwayat Belanja</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail Modal / Drawer */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-[#c2c9bb]/40 shadow-2xl max-w-2xl w-full p-6 animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center pb-3 border-b border-[#c2c9bb]/20">
              <div>
                <h4 className="text-lg font-bold text-on-surface">
                  Detail Profil & Riwayat Pelanggan
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Informasi transaksi lengkap pelanggan
                </p>
              </div>
              <button
                onClick={handleCloseDetail}
                className="p-1 rounded-full hover:bg-slate-100 text-on-surface-variant"
              >
                <X size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 flex flex-col justify-center items-center gap-3">
                <Loader2 size={32} className="animate-spin text-[#2E5A27]" />
                <p className="text-xs font-semibold text-on-surface-variant">
                  Memuat data transaksi...
                </p>
              </div>
            ) : detailError ? (
              <div className="py-8 text-center text-error flex flex-col items-center gap-2">
                <AlertTriangle size={24} />
                <p className="text-sm font-semibold">{detailError}</p>
                <button
                  onClick={() => fetchCustomerDetail(selectedCustomerId)}
                  className="mt-2 text-xs font-bold text-[#2e5a27] hover:underline"
                >
                  Coba Lagi
                </button>
              </div>
            ) : detailData ? (
              <div className="flex-1 overflow-y-auto mt-4 space-y-6 pr-1">
                {/* Profile Brief Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left Column: Customer Profile */}
                  <div className="bg-[#f3f4ed] p-4 rounded-lg border border-[#c2c9bb]/30 space-y-2">
                    <div className="flex items-center gap-2 text-[#2e5a27]">
                      <Users size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Informasi Profil</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="font-bold text-on-surface">{detailData.customer.name}</p>
                      <div className="flex items-center gap-1 text-xs text-on-surface-variant font-mono">
                        <Phone size={12} />
                        <span>{detailData.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                        <Calendar size={12} />
                        <span>Bergabung: {new Date(detailData.customer.created_at).toLocaleDateString("id-ID")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Key Transaction Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#c5eab8]/15 border border-[#c2c9bb]/30 p-4 rounded-lg flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 text-[#2e5a27] mb-1">
                        <ShoppingBag size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Order</span>
                      </div>
                      <h3 className="text-xl font-bold text-on-surface">{detailData.total_orders}x</h3>
                    </div>
                    <div className="bg-[#c5eab8]/15 border border-[#c2c9bb]/30 p-4 rounded-lg flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 text-[#2e5a27] mb-1 font-bold text-[#2e5a27]">
                        <DollarSign size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Belanja</span>
                      </div>
                      <h3 className="text-lg font-bold text-on-surface truncate">
                        Rp {detailData.total_spent.toLocaleString("id-ID")}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Orders History List */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-[#2e5a27]" />
                    <span>Daftar Riwayat Pesanan</span>
                  </h5>

                  {detailData.orders.length === 0 ? (
                    <div className="text-center py-6 text-xs text-on-surface-variant/60 font-medium bg-[#f3f4ed]/50 rounded-lg border border-[#c2c9bb]/20">
                      Belum ada transaksi pembelian oleh customer ini.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {detailData.orders.map((order) => (
                        <div
                          key={order.order_id}
                          className="bg-white border border-[#c2c9bb]/40 rounded-lg p-4 shadow-[0px_2px_4px_rgba(0,0,0,0.01)] hover:shadow-xs transition-all space-y-3"
                        >
                          {/* Order Card Header */}
                          <div className="flex justify-between items-start flex-wrap gap-2 pb-2 border-b border-[#c2c9bb]/20">
                            <div>
                              <p className="font-mono text-xs font-bold text-on-surface">
                                {getOrderDisplayId(order.order_id)}
                              </p>
                              <p className="text-[10px] text-on-surface-variant/80 mt-0.5">
                                {new Date(order.ordered_at).toLocaleString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  order.status === "completed"
                                    ? "bg-[#c5eab8]/30 text-[#1F3D1A]"
                                    : order.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : order.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {order.status === "completed"
                                  ? "Selesai"
                                  : order.status === "pending"
                                  ? "Menunggu"
                                  : order.status === "cancelled"
                                  ? "Batal"
                                  : order.status}
                              </span>
                              <p className="text-sm font-bold text-on-surface">
                                Rp {order.total_price.toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>

                          {/* Order Items List */}
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-on-surface-variant/85 uppercase tracking-wide">
                              Detail Item Belanja:
                            </p>
                            <div className="divide-y divide-[#c2c9bb]/10 text-xs">
                              {order.order_items.map((item) => (
                                <div
                                  key={item.order_item_id}
                                  className="flex justify-between py-1 text-on-surface-variant"
                                >
                                  <span>
                                    {item.products?.name || "Produk dihapus"}{" "}
                                    <span className="text-[10px] font-medium text-on-surface-variant/70">
                                      ({item.quantity} {item.products?.unit || "unit"})
                                    </span>
                                  </span>
                                  <span className="font-mono text-on-surface font-semibold">
                                    Rp {item.subtotal.toLocaleString("id-ID")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Delivery Info */}
                          {order.delivery_options && (
                            <div className="text-[11px] bg-[#f3f4ed] px-2.5 py-1.5 rounded flex justify-between items-center text-on-surface-variant">
                              <span>
                                Metode: <strong>{order.delivery_options.name}</strong>
                              </span>
                              <span className="capitalize text-[10px] font-semibold bg-[#2e5a27]/10 text-[#2e5a27] px-1.5 py-0.5 rounded">
                                {order.delivery_options.type === "self_pickup" ? "Ambil Sendiri" : "Pengantaran Kurir"}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-[#c2c9bb]/20">
              <button
                onClick={handleCloseDetail}
                className="px-4 py-2 text-xs font-semibold bg-[#f3f4ed] text-on-surface-variant rounded hover:bg-slate-100"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
