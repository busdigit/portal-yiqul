# SYSTEM ARCHITECTURE DOCUMENT (ARCHITECTURE.md)
## PORTAL YIQUL — Unified Digital Ecosystem Launcher & Dynamic Link Engine

---

| Dokumen | Versi | Status | Pola Arsitektur | Target Platform |
| :--- | :--- | :--- | :--- | :--- |
| **ARCHITECTURE.md** | `v1.0.0` | **APPROVED / ACTIVE** | Hub & Spoke Micro-Launcher | Standalone PWA & GAS Web App |

---

## 1. Ringkasan Arsitektur (Architectural Overview)

**Portal Yiqul** dirancang sebagai *Universal Command Center* dan gerbang peluncur (*launcher hub*) bagi seluruh ekosistem aplikasi digital Yayasan Islam Qudwatul Ummah (Yiqul). Menggunakan arsitektur **Hub & Spoke**:

```
                              ┌────────────────────────────────────────┐
                              │              PORTAL YIQUL              │
                              │    (Hub Launcher & Dynamic Registry)   │
                              └───────────────────┬────────────────────┘
                                                  │
         ┌───────────────────┬────────────────────┼───────────────────┬───────────────────┐
         │                   │                    │                   │                   │
         ▼                   ▼                    ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌───────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│     Tahfidz     │ │     Keuangan    │ │      E-Rapor      │ │   HRIS & SDM    │ │ Sarpras & Humas │
│  (Apps Script / │ │  (Kasir / SPP   │ │ (Sistem Akademik  │ │ (Presensi Asatidz│ │ (Portal Wali,  │
│   Web App)      │ │   Sheets API)   │ │    & Raport)      │ │   & Rapat)      │ │  Inventaris)    │
└─────────────────┘ └─────────────────┘ └───────────────────┘ └─────────────────┘ └─────────────────┘
```

* **The Hub (Portal)**: Bertanggung jawab atas katalogisasi, pencarian instan, filter taksonomi, kurasi favorit pengguna, validasi keamanan tautan (*sanitization*), serta admin manajemen tautan (*Dynamic Link Engine*).
* **The Spokes (Aplikasi Satelit)**: Aplikasi web independen yang telah siap pakai (berupa Google Apps Script Web App, Firebase SPA, custom backend, atau lembar kerja interaktif).

---

## 2. Pemilihan Stack & Prinsip Zero-Bloat

Sesuai mandat `SDLC.md` pasal 1 dan 3, implementasi mengutamakan **Zero-Bloat** dan performa kilat:

| Komponen | Pilihan Teknologi | Alasan Keputusan |
| :--- | :--- | :--- |
| **UI Rendering Engine** | Modern Vanilla ES6+ & Component Architecture | Tanpa *overhead framework* (Zero-Virtual-DOM bloat), First Contentful Paint < 1 detik, bundle < 150 KB. |
| **Styling & Design Tokens** | Pure Modern CSS & Design Tokens (CSS Variables) + Utility Classes | Memberikan fleksibilitas penuh untuk tema *Santri Emerald*, Dark/Light mode instan, dan Bento Grid tanpa kompilasi berat. |
| **State & Data Registry** | LocalStorage Reactive Cache + Built-in Seed Registry | Bekerja instan secara offline/online, tanpa latensi panggilan database berulang, responsifitas < 20ms. |
| **Security Layer** | Strict URL Protocol Sanitizer & HTML Entity Encoder | Mencegah XSS melalui protokol `javascript:` atau parameter berbahaya; otomatis menyematkan `rel="noopener noreferrer"`. |
| **PWA & Offline** | Web App Manifest + Service Worker Cache Shell | Dapat diinstal di Android/iOS (*Add to Home Screen*) dan dibuka dalam kondisi offline. |
| **Backend Deployment** | Dual-Target: Standalone Static Web & Google Apps Script (`gas/Code.gs`) | Fleksibilitas hosting: bisa di GitHub Pages, Vercel, Netlify, atau langsung di Google Drive/GAS Web App. |

---

## 3. Skema Data Baku (Data Contracts)

### 3.1 Skema Kartu Aplikasi (`YiqulAppItem`)
```typescript
interface YiqulAppItem {
  id: string;               // ID unik / slug (e.g., "yiqul-tahfidz")
  title: string;            // Nama aplikasi
  shortDescription: string; // Deskripsi fungsi (maks 100 karakter)
  targetUrl: string;        // URL tujuan valid (HTTPS/HTTP)
  category: string;         // Kategori ("akademik" | "tahfidz" | "keuangan" | "sdm" | "sarpras" | "humas" | "umum")
  iconName: string;         // Nama ikon Lucide / SVG identifier
  customIconUrl?: string;   // URL gambar logo eksternal (opsional)
  targetMode: "_blank" | "_self" | "iframe"; // Cara buka
  status: "active" | "maintenance" | "new" | "coming_soon";
  rolesAllowed: ("public" | "santri" | "asatidz" | "admin" | "superadmin")[];
  displayOrder: number;     // Urutan pengurutan numerik
  isFeatured?: boolean;     // Ditandai aplikasi unggulan
  updatedAt: string;        // Timestamp ISO 8601
}
```

