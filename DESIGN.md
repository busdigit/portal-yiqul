# DESIGN SPECIFICATION (DESIGN.md)
## PORTAL YIQUL — Design System, UI/UX Architecture & Bento Grid System

---

| Dokumen | Versi | Status | Pendekatan Desain | Target Responsif |
| :--- | :--- | :--- | :--- | :--- |
| **DESIGN.md** | `v1.0.0` | **APPROVED FOR IMPLEMENTATION** | Modern Islamic Tech Bento Launcher | Mobile (375px) s/d Desktop (1920px) |

---

## 1. Filosofi & Arah Visual Desain

### 1.1 Konsep: "Modern Islamic Tech Bento Launcher"
Portal Yiqul mengusung konsep visual yang memadukan **ketelitian modular bergaya Bento Grid** (seperti Apple Launchpad & Raycast) dengan **estetika Islami modern** (*Santriverse aesthetic*):
* **Bersih & Teratur (*High Clarity & Hierarchy*)**: Setiap aplikasi disajikan dalam kartu mandiri yang rapi, dengan pemisahan kategori yang tegas dan tipografi yang sangat mudah dibaca.
* **Cepat & Responsif (*Zero Latency Vibe*)**: Interaksi mikro yang halus, feedback instan saat pencarian karakter, serta transisi kartu yang ringan (*lightweight micro-interactions*).
* **Nuansa Harmonis**: Dominasi warna hijau zamrud (*Santri Emerald*) yang melambangkan kemakmuran dan integritas kepesantrenan, dipadukan dengan aksen emas hangat (*Warm Amber*) dan latar belakang slate modern (*Deep Slate*) yang tenang.

---

## 2. Design Tokens (Variabel Desain)

### 2.1 Palet Warna (Color Palette)

#### A. Brand & Accent Colors
| Nama Token | Hex Code | Penggunaan |
| :--- | :--- | :--- |
| `--color-primary-50` | `#ECFDF5` | Latar belakang badge aktif / hover state terang |
| `--color-primary-100` | `#D1FAE5` | Border kartu aktif / container highlight |
| `--color-primary-500` | `#10B981` | Brand Emerald utama, aksen tombol utama |
| `--color-primary-600` | `#059669` | Hover tombol utama, ikon aktif |
| `--color-primary-700` | `#047857` | Teks judul utama, status aktif gelap |
| `--color-accent-amber` | `#F59E0B` | Status maintenance, badge update, ikon bintang favorit |
| `--color-accent-gold` | `#D97706` | Aksen penanda khusus, highlight peringatan |

#### B. Neutrals & Surface Colors (Mode Terang & Gelap)
| Token Semantik | Mode Terang (Light) | Mode Gelap (Dark) | Penggunaan |
| :--- | :--- | :--- | :--- |
| `--bg-body` | `#F8FAFC` (Slate 50) | `#0B1120` (Dark Navy) | Latar belakang canvas utama |
| `--bg-surface` | `#FFFFFF` (White) | `#1E293B` (Slate 800) | Latar belakang kartu aplikasi |
| `--bg-surface-hover` | `#F1F5F9` (Slate 100) | `#334155` (Slate 700) | Kartu saat disentuh / kursor melayang |
| `--border-subtle` | `#E2E8F0` (Slate 200) | `#334155` (Slate 700) | Garis pemisah kartu & tabel |
| `--border-focus` | `#059669` (Emerald 600) | `#10B981` (Emerald 500) | Outline navigasi keyboard (a11y) |
| `--text-primary` | `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) | Judul aplikasi, header utama |
| `--text-secondary` | `#475569` (Slate 600) | `#94A3B8` (Slate 400) | Deskripsi aplikasi, keterangan waktu |
| `--text-muted` | `#94A3B8` (Slate 400) | `#64748B` (Slate 500) | Shortcut hint, teks footer |

