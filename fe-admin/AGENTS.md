<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — mart2you

## Project Overview

**mart2you** adalah website pemantauan stok dan pemesanan barang Pasar Induk Aceh. Target pengguna utama adalah pembeli dalam jumlah besar seperti rumah makan, katering, dan usaha serupa. Admin adalah PIC pasar yang mengelola stok, produk, dan pesanan.

---

## Tech Stack

| Layer           | Tech                                 |
| --------------- | ------------------------------------ |
| Framework       | Next.js 16 (App Router)              |
| Language        | TypeScript                           |
| Database        | Supabase (PostgreSQL)                |
| Auth            | Custom — bcrypt + JWT (bearer token) |
| Supabase Client | @supabase/ssr                        |
| Styling         | Tailwind CSS                         |
| Runtime         | Node.js                              |

---

## Roles

| Role       | Deskripsi                                                             |
| ---------- | --------------------------------------------------------------------- |
| `customer` | User yang melakukan pemesanan barang pasar                            |
| `admin`    | PIC pasar yang mengelola stok, produk, pesanan, dan metode pengiriman |

---

## Features

### Customer

- Register dengan nomor telepon dan password (tidak ada email)
- Login dengan nomor telepon dan password
- Lihat daftar produk beserta stok terkini
- Tambah produk ke keranjang
- Checkout dengan memilih metode pengiriman dan metode pembayaran
- Input lokasi GPS saat checkout (koordinat lat/lng)
- Lihat riwayat pesanan sendiri

### Admin

- Login
- Kelola produk: tambah dan edit produk
- Update stok produk via stock log
- Kelola kategori produk (mendukung sub-kategori)
- Kelola metode pengiriman (becak, pickup, ambil sendiri, dll)
- Kelola metode pembayaran (transfer bank, e-wallet, cash, dll)
- Lihat dan update status semua pesanan
- Verifikasi pesanan
- Lihat list pelanggan beserta riwayat transaksi per pelanggan

---

## Database Schema

Semua tabel berada di Supabase PostgreSQL. RLS diaktifkan. Semua operasi dari backend menggunakan service role key.

### Enums

```sql
user_role: customer | admin
order_status: pending | confirmed | ready | completed | cancelled
delivery_type: courier | self_pickup
```

### Tables

**users**
| Column | Type | Notes |
|---|---|---|
| user_id | UUID PK | |
| name | TEXT | |
| phone | TEXT UNIQUE | identifier login |
| password_hash | TEXT | bcrypt |
| role | user_role | default: customer |
| created_at | TIMESTAMPTZ | |

**categories**
| Column | Type | Notes |
|---|---|---|
| category_id | UUID PK | |
| name | TEXT | |
| parent_category_id | UUID FK | nullable, self-referencing |

**products**
| Column | Type | Notes |
|---|---|---|
| product_id | UUID PK | |
| category_id | UUID FK | |
| name | TEXT | |
| description | TEXT | |
| unit | TEXT | kg, ikat, lusin, dll |
| min_order_qty | NUMERIC | |
| price_per_unit | NUMERIC | |
| created_at | TIMESTAMPTZ | |
| updated_by | UUID FK | FK ke users |

**stock_logs**
| Column | Type | Notes |
|---|---|---|
| stock_log_id | UUID PK | |
| product_id | UUID FK | |
| quantity | NUMERIC | |
| recorded_at | TIMESTAMPTZ | |
| updated_by | UUID FK | FK ke users (admin) |
| note | TEXT | nullable |

**delivery_options**
| Column | Type | Notes |
|---|---|---|
| delivery_option_id | UUID PK | |
| name | TEXT | contoh: Becak, Pickup, Ambil Sendiri |
| type | delivery_type | |
| cost | NUMERIC | default: 0 |
| is_available | BOOLEAN | |
| created_by | UUID FK | FK ke users (admin) |
| created_at | TIMESTAMPTZ | |

**payment_options**
| Column | Type | Notes |
|---|---|---|
| payment_option_id | UUID PK | |
| name | TEXT | contoh: Transfer Bank, GoPay, Cash |
| is_available | BOOLEAN | default: true |
| created_by | UUID FK | FK ke users (admin) |
| created_at | TIMESTAMPTZ | |

**orders**
| Column | Type | Notes |
|---|---|---|
| order_id | UUID PK | |
| user_id | UUID FK | |
| delivery_option_id | UUID FK | |
| payment_option_id | UUID FK | |
| delivery_lat | DECIMAL | nullable |
| delivery_lng | DECIMAL | nullable |
| status | order_status | default: pending |
| total_price | NUMERIC | |
| ordered_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |


**order_items**
| Column | Type | Notes |
|---|---|---|
| order_item_id | UUID PK | |
| order_id | UUID FK | |
| product_id | UUID FK | |
| quantity | NUMERIC | |
| price_per_unit | NUMERIC | snapshot harga saat pesan |
| subtotal | NUMERIC | |

**carts**
| Column | Type | Notes |
|---|---|---|
| cart_id | UUID PK | |
| user_id | UUID UNIQUE FK | satu user satu cart |
| created_at | TIMESTAMPTZ | |

**cart_items**
| Column | Type | Notes |
|---|---|---|
| cart_item_id | UUID PK | |
| cart_id | UUID FK | |
| product_id | UUID FK | |
| quantity | NUMERIC | |

---

## Project Structure

```
mart2you/
  app/
    api/
      auth/
        register/
          route.ts
        login/
          route.ts
      health/
        route.ts
    (admin)/         # route group untuk halaman admin
    (customer)/      # route group untuk halaman customer
  lib/
    supabase/
      client.ts      # browser client
      server.ts      # server component client
      admin.ts       # service role client (bypass RLS)
  middleware.ts
  .env.local
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
```

---

## Auth Flow

- Tidak menggunakan Supabase Auth
- Register: simpan `phone` + `password_hash` (bcrypt) ke tabel `users`
- Login: verifikasi password dengan bcrypt, kembalikan JWT
- JWT payload: `{ user_id, role }`
- JWT dikirim sebagai bearer token di header `Authorization`
- Semua route protected diverifikasi JWT di middleware

---

## API Routes

| Method | Path               | Auth   | Deskripsi              |
| ------ | ------------------ | ------ | ---------------------- |
| POST   | /api/auth/register | Public | Register customer baru |
| POST   | /api/auth/login    | Public | Login, return JWT      |
| GET    | /api/health        | Public | Cek koneksi Supabase   |

> Tambahkan route baru ke tabel ini setiap kali membuat endpoint.

---

## Conventions

- Semua operasi database dari server menggunakan `createAdminClient()` dari `lib/supabase/admin.ts`
- `createClient()` dari `lib/supabase/server.ts` digunakan di Server Components
- `createClient()` dari `lib/supabase/client.ts` digunakan di Client Components
- Stok terkini per produk diambil dari `stock_logs` dengan query `ORDER BY recorded_at DESC LIMIT 1`
- `price_per_unit` di `order_items` selalu snapshot harga saat checkout, bukan harga live dari produk
- Koordinat GPS hanya wajib diisi jika `delivery_type` adalah `courier`
- Jangan expose `SUPABASE_SERVICE_ROLE_KEY` ke client side

---

## Admin Dashboard Pages

| Halaman          | Deskripsi                            |
| ---------------- | ------------------------------------ |
| Orders           | List semua pesanan, update status    |
| Stock            | List produk dan update stok          |
| Delivery Methods | Kelola metode pengiriman             |
| Payment Methods  | Kelola metode pembayaran             |
| Customers        | List pelanggan dan riwayat transaksi |
