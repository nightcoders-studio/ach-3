"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Package,
  Truck,
  CreditCard,
  Users,
  Settings,
  LogOut,
  Search,
  Plus,
  Menu,
  X,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && pathname !== "/login") {
      router.push("/login");
    } else if (token && pathname === "/login") {
      router.push("/");
    } else {
      setLoading(false);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
  };

  if (loading && pathname !== "/login") {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (pathname === "/login") {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center p-6">
        {children}
      </main>
    );
  }

  const navigationItems = [
    { name: "Pesanan", href: "/", icon: ShoppingCart },
    { name: "Stok Barang", href: "/stock", icon: Package },
    { name: "Pengiriman", href: "/delivery-methods", icon: Truck },
    { name: "Metode Pembayaran", href: "/payment-methods", icon: CreditCard },
    { name: "Pelanggan", href: "/customers", icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    const matched = navigationItems.find(
      (item) => item.href !== "/" && pathname.startsWith(item.href),
    );
    if (matched) return matched.name;
    if (pathname.startsWith("/settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <div className="flex min-h-screen bg-surface text-on-background">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-[260px] bg-primary text-white shrink-0 shadow-lg border-r border-outline/10">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            MarketDash
          </h1>
          <p className="text-xs text-white/60 mt-0.5">Dasbor Admin</p>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm rounded-md transition-all duration-150 ${
                  Active
                    ? "bg-[#1F3D1A] text-white border-l-4 border-on-primary-container font-semibold"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon
                  size={18}
                  className={
                    Active ? "text-on-primary-container" : "text-white/75"
                  }
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Add New Product Button */}
          <button className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim text-sm font-semibold rounded-md shadow-sm transition-all duration-150 active:scale-[0.98]">
            <Plus size={16} />
            <span>Tambah Produk Baru</span>
          </button>

          {/* Settings and Logout */}
          <div className="space-y-1">
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-md transition-all duration-150 ${
                isActive("/settings")
                  ? "bg-[#1F3D1A] text-white border-l-4 border-on-primary-container font-semibold"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              }`}
            >
              <Settings
                size={18}
                className={
                  isActive("/settings")
                    ? "text-on-primary-container"
                    : "text-white/75"
                }
              />
              Setelan
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-md text-left transition-all duration-150"
            >
              <LogOut size={18} className="text-white/75" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/50 backdrop-blur-sm">
          <aside className="w-[260px] bg-primary text-white flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  MarketDash
                </h1>
                <p className="text-xs text-white/60 mt-0.5">Admin Dashboard</p>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md hover:bg-white/10 text-white"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const Active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm rounded-md transition-all duration-150 ${
                      Active
                        ? "bg-[#1F3D1A] text-white border-l-4 border-on-primary-container font-semibold"
                        : "text-white/80 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        Active ? "text-on-primary-container" : "text-white/75"
                      }
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-3">
              <button className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim text-sm font-semibold rounded-md shadow-sm transition-all duration-150">
                <Plus size={16} />
                <span>Tambah Produk Baru</span>
              </button>

              <div className="space-y-1">
                <Link
                  href="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-md transition-all duration-150 ${
                    isActive("/settings")
                      ? "bg-[#1F3D1A] text-white border-l-4 border-on-primary-container font-semibold"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Settings
                    size={18}
                    className={
                      isActive("/settings")
                        ? "text-on-primary-container"
                        : "text-white/75"
                    }
                  />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-md text-left transition-all duration-150"
                >
                  <LogOut size={18} className="text-white/75" />
                  Logout
                </button>
              </div>
            </div>
          </aside>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 sm:px-8 bg-white border-b border-outline/10 shadow-sm">
          {/* Left part: Mobile Menu Toggle & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-md hover:bg-surface-container-low md:hidden text-on-surface"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
              {getPageTitle()}
            </h2>
          </div>

          {/* Center/Search bar */}
          <div className="hidden sm:flex items-center max-w-md w-64 md:w-80 relative ml-4">
            <Search
              size={16}
              className="absolute left-3.5 text-on-surface-variant/60"
            />
            <input
              type="text"
              placeholder="Search data..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-surface-container-low text-on-surface rounded-md border border-outline/15 focus:outline-none focus:border-primary-container transition-all"
            />
          </div>

          {/* Right part: Actions and Profile */}
          <div className="flex items-center gap-4">
            {/* Search Toggle for Mobile */}
            <button className="p-2 rounded-full hover:bg-surface-container-low text-on-surface sm:hidden">
              <Search size={18} />
            </button>

            {/* Divider */}
            <div className="w-[1px] h-8 bg-outline/20" />

            {/* Admin Profile Details */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-on-surface leading-tight">
                  Admin User
                </p>
                <p className="text-[11px] font-medium text-on-surface-variant/80">
                  Administrator
                </p>
              </div>
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-outline-variant bg-surface-container-high flex items-center justify-center">
                {/* Custom SVG Avatar resembling the photo in screenshot */}
                <svg
                  viewBox="0 0 32 32"
                  className="w-full h-full text-primary-container fill-current"
                >
                  <path d="M16 4a6 6 0 100 12 6 6 0 000-12zm-8 18c0-4.4 3.6-8 8-8s8 3.6 8 8v2H8v-2z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto bg-surface-container-low/30">
          {children}
        </main>
      </div>
    </div>
  );
}