#### C. Indikator Status Aplikasi (Status Dot & Badge)
* **Active / Online**: Dot `#10B981` (Hijau emerald) dengan animasi *ping pulse* lembut.
* **Maintenance / Pemeliharaan**: Dot `#F59E0B` (Kuning amber) + label "Maintenance".
* **New / Baru Rilis**: Badge `#3B82F6` (Biru) + label "Baru".
* **Internal / Terbatas**: Badge `#8B5CF6` (Ungu) + icon gembok.

---

### 2.2 Tipografi (Typography)

* **Font Utama**: `Plus Jakarta Sans`, `Inter`, atau `system-ui, -apple-system, sans-serif`.
* **Font Khusus Kaligrafi / Aksen Arab**: `Amiri` atau `Traditional Arabic` (untuk teks Bismillah pada banner atas).

| Tingkat Tipografi | Ukuran (Font Size) | Line Height | Weight | Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Display / H1** | `28px` (Mobile) / `36px` (Desktop) | `1.2` | 700 (Bold) | Judul Portal & Selamat Datang |
| **Heading / H2** | `20px` (Mobile) / `24px` (Desktop) | `1.3` | 600 (SemiBold)| Judul Kategori & Modal Header |
| **Card Title / H3** | `16px` (Mobile) / `18px` (Desktop) | `1.4` | 600 (SemiBold)| Nama Aplikasi pada Kartu |
| **Body Regular** | `14px` | `1.5` | 400 (Regular) | Deskripsi singkat aplikasi |
| **Caption / Badge**| `11px` / `12px` | `1.4` | 500 (Medium)  | Tag kategori, status, shortcut |

---

### 2.3 Sistem Jarak & Sudut (Spacing & Radius)

* **Base Unit**: `4px`
* **Spacing Scale**:
  * `xs`: 4px | `sm`: 8px | `md`: 12px | `lg`: 16px | `xl`: 24px | `2xl`: 32px | `3xl`: 48px
* **Border Radius**:
  * `rounded-button`: `10px` (Tombol aksi modern)
  * `rounded-card`: `16px` (Kartu Bento aplikasi)
  * `rounded-pill`: `9999px` (Filter tabs, status badges)
  * `rounded-modal`: `20px` (Dialog popup & drawer)

---

### 2.4 Elevasi & Bayangan (Shadow System)
* **Shadow Rest**: `0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)` (Sangat halus, tidak membuat mata lelah).
* **Shadow Hover**: `0 10px 25px -5px rgba(5, 150, 105, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)` (Sentuhan glow emerald halus).
* **Shadow Modal / Drawer**: `0 25px 50px -12px rgba(15, 23, 42, 0.25)`

---

## 3. Tata Letak Halaman (Page Anatomy & Wireframe)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [LOGO YIQUL] Portal Ekosistem    [🔍 Cari Aplikasi (Ctrl+K)]    [🌙] [👤 Login]│ Top Navigation
├─────────────────────────────────────────────────────────────────────────────┤
│ ﷽  SELAMAT DATANG DI PORTAL DIGITAL YIQUL                                  │
│ 📅 Kamis, 19 Nov 2026 / 9 Jumadil Akhir 1448 H   •   Waktu: 08:46 WIB       │ Hero Banner &
│ 📢 Pengumuman: Update aplikasi E-Rapor Semester Ganjil telah aktif.         │ Global Info
├─────────────────────────────────────────────────────────────────────────────┤
│ [Semua] [⭐ Favorit] [🎓 Akademik] [📖 Tahfidz] [💰 Keuangan] [👥 SDM] [🏛 Sarpras]│ Category Ribbon
├─────────────────────────────────────────────────────────────────────────────┤
│ ⭐ APLIKASI FAVORIT & SERING DIAKSES (Quick Row)                            │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌───────────────────────┐ │
│ │ 📖 Mutaba'ah Tahfidz │ │ 💰 Kasir & SPP Yiqul │ │ 🎓 E-Rapor Santri     │ │ Quick Bento
│ └──────────────────────┘ └──────────────────────┘ └───────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📦 SEMUA KATALOG APLIKASI YIQUL (Total: 24 Aplikasi Terhubung)              │
│                                                                             │
│ ┌───────────────────────────┐  ┌───────────────────────────┐                │
│ │ [ICON] E-Rapor Digital    │  │ [ICON] Mutaba'ah Tahfidz  │                │
│ │ [Akademik] [🟢 Online]     │  │ [Tahfidz] [🟢 Online]     │                │
│ │ Input nilai santri & cetak│  │ Pencatatan setoran hafalan│  ... Bento     │
│ │ buku rapor berkala.       │  │ santri harian & riwayat.  │      Grid      │
│ │ [Buka Aplikasi ↗]    [⭐] │  │ [Buka Aplikasi ↗]    [⭐] │                │
│ └───────────────────────────┘  └───────────────────────────┘                │
├─────────────────────────────────────────────────────────────────────────────┤
│ ➕ [Pasang Link Aplikasi Baru]  (Hanya untuk Administrator)                  │ Admin Quick Bar
├─────────────────────────────────────────────────────────────────────────────┤
│ © 2026 Ekosistem Digital Yiqul • Bantuan IT: it-support@yiqul.id • v1.0.0   │ Footer
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Anatomi Komponen Utama