### 3.2 Skema Kategori (`CategoryItem`)
```typescript
interface CategoryItem {
  id: string;               // Slug kategori (e.g., "tahfidz")
  name: string;             // Label tampilan (e.g., "Tahfidz & Quran")
  icon: string;             // Ikon pendukung
  color: string;            // Token warna aksen
  count?: number;           // Jumlah aplikasi terdaftar
}
```

### 3.3 Skema Pengumuman Portal (`PortalAnnouncement`)
```typescript
interface PortalAnnouncement {
  id: string;
  text: string;
  type: "info" | "warning" | "success";
  isActive: boolean;
  linkUrl?: string;
  linkText?: string;
}
```

### 3.4 Skema Banner Gambar Promo (`PromoBannerItem`)
```typescript
interface PromoBannerItem {
  id: string;               // ID banner (e.g., "banner-01")
  title: string;            // Judul banner
  subtitle?: string;        // Keterangan / subjudul
  imageUrl: string;         // URL gambar CDN lh3.googleusercontent.com
  actionUrl?: string;       // URL target tombol aksi
  actionText?: string;      // Label tombol (e.g., "Daftar Online ↗")
  isActive: boolean;        // Status aktif
  displayOrder: number;     // Urutan tampil
  updatedAt: string;        // Timestamp ISO 8601
}
```

### 3.5 Skema Branding Yayasan (`PortalBranding`)
```typescript
interface PortalBranding {
  portalTitle: string;      // Judul portal navbar (e.g., "PORTAL YIQUL")
  portalSubtitle: string;   // Subjudul / tagline
  organizationName: string; // Nama lembaga (e.g., "Yayasan Islam Qudwatul Ummah")
  logoUrl?: string;         // Logo CDN lh3.googleusercontent.com dari Google Drive
  faviconUrl?: string;      // Favicon kustom
}
```

---

## 4. Mekanisme Dynamic Link Engine & Google Drive Storage

1. **Struktur Folder Otomatis di Google Drive**:
   - Backend Google Apps Script (`gas/Code.gs`) secara otomatis memeriksa keberadaan folder induk:
     ```
     PORTAL_YIQUL_STORAGE/
     ├── LOGOS/        (Logo yayasan & branding portal)
     ├── BANNERS/      (Banner gambar promosi & warta beranda)
     ├── APP_ICONS/    (Logo khusus per-aplikasi Bento)
     └── DOCUMENTS/    (Buku panduan PDF, kalender akademik)
     ```
   - Setiap file yang diunggah diberi hak akses publik: `file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)`.
2. **Konversi Direct CDN Anti-CORS (`lh3.googleusercontent.com`)**:
   - Google Drive file ID dikonversi secara otomatis menjadi link direct CDN:
     `https://lh3.googleusercontent.com/d/{FILE_ID}`
   - Format ini tidak memerlukan autentikasi login Google dan dapat langsung di-render pada elemen `<img>` tanpa kendala CORS.
3. **Metode Choose File dari Folder PC**:
   - Komponen `FileUploader.js` membaca berkas pengguna via `FileReader.readAsDataURL()`.
   - Mengirimkan Base64 ke Google Apps Script backend atau menyimpan DataURL lokal jika dalam mode standalone test.
4. **Inisialisasi Pertama (Cold Start)**:
   - Portal membaca `localStorage.getItem("yiqul_apps_registry")`.
   - Jika belum ada, sistem mengimpor data bawaan (*Default Seed Catalog*) yang memuat 18+ aplikasi inti Yayasan Yiqul.
2. **Mutasi Data (Admin CRUD)**:
   - Super Admin dapat menambah, mengubah, mengurutkan, dan menghapus link aplikasi melalui formulir drawer admin.
   - Setiap mutasi memperbarui `localStorage` dan memancarkan event `registryUpdated` untuk me-render ulang Bento Grid tanpa *page reload*.
3. **Pencadangan & Pemulihan (Backup & Restore)**:
   - Tombol **Ekspor JSON** mengunduh file snapshot `yiqul-apps-backup-[timestamp].json`.
   - Tombol **Impor JSON** memvalidasi skema berkas masukan dan menimpa/menggabungkan katalog secara aman.
