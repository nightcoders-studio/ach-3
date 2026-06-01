"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  AlertTriangle,
  Edit2,
  Trash2,
  PlusSquare,
  Upload,
  X,
  FileText,
  Loader2,
  Package
} from "lucide-react";

interface Product {
  product_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  unit: string;
  min_order_qty: number;
  price_per_unit: number;
  created_at: string;
  updated_by: string | null;
  image_url: string | null;
  current_stock: number;
  sku_id?: string; // Optional field in database
  categories?: {
    name: string;
  } | null;
}

interface Category {
  category_id: string;
  name: string;
  parent_category_id: string | null;
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  
  // Active editing/stock tracking states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);

  // Form states for Product Add/Edit
  const [prodName, setProdName] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodUnit, setProdUnit] = useState("kg");
  const [prodMinOrderQty, setProdMinOrderQty] = useState(1);
  const [prodPrice, setProdPrice] = useState(0);
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Form states for Stock Log
  const [stockQuantity, setStockQuantity] = useState(0);
  const [stockNote, setStockNote] = useState("");
  const [submittingStock, setSubmittingStock] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Fetch Products
      const prodRes = await fetch("/api/products");
      const prodData = await prodRes.json();
      if (prodRes.ok) {
        setProducts(prodData.products || []);
      } else {
        throw new Error(prodData.error || "Gagal memuat produk");
      }

      // Fetch Categories
      const catRes = await fetch("/api/categories");
      const catData = await catRes.json();
      if (catRes.ok) {
        setCategories(catData.categories || []);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal memuat data dari server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Handle image upload to Cloudinary via backend upload API
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah gambar");
      }

      setProdImageUrl(data.url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal mengunggah gambar");
    } finally {
      setUploadingImage(false);
    }
  };

  // Open modal for Adding a new Product
  const openAddModal = () => {
    setEditingProduct(null);
    setProdName("");
    setProdCategoryId(categories[0]?.category_id || "");
    setProdDescription("");
    setProdUnit("kg");
    setProdMinOrderQty(1);
    setProdPrice(0);
    setProdImageUrl("");
    setIsProductModalOpen(true);
  };

  // Open modal for Editing a Product
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdCategoryId(product.category_id || "");
    setProdDescription(product.description || "");
    setProdUnit(product.unit);
    setProdMinOrderQty(product.min_order_qty);
    setProdPrice(product.price_per_unit);
    setProdImageUrl(product.image_url || "");
    setIsProductModalOpen(true);
  };

  // Open modal for Updating Stock
  const openStockModal = (product: Product) => {
    setStockProduct(product);
    setStockQuantity(product.current_stock);
    setStockNote("Restock harian");
    setIsStockModalOpen(true);
  };

  // Save/Update Product form submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmittingProduct(true);

    const token = localStorage.getItem("token");

    const payload = {
      name: prodName,
      category_id: prodCategoryId || null,
      description: prodDescription || null,
      unit: prodUnit,
      min_order_qty: Number(prodMinOrderQty),
      price_per_unit: Number(prodPrice),
      image_url: prodImageUrl || null,
    };

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.product_id}`
        : "/api/products";
      const method = editingProduct ? "PATCH" : "POST";

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
        throw new Error(data.error || "Gagal menyimpan produk");
      }

      setIsProductModalOpen(false);
      fetchInitialData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menyimpan produk");
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Save Stock Log form submit
  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockProduct) return;
    setError("");
    setSubmittingStock(true);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/products/${stockProduct.product_id}/stock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: Number(stockQuantity),
          note: stockNote || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui stok");
      }

      setIsStockModalOpen(false);
      fetchInitialData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal memperbarui stok");
    } finally {
      setSubmittingStock(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (product_id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) return;

    setError("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/products/${product_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus produk");
      }

      fetchInitialData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menghapus produk");
    }
  };

  // Helpers to get short readable ID
  const getDisplayId = (product: Product) => {
    return product.sku_id || `PROD-${product.product_id.substring(0, 8).toUpperCase()}`;
  };

  // Filter products by search and category filter
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getDisplayId(p).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "all" || p.category_id === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate metrics
  const totalProducts = products.length;
  const outOfStockCount = products.filter((p) => p.current_stock === 0).length;
  const lowStockCount = products.filter(
    (p) => p.current_stock > 0 && p.current_stock <= p.min_order_qty
  ).length;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-3">
        <Loader2 size={36} className="animate-spin text-[#2E5A27]" />
        <p className="text-sm font-semibold text-on-surface-variant/80">
          Memuat data produk...
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-lg border border-[#c2c9bb]/40 shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
          <p className="text-[11px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
            Total Produk
          </p>
          <h3 className="text-2xl font-bold text-on-surface mt-1">
            {totalProducts}
          </h3>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-lg border-l-4 border-[#ba1a1a] border-y border-r border-[#c2c9bb]/40 shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
          <p className="text-[11px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
            Stok Habis
          </p>
          <h3 className="text-2xl font-bold text-[#ba1a1a] mt-1">
            {outOfStockCount}
          </h3>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-lg border-l-4 border-amber-500 border-y border-r border-[#c2c9bb]/40 shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
          <p className="text-[11px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
            Stok Menipis
          </p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">
            {lowStockCount}
          </h3>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#c2c9bb]/40 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3 top-3 text-on-surface-variant/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau ID produk..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-[#f3f4ed] text-on-surface rounded-md border border-[#c2c9bb] focus:outline-none focus:border-[#2e5a27]"
          />
        </div>

        {/* Filters and Add Buttons */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end items-center">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-sm bg-white border border-[#c2c9bb] px-2 py-1.5 rounded-md">
            <span className="text-xs font-bold text-on-surface-variant">Kategori:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add Product Button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#2E5A27] text-white rounded-md hover:bg-[#1F3D1A] transition-all"
          >
            <Plus size={14} />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg border border-[#c2c9bb]/40 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f3f4ed]/50 border-b border-[#c2c9bb]/30 text-[10px] font-bold text-on-surface-variant/90 tracking-wider uppercase">
                <th className="py-4 px-6">SKU ID</th>
                <th className="py-4 px-6">Gambar</th>
                <th className="py-4 px-6">Nama Produk</th>
                <th className="py-4 px-6">Kategori</th>
                <th className="py-4 px-6">Harga</th>
                <th className="py-4 px-6">Batas Min</th>
                <th className="py-4 px-6">Stok Saat Ini</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c2c9bb]/30 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-on-surface-variant/60 font-medium">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStock = p.current_stock === 0;
                  const isLowStock = p.current_stock > 0 && p.current_stock <= p.min_order_qty;

                  return (
                    <tr key={p.product_id} className="hover:bg-[#f3f4ed]/20 transition-all duration-100">
                      <td className="py-4 px-6 font-mono font-semibold text-on-surface">
                        {getDisplayId(p)}
                      </td>
                      <td className="py-4 px-6">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-md border border-[#c2c9bb]/30 bg-[#f3f4ed]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md border border-dashed border-[#c2c9bb]/50 bg-[#f3f4ed] flex items-center justify-center text-on-surface-variant/40">
                            <Package size={16} />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-semibold text-on-surface">
                        {p.name}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">
                        {p.categories?.name || "Tanpa Kategori"}
                      </td>
                      <td className="py-4 px-6 font-bold text-on-surface">
                        Rp {p.price_per_unit.toLocaleString("id-ID")} / {p.unit}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">
                        {p.min_order_qty} {p.unit}
                      </td>
                      <td className="py-4 px-6 font-bold text-on-surface">
                        {p.current_stock} {p.unit}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isOutOfStock
                              ? "bg-[#ffdad6] text-[#ba1a1a]"
                              : isLowStock
                              ? "bg-amber-100 text-amber-800"
                              : "bg-[#c5eab8]/45 text-[#4b6b43]"
                          }`}
                        >
                          {isOutOfStock
                            ? "Habis"
                            : isLowStock
                            ? "Menipis"
                            : "Tersedia"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2 justify-center">
                          {/* Add Stock */}
                          <button
                            onClick={() => openStockModal(p)}
                            title="Update Stok"
                            className="p-1.5 rounded hover:bg-[#c5eab8]/20 text-[#2e5a27] transition-all"
                          >
                            <PlusSquare size={16} />
                          </button>
                          
                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit Produk"
                            className="p-1.5 rounded hover:bg-slate-100 text-on-surface-variant transition-all"
                          >
                            <Edit2 size={16} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteProduct(p.product_id, p.name)}
                            title="Hapus Produk"
                            className="p-1.5 rounded hover:bg-[#ffdad6]/20 text-[#ba1a1a] transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product ADD / EDIT Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-[#c2c9bb]/40 shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#c2c9bb]/20">
              <h4 className="text-lg font-bold text-on-surface">
                {editingProduct ? "Edit Detail Produk" : "Tambah Produk Baru"}
              </h4>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-on-surface-variant"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 mt-4">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Contoh: Cabe Merah Keriting"
                  className="w-full px-3 py-2 text-sm bg-[#f3f4ed] text-on-surface rounded-md border border-[#c2c9bb] focus:outline-none focus:border-[#2e5a27]"
                />
              </div>

              {/* Category select */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Kategori
                </label>
                <select
                  value={prodCategoryId}
                  onChange={(e) => setProdCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#f3f4ed] text-on-surface rounded-md border border-[#c2c9bb] focus:outline-none focus:border-[#2e5a27] cursor-pointer"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Deskripsi
                </label>
                <textarea
                  rows={2}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Keterangan kondisi produk atau spesifikasi..."
                  className="w-full px-3 py-2 text-sm bg-[#f3f4ed] text-on-surface rounded-md border border-[#c2c9bb] focus:outline-none focus:border-[#2e5a27]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Unit */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Satuan (Unit) *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    placeholder="Contoh: kg, ikat, kotak"
                    className="w-full px-3 py-2 text-sm bg-[#f3f4ed] text-on-surface rounded-md border border-[#c2c9bb] focus:outline-none focus:border-[#2e5a27]"
                  />
                </div>

                {/* Min Order Qty */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Min. Pesan *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prodMinOrderQty}
                    onChange={(e) => setProdMinOrderQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-[#f3f4ed] text-on-surface rounded-md border border-[#c2c9bb] focus:outline-none focus:border-[#2e5a27]"
                  />
                </div>
              </div>

              {/* Price per unit */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Harga per Satuan (Rupiah) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={prodPrice}
                  onChange={(e) => setProdPrice(Number(e.target.value))}
                  placeholder="Contoh: 15000"
                  className="w-full px-3 py-2 text-sm bg-[#f3f4ed] text-on-surface rounded-md border border-[#c2c9bb] focus:outline-none focus:border-[#2e5a27]"
                />
              </div>

              {/* Image upload with preview */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Foto Produk
                </label>
                <div className="flex gap-4 items-center">
                  {/* Preview box */}
                  <div className="w-16 h-16 rounded-md border border-[#c2c9bb] bg-[#f3f4ed] flex items-center justify-center text-on-surface-variant/40 shrink-0 overflow-hidden">
                    {prodImageUrl ? (
                      <img src={prodImageUrl} alt="Pratinjau" className="w-full h-full object-cover" />
                    ) : (
                      <Package size={24} />
                    )}
                  </div>
                  
                  {/* Upload button wrapper */}
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-white text-xs font-bold text-on-surface border border-[#c2c9bb] rounded-md hover:bg-[#f3f4ed] cursor-pointer transition-all">
                      <Upload size={14} />
                      <span>{uploadingImage ? "Mengunggah..." : "Pilih Berkas Foto"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-on-surface-variant/65 mt-1">
                      Mendukung file gambar PNG, JPG, JPEG (Maks. 2MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-[#c2c9bb]/20">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  disabled={submittingProduct}
                  className="px-4 py-2 text-xs font-semibold bg-[#f3f4ed] text-on-surface-variant rounded hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct || uploadingImage}
                  className="px-4 py-2 text-xs font-semibold bg-[#2E5A27] text-white hover:bg-[#1F3D1A] disabled:opacity-60 rounded flex items-center gap-1.5"
                >
                  {submittingProduct && <Loader2 size={12} className="animate-spin" />}
                  <span>{editingProduct ? "Simpan Perubahan" : "Tambah Produk"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STOCK Log Modal */}
      {isStockModalOpen && stockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-[#c2c9bb]/40 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-[#c2c9bb]/20">
              <div className="min-w-0">
                <h4 className="text-lg font-bold text-on-surface truncate">
                  Update Stok Produk
                </h4>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5 truncate">
                  {stockProduct.name} ({getDisplayId(stockProduct)})
                </p>
              </div>
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-on-surface-variant"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStockSubmit} className="space-y-4 mt-4">
              {/* New Stock Level Quantity */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Kuantitas Stok Baru ({stockProduct.unit}) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  placeholder="Contoh: 100"
                  className="w-full px-3 py-2 text-sm bg-[#f3f4ed] text-on-surface rounded-md border border-[#c2c9bb] focus:outline-none focus:border-[#2e5a27]"
                />
              </div>

              {/* Note / Log reason */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Catatan Update Stok
                </label>
                <textarea
                  rows={2}
                  value={stockNote}
                  onChange={(e) => setStockNote(e.target.value)}
                  placeholder="Contoh: Restock kiriman gudang, Koreksi data selisih fisik"
                  className="w-full px-3 py-2 text-sm bg-[#f3f4ed] text-on-surface rounded-md border border-[#c2c9bb] focus:outline-none focus:border-[#2e5a27]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-[#c2c9bb]/20">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  disabled={submittingStock}
                  className="px-4 py-2 text-xs font-semibold bg-[#f3f4ed] text-on-surface-variant rounded hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingStock}
                  className="px-4 py-2 text-xs font-semibold bg-[#2E5A27] text-white hover:bg-[#1F3D1A] disabled:opacity-60 rounded flex items-center gap-1.5"
                >
                  {submittingStock && <Loader2 size={12} className="animate-spin" />}
                  <span>Simpan Stok Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