### 4.1 Kartu Aplikasi (Bento App Card)
Setiap kartu aplikasi dibangun dengan hierarki informasi yang terstandarisasi:

```
┌──────────────────────────────────────────────────────────────────┐
│ [Icon Avatar: 44x44px]                     [⭐ Favorit] [Dot 🟢] │
│                                                                  │
│  Nama Aplikasi Yiqul                                            │
│  🏷 Kategori (Pill Badge)                                        │
│                                                                  │
│  Deskripsi singkat aplikasi (maks. 2 baris, terpotong rapi).     │
│                                                                  │
│ ──────────────────────────────────────────────────────────────── │
│  [🚀 Buka Aplikasi ↗]                     [Mode: Tab Baru / Modal]│
└──────────────────────────────────────────────────────────────────┘
```

* **Icon Avatar**: Ukuran 44x44px dengan latar belakang `primary-50` dan warna icon `primary-600`. Memastikan kontras tinggi.
* **Favorite Toggle**: Tombol bintang di pojok kanan atas, warna abu-abu default, berubah menjadi kuning emas amber saat aktif.
* **Status Dot**: Indikator status aplikasi (Online/Maintenance) di dekat tombol favorit.
* **Tombol Aksi**: Tombol lebar penuh atau kanan bawah dengan label jelas "Buka Aplikasi ↗" yang memicu event pembukaan URL.

### 4.2 Bilah Pencarian Instan (Instant Search Bar)
* Dilengkapi icon kaca pembesar di sisi kiri.
* Placeholder cerdas: `"Ketik nama aplikasi, modul, atau kata kunci... (Tekan '/' untuk fokus)"`.
* Shortcut badge di sisi kanan: `Ctrl + K` (desktop).
* Tombol silang `(X)` untuk membersihkan teks secara instan.

### 4.3 Formulir Admin Pasang Link (Add / Edit App Modal)
Formulir drawer/modal untuk admin memasang URL aplikasi yang sudah jadi:
* **Field 1**: Nama Aplikasi (Contoh: "Dashboard Keuangan Yiqul")
* **Field 2**: URL Target Lengkap (Contoh: `https://keuangan.yiqul.id` atau URL Google Apps Script)
* **Field 3**: Kategori (Pilihan: Akademik, Tahfidz, Keuangan, SDM, Sarpras, Humas, Khusus)
* **Field 4**: Ikon Aplikasi (Pilih dari 30+ pilihan ikon bawaan atau masukkan URL icon kustom)
* **Field 5**: Deskripsi Ringkas (Maksimal 120 karakter)
* **Field 6**: Mode Buka (Pilihan: Buka Tab Baru `_blank`, Buka di Sini `_self`, atau Buka Modal `iframe`)
* **Field 7**: Status (Pilihan: Aktif / Online, Dalam Pemeliharaan / Maintenance, Baru)
* **Action Buttons**: `[Batal]` dan `[Simpan & Pasang Link]`