4. **Link Health Checker**:
   - Fitur ping/head request ringan untuk mengecek apakah URL target merespons secara normal atau berstatus maintenance.

---

## 5. Model Keamanan & Sanitasi (Security Model)

Sesuai `SDLC.md` dan `PRD.md`:
1. **Sanitasi URL**:
   - Hanya skema protokol `https://` dan `http://` yang diizinkan.
   - Skema berbahaya seperti `javascript:`, `data:`, `vbscript:`, atau `file:` ditolak keras saat input formulir dan saat rendering link.
2. **Perlindungan Tab Eksternal**:
   - Seluruh elemen `<a>` dengan `target="_blank"` otomatis ditambahkan atribut `rel="noopener noreferrer"` untuk mencegah kerentanan *reverse tabnabbing*.
3. **Sanitasi Output Teks (XSS Defense)**:
   - Nama aplikasi, deskripsi, dan teks pengumuman di-encode sebelum disisipkan ke DOM.
4. **Sandboxing iFrame Viewer**:
   - Saat membuka aplikasi dalam mode `iframe`, frame dilengkapi atribut `sandbox="allow-scripts allow-forms allow-same-origin allow-popups"` untuk membatasi eksekusi liar.

---

## 6. Strategi Responsif & Standar Tampilan 4 Kondisi

1. **Breakpoint Grid**:
   - Mobile (`375px - 639px`): 1 kolom, full width, swipeable category pill.
   - Tablet (`640px - 1023px`): 2 kolom bento.
   - Desktop (`1024px - 1439px`): 3 kolom bento.
   - Wide Desktop (`1440px+`): 4 kolom bento berpusat (*max-w-7xl*).
2. **4 Kondisi Wajib (Mandatory States)**:
   - **Loading State**: Shimmer skeleton screen 6 kartu saat inisialisasi.
   - **Empty State**: Ilustrasi bersahabat jika pencarian atau filter kategori tidak membuahkan hasil, lengkap dengan tombol `Reset Filter`.
   - **Error State**: Pesan kegagalan informatif disertai tombol `Muat Ulang Katalog`.
   - **Success State**: Grid interaktif dengan animasi transisi mikro halus.

---

## 7. Dual-Deployment Ready

1. **Mode Standalone Web App**:
   - Dijalankan via server web statis apa pun (Node http-server, Nginx, Vercel, Netlify, Cloudflare Pages).
2. **Mode Google Apps Script Web App**:
   - File `gas/Code.gs` menyediakan fungsi `doGet(e)` yang menyajikan `index.html` via `HtmlService.createTemplateFromFile()`.
   - Memungkinkan portal berjalan 100% gratis di infrastruktur Google Workspace sekolah/yayasan tanpa biaya server tahunan.

---

## 8. Arsitektur Landing Page Modern (Techwitpro Style) & Dual-View Router

Portal Yiqul kini mengintegrasikan pengalaman visual dua tingkat (*Dual-View Experience*) yang mulus:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VIEW 1: LANDING PAGE (#/)                       │
│  - Floating Pill Glassmorphism Navbar (Logo, Links, CTA "Masuk Portal")│
│  - Trust Badges (Terakreditasi A, Google 5.0, 18+ Modul Terintegrasi)   │
│  - Bold Sans Headline + Italicized Serif Highlight (Amiri / Serif)    │
│  - Interactive 3D Browser Mockup Card (Live Preview Portal)           │
│  - Stats Counter Bar (4,500+ Civitas, 18+ Apps, <1.2s Akses)          │
│  - Modul Ekosistem Showcase & Alur Hub-and-Spoke                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Klik "Masuk ke Portal Ekosistem ↗"
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   VIEW 2: PORTAL BENTO LAUNCHER (#/portal)             │
│  - Tombol Navigasi "← Kembali ke Beranda"                              │
│  - Header Waktu Real-Time WIB & Kalender Hijriyah Dinamis             │
│  - Banner Promosi Bergambar (Google Drive CDN)                         │
│  - Instant Search (Ctrl+K / /) & Ribbon Kategori                       │
│  - Bento Grid Catalog dengan 4 Mandatory States                       │
│  - Modal iFrame Viewer & Admin Control Hub                             │
└────────────────────────────────────────────────────────────────────────┘
```

Mekanisme peralihan tampilan menggunakan **Hash Routing Ringan (Zero-Bloat)**:
* `window.location.hash === '#/portal'` -> Menampilkan Bento Grid Launcher.
* `window.location.hash === ''` atau `'#/'` -> Menampilkan Landing Page Premium.
* Pengguna dapat mem-bookmark atau membagikan link langsung ke `#/portal` untuk langsung menuju launcher tanpa melewati landing page jika diinginkan.

