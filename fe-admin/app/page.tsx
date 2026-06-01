"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Users,
  AlertTriangle,
  Clock,
  Download,
  Eye,
  FileText,
  UserPlus,
  Loader2,
  X,
  MapPin,
  Save
} from "lucide-react";

interface Product {
  product_id: string;
  name: string;
  unit: string;
  min_order_qty: number;
  price_per_unit: number;
  current_stock: number;
}

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
  user_id: string;
  delivery_option_id: string;
  payment_option_id: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  status: string;
  total_price: number;
  ordered_at: string;
  updated_at: string;
  users?: {
    name: string;
    phone: string;
  };
  delivery_options?: {
    name: string;
    type: string;
  };
  order_items?: OrderItem[];
}

interface AlertItem {
  id: string;
  type: "stock_empty" | "stock_low" | "customer_new" | "order_status";
  message: string;
  timeLabel: string;
  timestamp: number;
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal and details state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [detailError, setDetailError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/customers", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/products")
      ]);

      const ordersData = await ordersRes.json();
      const customersData = await customersRes.json();
      const productsData = await productsRes.json();

      if (!ordersRes.ok) throw new Error(ordersData.error || "Gagal mengambil data orders");
      if (!customersRes.ok) throw new Error(customersData.error || "Gagal mengambil data customers");
      if (!productsRes.ok) throw new Error(productsData.error || "Gagal mengambil data produk");

      setOrders(ordersData.orders || []);
      setCustomers(customersData.customers || []);
      setProducts(productsData.products || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId: string) => {
    setDetailLoading(true);
    setDetailError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDetailOrder(data.order);
        setNewStatus(data.order.status);
      } else {
        throw new Error(data.error || "Gagal memuat detail pesanan");
      }
    } catch (err: any) {
      console.error(err);
      setDetailError(err.message || "Gagal memuat detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrderId || !newStatus) return;
    setStatusUpdating(true);
    setDetailError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/orders/${selectedOrderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        // Refetch detailed order & global dashboard data
        fetchOrderDetail(selectedOrderId);
        fetchData();
      } else {
        throw new Error(data.error || "Gagal memperbarui status");
      }
    } catch (err: any) {
      console.error(err);
      setDetailError(err.message || "Gagal memperbarui status");
    } finally {
      setStatusUpdating(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    fetchOrderDetail(orderId);
  };

  const handleCloseDetail = () => {
    setSelectedOrderId(null);
    setDetailOrder(null);
    setDetailError("");
  };

  // 1. Calculate Metrics
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const lowStockAlerts = products.filter(p => p.current_stock <= p.min_order_qty).length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  // 2. Generate Alerts dynamically
  const getAlerts = (): AlertItem[] => {
    const list: AlertItem[] = [];

    // Low stock / empty stock alerts
    products.forEach((p) => {
      if (p.current_stock === 0) {
        list.push({
          id: `stock-empty-${p.product_id}`,
          type: "stock_empty",
          message: `Stok produk ${p.name} Habis! Segera restock logistik pasar.`,
          timeLabel: "Urgent",
          timestamp: Date.now()
        });
      } else if (p.current_stock <= p.min_order_qty) {
        list.push({
          id: `stock-low-${p.product_id}`,
          type: "stock_low",
          message: `Stok produk ${p.name} Menipis (${p.current_stock} ${p.unit} tersisa).`,
          timeLabel: "Stok Rendah",
          timestamp: Date.now() - 3600000
        });
      }
    });

    // New customers
    customers.slice(0, 3).forEach((c) => {
      const joinTime = new Date(c.created_at).getTime();
      const diffMs = Date.now() - joinTime;
      const diffHrs = Math.floor(diffMs / 3600000);
      let timeLabel = "Baru bergabung";
      if (diffHrs > 0 && diffHrs < 24) timeLabel = `${diffHrs} jam lalu`;
      if (diffHrs >= 24) timeLabel = `${Math.floor(diffHrs / 24)} hari lalu`;

      list.push({
        id: `cust-${c.user_id}`,
        type: "customer_new",
        message: `Pelanggan baru ${c.name} bergabung ke platform.`,
        timeLabel,
        timestamp: joinTime
      });
    });

    // Order updates
    orders.slice(0, 3).forEach((o) => {
      const orderTime = new Date(o.updated_at || o.ordered_at).getTime();
      const diffMs = Date.now() - orderTime;
      const diffMins = Math.floor(diffMs / 60000);
      let timeLabel = "Baru saja";
      if (diffMins > 0 && diffMins < 60) timeLabel = `${diffMins} menit lalu`;
      if (diffMins >= 60 && diffMins < 1440) timeLabel = `${Math.floor(diffMins / 60)} jam lalu`;
      if (diffMins >= 1440) timeLabel = `${Math.floor(diffMins / 1440)} hari lalu`;

      const orderDisplayId = `ORD-${o.order_id.substring(0, 8).toUpperCase()}`;
      list.push({
        id: `order-${o.order_id}`,
        type: "order_status",
        message: `Pesanan ${orderDisplayId} berstatus ${o.status.toUpperCase()}.`,
        timeLabel,
        timestamp: orderTime
      });
    });

    // Sort by timestamp desc
    return list.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5); // top 5 alerts
  };

  const dynamicAlerts = getAlerts();

  // 3. Generate 12 revenue bars for the last 36 days (3 days per bar)
  const getRevenueChartData = () => {
    const barsCount = 12;
    const daysPerBar = 3;
    const now = new Date();
    const resultList = [];

    for (let i = barsCount - 1; i >= 0; i--) {
      const barEnd = new Date(now.getTime() - i * daysPerBar * 24 * 60 * 60 * 1000);
      const barStart = new Date(barEnd.getTime() - (daysPerBar - 1) * 24 * 60 * 60 * 1000);

      const startDay = barStart.getDate();
      const endDay = barEnd.getDate();
      const startMonth = barStart.toLocaleString("id-ID", { month: "short" });
      const label = `${startDay}-${endDay} ${startMonth}`;

      let revenue = 0;
      orders.forEach((o) => {
        if (o.status === "completed") {
          const orderDate = new Date(o.ordered_at);
          if (orderDate >= barStart && orderDate <= new Date(barEnd.getTime() + 24 * 60 * 60 * 1000)) {
            revenue += o.total_price;
          }
        }
      });

      resultList.push({
        label,
        revenue,
        revenueLabel: revenue > 0 ? `Rp ${revenue.toLocaleString("id-ID")}` : "Rp 0"
      });
    }

    const maxRev = Math.max(...resultList.map((r) => r.revenue), 1);
    return resultList.map((r, idx) => {
      const percentage = (r.revenue / maxRev) * 80;
      const height = Math.max(percentage, 8);
      const isDark = idx % 3 === 0 && r.revenue > 0;
      return {
        ...r,
        height,
        isDark
      };
    });
  };

  const dynamicChartData = getRevenueChartData();

  const getDisplayId = (id: string) => {
    return `ORD-${id.substring(0, 8).toUpperCase()}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-3">
        <Loader2 size={40} className="animate-spin text-[#2E5A27]" />
        <p className="text-sm font-semibold text-[#2E5A27]/80">
          Memuat data dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Global Error Alert */}
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

      {/* 4 Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Orders */}
        <div className="bg-white rounded-lg border border-[#c2c9bb]/40 p-5 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] relative overflow-hidden hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-md bg-[#c5eab8]/20 text-[#2e5a27]">
              <ShoppingCart size={20} />
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#c5eab8]/30 text-[#2e5a27] font-mono">
              Live
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
              Total Pesanan
            </p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">{totalOrders}</h3>
          </div>
        </div>

        {/* Card 2: Total Customers */}
        <div className="bg-white rounded-lg border border-[#c2c9bb]/40 p-5 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] relative overflow-hidden hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-md bg-[#c5eab8]/20 text-[#2e5a27]">
              <Users size={20} />
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#c5eab8]/30 text-[#2e5a27] font-mono">
              Aktif
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
              Total Pelanggan
            </p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">{totalCustomers}</h3>
          </div>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div className={`bg-white rounded-lg border-y border-r border-[#c2c9bb]/40 p-5 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] relative overflow-hidden hover:shadow-md transition-all duration-200 border-l-4 ${lowStockAlerts > 0 ? "border-[#ba1a1a]" : "border-[#2e5a27]"}`}>
          <div className="flex justify-between items-start">
            <div className={`p-2.5 rounded-md ${lowStockAlerts > 0 ? "bg-[#ffdad6] text-[#ba1a1a]" : "bg-[#c5eab8]/20 text-[#2e5a27]"}`}>
              <AlertTriangle size={20} />
            </div>
            {lowStockAlerts > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a] uppercase tracking-wide">
                Butuh Restock
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
              Peringatan Stok Rendah
            </p>
            <h3 className={`text-2xl font-bold mt-1 ${lowStockAlerts > 0 ? "text-[#ba1a1a]" : "text-on-surface"}`}>{lowStockAlerts}</h3>
          </div>
        </div>

        {/* Card 4: Pending Orders */}
        <div className="bg-white rounded-lg border border-[#c2c9bb]/40 p-5 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] relative overflow-hidden hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-md bg-amber-100 text-amber-800">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 uppercase tracking-wide">
              Menunggu
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
              Pesanan Pending
            </p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">{pendingOrders}</h3>
          </div>
        </div>
      </div>

      {/* Main Charts & Activities Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Overview Chart Container */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#c2c9bb]/40 p-6 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Tren Pendapatan</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Total pendapatan dari pesanan yang sukses/selesai (36 hari terakhir)
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 bg-[#f3f4ed] text-on-surface border border-[#c2c9bb]/40 rounded-md">
              Kalkulasi Klien (Live)
            </div>
          </div>

          {/* Interactive Chart Canvas using CSS-Flex */}
          <div className="relative h-64 flex items-end justify-between px-2 pt-6 border-b border-[#c2c9bb]/20">
            {/* Background Grid Lines */}
            <div className="absolute inset-x-0 bottom-0 top-6 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-t border-dashed border-[#c2c9bb]/15" />
              <div className="w-full border-t border-dashed border-[#c2c9bb]/15" />
              <div className="w-full border-t border-dashed border-[#c2c9bb]/15" />
              <div className="w-full border-t border-dashed border-[#c2c9bb]/15" />
            </div>

            {/* Render bars dynamically */}
            <div className="relative w-full h-full flex items-end justify-between gap-2 z-10">
              {dynamicChartData.map((bar, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end"
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] font-semibold py-1 px-2 rounded shadow-lg z-20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                    Revenue: {bar.revenueLabel}
                  </div>

                  {/* Bar graphic */}
                  <div
                    className={`w-full rounded-t-[2px] transition-all duration-200 origin-bottom group-hover:scale-y-[1.03] ${
                      bar.isDark
                        ? "bg-[#2E5A27] hover:bg-[#1F3D1A]"
                        : "bg-[#c5eab8] hover:bg-[#b0dfa1]"
                    }`}
                    style={{
                      height: `${bar.height}%`
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between items-center mt-2 text-[9px] font-bold text-on-surface-variant/80 font-sans tracking-wide">
            {dynamicChartData.map((bar, idx) => (
              <span key={idx} className="flex-1 text-center truncate px-0.5">
                {bar.label}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Alerts Container */}
        <div className="bg-white rounded-lg border border-[#c2c9bb]/40 p-6 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-on-surface mb-5">Peringatan & Aktivitas Terbaru</h3>
            <div className="space-y-4">
              {dynamicAlerts.length === 0 ? (
                <div className="text-center py-8 text-xs text-on-surface-variant/60 font-medium">
                  Belum ada aktivitas penting saat ini.
                </div>
              ) : (
                dynamicAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex gap-3 items-start p-2 rounded-md hover:bg-slate-50 transition-all duration-150"
                  >
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      alert.type === "stock_empty"
                        ? "bg-[#ffdad6] text-[#ba1a1a]"
                        : alert.type === "stock_low"
                        ? "bg-amber-100 text-amber-800"
                        : alert.type === "customer_new"
                        ? "bg-[#c5eab8]/20 text-[#2e5a27]"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {alert.type === "customer_new" ? (
                        <UserPlus size={14} />
                      ) : alert.type === "stock_empty" || alert.type === "stock_low" ? (
                        <AlertTriangle size={14} />
                      ) : (
                        <FileText size={14} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-on-surface leading-snug">
                        {alert.message}
                      </p>
                      <p className="text-[10px] text-on-surface-variant/70 mt-0.5">{alert.timeLabel}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders Table */}
      <div className="bg-white rounded-lg border border-[#c2c9bb]/40 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Table Header Section */}
        <div className="flex justify-between items-center p-5 border-b border-[#c2c9bb]/20">
          <h3 className="text-lg font-bold text-on-surface">Daftar Transaksi Pesanan</h3>
          <span className="text-xs text-on-surface-variant/80 font-semibold bg-[#f3f4ed] px-2.5 py-1 rounded">
            Monitoring Pemesanan Pasar
          </span>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-sm text-on-surface-variant/60 font-medium">
              Belum ada data transaksi pesanan terdaftar di pasar.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f3f4ed]/60 border-b border-[#c2c9bb]/35 text-[10px] font-bold text-on-surface-variant/90 tracking-wider uppercase">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Pelanggan</th>
                  <th className="py-4 px-6">Tanggal</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Total Pembayaran</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c2c9bb]/15">
                {orders.slice(0, 10).map((order) => (
                  <tr
                    key={order.order_id}
                    className="hover:bg-slate-50/50 transition-all duration-100"
                  >
                    <td className="py-4 px-6 font-bold text-xs text-on-surface font-mono">
                      {getDisplayId(order.order_id)}
                    </td>
                    <td className="py-4 px-6 text-sm text-on-surface">
                      <div>
                        <p className="font-semibold">{order.users?.name || "Pelanggan"}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                          {order.users?.phone || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-on-surface-variant">
                      {new Date(order.ordered_at).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.status === "completed"
                            ? "bg-[#c5eab8]/35 text-[#1F3D1A]"
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
                    </td>
                    <td className="py-4 px-6 font-bold text-sm text-on-surface">
                      Rp {order.total_price.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenDetail(order.order_id)}
                        className="p-1.5 rounded hover:bg-slate-100 text-on-surface-variant hover:text-primary transition-all duration-150"
                        title="Lihat Detail & Update Status"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Selected Order Detail Drawer / Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-[#c2c9bb]/40 shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center pb-3 border-b border-[#c2c9bb]/20">
              <div>
                <h4 className="text-lg font-bold text-on-surface">Detail Transaksi Pesanan</h4>
                <p className="text-xs text-on-surface-variant">Review item belanja dan pengelolaan status pesanan pasar</p>
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
                <p className="text-xs font-semibold text-on-surface-variant">Memuat rincian pesanan...</p>
              </div>
            ) : detailError ? (
              <div className="py-8 text-center text-error flex flex-col items-center gap-2">
                <AlertTriangle size={24} />
                <p className="text-sm font-semibold">{detailError}</p>
                <button
                  onClick={() => fetchOrderDetail(selectedOrderId)}
                  className="mt-2 text-xs font-bold text-[#2e5a27] hover:underline"
                >
                  Coba Lagi
                </button>
              </div>
            ) : detailOrder ? (
              <div className="flex-1 overflow-y-auto mt-4 space-y-5 pr-1 text-sm">
                
                {/* Status Update Panel for Admin */}
                <div className="bg-[#f3f4ed] p-4 rounded-lg border border-[#c2c9bb]/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Ubah Status Pesanan (Admin)
                    </span>
                    <span className="text-xs font-mono font-bold text-[#2e5a27]">
                      {getDisplayId(detailOrder.order_id)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white text-on-surface rounded-md border border-[#c2c9bb] focus:outline-none"
                    >
                      <option value="pending">Menunggu Konfirmasi (Pending)</option>
                      <option value="confirmed">Dikonfirmasi (Confirmed)</option>
                      <option value="ready">Siap Diambil/Dikirim (Ready)</option>
                      <option value="completed">Selesai (Completed)</option>
                      <option value="cancelled">Dibatalkan (Cancelled)</option>
                    </select>
                    <button
                      onClick={handleUpdateStatus}
                      disabled={statusUpdating || newStatus === detailOrder.status}
                      className="px-3 py-2 bg-[#2E5A27] text-white text-xs font-bold hover:bg-[#1F3D1A] disabled:opacity-50 disabled:cursor-not-allowed rounded flex items-center gap-1 transition-all"
                    >
                      {statusUpdating ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Save size={12} />
                      )}
                      <span>Simpan</span>
                    </button>
                  </div>
                </div>

                {/* Profile & Date info */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded border border-slate-100">
                    <p className="font-bold text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">
                      Pelanggan
                    </p>
                    <p className="font-bold text-on-surface">{detailOrder.users?.name}</p>
                    <p className="font-mono text-on-surface-variant mt-0.5">{detailOrder.users?.phone}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-100">
                    <p className="font-bold text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">
                      Waktu Pemesanan
                    </p>
                    <p className="font-semibold text-on-surface">
                      {new Date(detailOrder.ordered_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                {/* Logistics / GPS Info */}
                {detailOrder.delivery_options && (
                  <div className="bg-slate-50 p-3 rounded border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-on-surface-variant uppercase tracking-wider text-[10px]">
                        Metode Logistik
                      </span>
                      <span className="font-bold text-on-surface text-[11px] capitalize bg-[#2e5a27]/10 text-[#2e5a27] px-2 py-0.5 rounded">
                        {detailOrder.delivery_options.name}
                      </span>
                    </div>

                    {/* Coordinates validation info */}
                    {detailOrder.delivery_options.type === "courier" ? (
                      <div className="flex gap-2 items-center text-on-surface-variant text-[11px] bg-white p-2 rounded border border-slate-100">
                        <MapPin size={14} className="text-[#2e5a27] shrink-0" />
                        <div>
                          <p className="font-semibold">Koordinat GPS Pengantaran:</p>
                          <p className="font-mono text-[10px] mt-0.5">
                            {detailOrder.delivery_lat ?? "-"} , {detailOrder.delivery_lng ?? "-"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-[#2e5a27] font-semibold bg-white p-2 rounded border border-slate-100 text-center">
                        Pesanan ini akan diambil sendiri di pasar oleh pelanggan (Tanpa Ongkir & GPS).
                      </p>
                    )}
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Daftar Rincian Item Produk:
                  </h5>
                  <div className="border border-slate-100 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[9px] font-bold text-on-surface-variant uppercase border-b border-slate-100">
                          <th className="py-2.5 px-4">Nama Produk</th>
                          <th className="py-2.5 px-4 text-center">Qty</th>
                          <th className="py-2.5 px-4 text-right">Harga</th>
                          <th className="py-2.5 px-4 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {detailOrder.order_items?.map((item) => (
                          <tr key={item.order_item_id}>
                            <td className="py-2 px-4 font-medium text-on-surface">
                              {item.products?.name || "Produk dihapus"}
                            </td>
                            <td className="py-2 px-4 text-center font-mono">
                              {item.quantity} {item.products?.unit || ""}
                            </td>
                            <td className="py-2 px-4 text-right font-mono">
                              Rp {item.price_per_unit.toLocaleString("id-ID")}
                            </td>
                            <td className="py-2 px-4 text-right font-mono font-semibold text-on-surface">
                              Rp {item.subtotal.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="font-bold text-on-surface">Total Pembayaran:</span>
                  <span className="font-bold text-base text-[#2e5a27] font-mono">
                    Rp {detailOrder.total_price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-[#c2c9bb]/20">
              <button
                onClick={handleCloseDetail}
                className="px-4 py-2 text-xs font-semibold bg-[#f3f4ed] text-on-surface-variant rounded hover:bg-slate-100"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