---

## 5. Spesifikasi 4 Kondisi Antarmuka (The 4 Mandatory States)

Sesuai aturan baku Santriverse SDLC, setiap komponen penyaji data wajib menangani 4 kondisi:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ LOADING      │     │ EMPTY        │     │ ERROR        │     │ SUCCESS      │
│ Shimmer /    │ ──> │ "Tidak ada   │ ──> │ "Gagal Memuat│ ──> │ Tampilan     │
│ Skeleton     │     │ data/hasil"  │     │ Data Link"   │     │ Kartu Bento  │
│ 6 Kartu Anim │     │ + Reset Btn  │     │ + Retry Btn  │     │ Interaktif   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

1. **Loading State**:
   * Menampilkan 6 skeleton cards dengan animasi efek shimmering pulsa (`bg-slate-200 dark:bg-slate-700 animate-pulse`).
   * Tidak ada pergeseran tata letak (*zero Cumulative Layout Shift*).

2. **Empty State**:
   * Ditampilkan jika kata kunci pencarian atau filter kategori tidak menghasilkan satu aplikasi pun.
   * Elemen: Ikon berkas kosong, teks `"Aplikasi tidak ditemukan"`, deskripsi subteks `"Coba periksa ejaan atau ganti filter kategori"`, dan tombol aksi `[Reset Filter]`.

3. **Error State**:
   * Ditampilkan jika koneksi gagal atau berkas registry link rusak.
   * Elemen: Banner berwarna merah lembut / amber, pesan kesalahan teknis yang ramah, dan tombol `[Coba Muat Ulang]`.

4. **Success State**:
   * Daftar kartu aplikasi tampil utuh, animasi fade-in ringan (durasi 150ms).
   * Seluruh tombol klik bekerja presisi dan link terbuka sesuai mode integrasi yang disetel.

---

## 6. Uji Responsivitas & Resolusi Layar

| Viewport | Lebar Layar | Jumlah Kolom Kartu | Perilaku Navigasi |
| :--- | :--- | :--- | :--- |
| **Mobile (Small)** | `375px - 480px` | **1 Kolom** (Full Width) | Filter kategori berupa horizontal swipe/scrollable pill ribbon. Search bar full width sticky. Area sentuh minimal 44x44px. |
| **Mobile / Phablet**| `481px - 640px` | **1 - 2 Kolom** | Grid adaptif, padding samping 16px. |
| **Tablet** | `768px - 1024px` | **2 - 3 Kolom** | Tampilan ribbon filter melebar, tombol shortcut desktop mulai aktif. |
| **Laptop / Desktop**| `1280px - 1440px`| **3 - 4 Kolom** | Bento grid proporsional, hover effects aktif dengan bayangan glow emerald. |
| **Ultra-Wide** | `1920px+` | **4 - 5 Kolom** | Max-width container dipatok pada `1440px` terpusat (*centered container*). |

---

## 7. Standar Aksesibilitas (a11y) & Interaksi Keyboard

1. **Navigasi Keyboard Penuh**:
   * Menekan `/` atau `Ctrl+K`: Langsung mengarahkan kursor (*autofocus*) ke kolom pencarian aplikasi.
   * Menekan `Tab`: Berpindah antar tombol filter dan kartu aplikasi dengan urutan logis.
   * Menekan `Enter` / `Spasi`: Membuka aplikasi yang sedang fokus atau mengaktifkan filter.
   * Menekan `Esc`: Menutup modal preview, menutup drawer admin, atau membersihkan pencarian.
2. **Indikator Fokus yang Jelas**: Elemen yang sedang aktif wajib menampilkan ring fokus warna Emerald: `focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none`.
3. **Screen Reader Ready**: Seluruh ikon memiliki atribut pendukung (misal: `<button aria-label="Jadikan E-Rapor favorit">`).
