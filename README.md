# PORTAL YIQUL — Unified Digital Ecosystem Launcher

> **Universal Command Center & Dynamic Link Launcher Yayasan Islam Qudwatul Ummah (Yiqul)**  
> Berbasis arsitektur **Hub & Spoke** dengan **Bento Grid UI**, **Instant Search**, **PWA Offline Shell**, dan **Google Apps Script Bridge**.

---

## 🌟 Fitur Utama

1. **Landing Page Modern Bergaya Techwitpro (Dual-View Architecture)**:
   - **Floating Glassmorphism Pill Navbar**: Navigasi mengambang berpusat dengan tombol aksi pill putih *Techwitpro Style* (`Masuk Portal ↗`).
   - **Trust & Review Badges**: Google Reviews 5.0 ⭐⭐⭐⭐⭐, Akreditasi A Unggul, 18+ Sistem Terintegrasi.
   - **Split Typography Headline**: Perpaduan Sans-serif tebal modern dengan aksen *Serif Italic* elegan (*Santri Emerald Glow*).
   - **Interactive 3D Browser Mockup**: Frame peramban modern yang menampilkan preview langsung kartu aplikasi Bento dengan tautan cepat ke launcher.
   - **Stats Counter & 6 Pilar Ekosistem**: Ringkasan statistik (4,500+ civitas, 18+ apps, <1.2s akses) dan showcase 6 pilar layanan.
   - **Seamless Zero-Bloat Hash Routing**: Beralih mulus antara Landing Page (`#/`) dan Portal Launcher (`#/portal`).
2. **Bento Grid Launcher Modern**: Antarmuka modular bergaya Apple Launchpad & Raycast dengan nuansa Islami modern (*Santri Emerald* `#10B981` & *Warm Amber* `#F59E0B`).
3. **Pusat Kendali Admin Terpadu (5 Tab Control Center)**:
   - Dilindungi **Role & PIN Gate** (PIN Standar: `1234`, dapat diubah sewaktu-waktu).
   - **Tab 1: Kelola Aplikasi**: Pasang link, atur mode buka (tab/modal), dan **Choose File Logo Aplikasi dari PC**.
   - **Tab 2: Banner Gambar**: Pasang banner promosi/agenda dengan **Choose File Banner Gambar dari PC** yang tampil di beranda depan.
   - **Tab 3: Logo & Branding**: Pasang logo yayasan, atur judul & tagline dengan **Choose File Logo Yayasan dari PC**.
   - **Tab 4: Dokumen & Unduhan**: Upload buku panduan / kalender akademik dengan **Choose File Dokumen PDF dari PC**.
   - **Tab 5: Hak Akses**: Ubah PIN, ganti peran (Superadmin, Admin, Asatidz, Tamu), ekspor & impor database JSON.
3. **Penyimpanan Otomatis di Google Drive (Auto-Folder Engine)**:
   - Backend `gas/Code.gs` otomatis membuat struktur folder di Google Drive yayasan:
     - `PORTAL_YIQUL_STORAGE/LOGOS/`
     - `PORTAL_YIQUL_STORAGE/BANNERS/`
     - `PORTAL_YIQUL_STORAGE/APP_ICONS/`
     - `PORTAL_YIQUL_STORAGE/DOCUMENTS/`
   - Berkas diatur hak akses publik `ANYONE_WITH_LINK` (View).
   - Gambar otomatis dikonversi ke **Direct CDN Google Anti-CORS**: `https://lh3.googleusercontent.com/d/{FILE_ID}` sehingga langsung tampil di browser tanpa kendala autentikasi Google.
4. **Metode Choose File (Drag & Drop + Instant Preview)**:
   - Pilih berkas langsung dari folder laptop/PC atau smartphone.
   - Preview visual seketika sebelum berkas diunggah.
5. **Instant Search & Multi-Filter**: Pencarian instan (<50ms respon) dengan shortcut keyboard (`/` atau `Ctrl + K`) serta ribbon kategori geser.
4. **Header Interaktif & Penanggalan Dinamis**:
   - Jam digital WIB berdetik real-time.
   - Kalender Masehi dan Hijriyah otomatis terhitung akurat.
   - Banner warta / pengumuman terpusat dari pimpinan yayasan.
5. **Keamanan Ketat (Strict Security)**:
   - Sanitasi protokol URL ketat (menolak keras serangan `javascript:`, `data:`, `vbscript:`).
   - Seluruh link eksternal otomatis diproteksi `rel="noopener noreferrer"`.
   - Pencegahan XSS teks otomatis melalui HTML entity encoder.
6. **4 Mandatory States**:
   - **Loading State**: Shimmer skeleton screen 6 kartu.
   - **Empty State**: Ilustrasi ramah ketika pencarian tidak ditemukan + tombol Reset.
   - **Error State**: Banner informatif dan tombol Coba Muat Ulang.
   - **Success State**: Grid interaktif dengan animasi fade-in.
7. **PWA & Offline Ready**:
   - Dilengkapi `manifest.json` dan `sw.js` (Service Worker).
   - Dapat diinstal di layar beranda (*Add to Home Screen*) di ponsel Android/iOS.
8. **Dual-Deployment**:
   - Dapat dijalankan sebagai aplikasi web mandiri (Node.js, Vercel, Cloudflare, GitHub Pages).
   - Dapat dideploy ke **Google Apps Script** (`gas/Code.gs` dan `gas/appsscript.json`) untuk hosting gratis di Google Workspace yayasan.

---

## 📁 Struktur Direktori

```
APLIKASI PORTAL YIQUL/
├── PRD.md                     # Dokumen Kebutuhan Produk (v1.0.0)
├── DESIGN.md                  # Spesifikasi Desain & Design Tokens (v1.0.0)
├── SDLC.md                    # Standar Operasional & Vibe Coding (v1.0.0)
├── ARCHITECTURE.md            # Spesifikasi Arsitektur Sistem (v1.0.0)
├── TASKS.md                   # Roadmap & Task Completion Gate (v1.0.0)
├── index.html                 # Antarmuka Utama Portal (HTML5 Semantic)
├── manifest.json              # Konfigurasi PWA Web App Manifest
├── sw.js                      # Service Worker Offline Shell Caching
├── server.js                  # Local Development Server (Zero-Bloat Native Node.js)
├── package.json               # Konfigurasi Proyek & Test Script
├── src/
│   ├── app.js                 # Master Controller & Bootstrapper
│   ├── data/
│   │   └── defaultApps.js     # Seed Catalog 18+ Aplikasi Inti Yiqul
│   ├── services/
│   │   ├── storage.js         # Reactive LocalStorage & Data Registry Engine
│   │   └── sanitizer.js       # URL Protocol & XSS Security Sanitizer
│   ├── components/
│   │   ├── Header.js          # Jam WIB, Kalender Masehi/Hijriyah & Pengumuman
│   │   ├── SearchRibbon.js    # Instant Search Engine & Category Ribbon
│   │   ├── AppCard.js         # Komponen Kartu Bento & Keamanan Link
│   │   ├── BentoGrid.js       # Bento Grid Controller & 4 Mandatory States
│   │   ├── ModalViewer.js     # iFrame Embedded Window Viewer
│   │   └── AdminDrawer.js     # Form Admin CRUD Link & Backup/Restore JSON
│   └── styles/
│       └── style.css          # Design Tokens, CSS Variables & Responsivitas
├── gas/
│   ├── Code.gs                # Google Apps Script Web App Deployment Bridge
│   └── appsscript.json        # Apps Script Manifest (V8 Engine)
└── tests/
    ├── run-all.js             # Master Quality Verification Gate Runner
    ├── task01.test.js         # Verifikasi Seed Catalog, Storage CRUD & Sanitizer
    ├── task03.test.js         # Verifikasi Penanggalan Hijriyah & Jam WIB
    ├── task04.test.js         # Verifikasi Filter Kategori & Instant Search
    └── task05.test.js         # Verifikasi Kartu Bento & Sanitasi XSS
```

---

## 🚀 Cara Menjalankan & Menguji

### 1. Menjalankan Server Lokal
Cukup jalankan perintah berikut di terminal:
```bash
node server.js
```
Buka browser di: **`http://localhost:3000`**

### 2. Menjalankan Rangkaian Pengujian (Quality Gate)
Untuk memverifikasi seluruh fungsi, keamanan, dan integritas berkas:
```bash
node tests/run-all.js
```

---

## ⌨️ Shortcut Keyboard

| Shortcut | Aksi |
| :--- | :--- |
| **`/`** atau **`Ctrl + K`** | Langsung fokus ke kotak pencarian aplikasi |
| **`Esc`** | Membersihkan pencarian / Menutup modal viewer / Menutup admin drawer |
| **`Tab`** | Navigasi keyboard antar kartu aplikasi dan filter |

---

## 👥 Tim Pengembang
* **Yayasan Islam Qudwatul Ummah Lebak - Banten**
* Divisi Teknologi & Sistem Informasi Digital
