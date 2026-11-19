# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## PORTAL YIQUL — Unified Digital Ecosystem Launcher

---

| Dokumen | Versi | Status | Terakhir Diperbarui | Target Rilis |
| :--- | :--- | :--- | :--- | :--- |
| **PRD.md** | `v1.0.0` | **APPROVED / READY FOR DEV** | 19 November 2026 | Q4 2026 / Sprint 1 |

---

## 1. Executive Summary & Latar Belakang

### 1.1 Latar Belakang Masalah
Ekosistem digital **YIQUL** telah memiliki berbagai macam aplikasi web, dashboard operasional, Google Sheets/Apps Script web apps, sistem informasi akademik, keuangan, dan kepesantrenan yang sudah jadi (*ready-to-use*). Namun saat ini:
1. **Fragmentasi Akses**: Pengguna (pimpinan, staf pengajar/asatidz, santri, wali santri, dan admin) harus menghafal dan mencatat puluhan URL/link terpisah untuk setiap aplikasi.
2. **Ketiadaan Hub Terpusat**: Belum ada gerbang satu pintu (*single entry point*) yang menyajikan katalog aplikasi secara terstruktur, rapi, dan mudah dicari.
3. **Kesulitan Pemeliharaan Link**: Ketika sebuah aplikasi diperbarui, berpindah subdomain, atau sedang dalam mode pemeliharaan (*maintenance*), pengguna bingung karena tidak ada status indikator terpusat.
4. **Variasi Hak Akses**: Tidak semua aplikasi relevan untuk semua orang (misal: Keuangan hanya untuk staf bendahara, Mutaba'ah Tahfidz untuk asatidz, Portal Wali untuk orang tua).

### 1.2 Solusi: Portal Yiqul
**Portal Yiqul** adalah web portal launcher modern berbasis arsitektur **Hub & Spoke** yang menjadi gerbang utama (*command center*) bagi seluruh ekosistem aplikasi Yiqul. Portal ini dirancang dengan mekanisme **Dynamic Link Engine** sehingga admin dapat memasang, mengelompokkan, mengaktifkan/menonaktifkan, dan mengatur hak akses link aplikasi yang sudah jadi dengan cepat tanpa perlu deploy ulang kode secara rumit.

---

## 2. Visi, Misi & Tujuan Produk

### 2.1 Visi
Menjadi *Universal Command Center* dan pusat navigasi digital terpadu bagi seluruh civitas dan ekosistem Yiqul yang andal, cepat, aman, dan memikat.

### 2.2 Misi
1. Mengintegrasikan seluruh aplikasi Yiqul yang telah siap digunakan ke dalam satu dashboard navigasi.
2. Menyediakan antarmuka intuitif bergaya *Bento Grid Launcher* yang sangat responsif di perangkat mobile (375px) hingga layar monitor lebar.
3. Memberikan fleksibilitas penuh bagi administrator untuk mengelola metadata aplikasi (nama, deskripsi, logo, URL, kategori, mode buka, dan status).
4. Menghadirkan pengalaman pengguna yang mulus (*seamless launcher experience*) dengan pencarian instan, filter kategori, dan pin aplikasi favorit.

### 2.3 Key Performance Indicators (KPI)
* **Waktu Temu Aplikasi**: < 3 detik bagi pengguna untuk menemukan dan membuka aplikasi yang dituju (menggunakan search atau kategori).
* **Adopsi Pengguna**: 90%+ pengguna mengakses sistem Yiqul melalui Portal Yiqul dalam 1 bulan peluncuran.
* **Kecepatan Buka Halaman (Page Load)**: First Contentful Paint (FCP) < 1.2 detik pada koneksi 4G standar.
* **Zero Broken Link Exposure**: 100% link yang dalam masa *maintenance* terlabeli otomatis dengan visual badge yang jelas.

---

## 3. Profil Pengguna & Persona

| Persona | Peran | Kebutuhan Utama di Portal |
| :--- | :--- | :--- |
| **Super Admin / IT Yiqul** | Pengelola Sistem & Infrastruktur | CRUD katalog aplikasi, kelola kategori, pasang link baru, update URL, monitor kesehatan link, kelola banner pengumuman. |
| **Pimpinan / Mudir / Direksi** | Pengambil Keputusan | Akses cepat ke executive dashboards (Keuangan, Laporan Akademik, Demografi Santri) dalam 1 klik. |
| **Asatidz & Guru** | Pendidik & Pengasuh | Akses langsung ke aplikasi Tahfidz, Presensi Kelas, Mutaba'ah Yaumiyah, dan E-Rapor. |
| **Staf Operasional / TU** | Administrasi & Keuangan | Akses cepat ke Sistem Pembayaran (SPP/Infaq), Inventaris Sarpras, dan Kepegawaian (HR). |
| **Santri & Wali Santri** | Peserta Didik & Orang Tua | Akses publik/terproteksi ke Portal Rapor, Cek Tagihan, Tabungan Santri, dan Jadwal Kegiatan. |

---

## 4. Taksonomi & Modul Aplikasi Yiqul Siap Pasang Link

Portal Yiqul disiapkan untuk memuat dan mengorganisasi kategori modul aplikasi berikut:

```
┌─────────────────────────────────────────────────────────────┐
│                      PORTAL YIQUL                           │
├─────────────────────────────────────────────────────────────┤
│ ├── 1. Akademik & Pendidikan (E-Rapor, LMS, Jadwal Kelas)   │
│ ├── 2. Kepesantrenan & Tahfidz (Setoran Quran, Halaqah)     │
│ ├── 3. Keuangan & Pembayaran (Billing SPP, Kasir, Donasi)   │
│ ├── 4. Keasramaan & Kedisiplinan (Perizinan, Pelanggaran)   │
│ ├── 5. SDM & Kepegawaian (Presensi Asatidz, Payroll, KPI)   │
│ ├── 6. Sarpras & Fasilitas (Inventaris, Aset, Booking Room) │
│ ├── 7. Kesehatan (Poskestren / Rekam Medis Santri)          │
│ ├── 8. Layanan Wali & Humas (Portal Orang Tua, Warta Yiqul) │
│ └── 9. Pengaturan & IT Utility (Backup, Log, Helpdesk)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Kebutuhan Fungsional (Functional Requirements)

### 5.1 FR-01: App Catalog & Bento Grid Launcher
* **FR-01.1**: Menampilkan daftar aplikasi Yiqul dalam bentuk grid kartu (*Bento Grid layout*) yang elegan dan responsif.
* **FR-01.2**: Setiap kartu aplikasi memuat:
  * Nama Aplikasi (e.g., "Yiqul Tahfidz Care")
  * Ikon / Logo Aplikasi (SVG, WebP, atau Icon Library seperti Lucide)
  * Deskripsi Singkat (1–2 kalimat fungsi aplikasi)
  * Tag / Badge Kategori (e.g., `Tahfidz`, `Keuangan`, `Akademik`)
  * Status Badge (`Online / Siap`, `Maintenance`, `New`, `Update`)
  * Tombol Buka Aksi (*Action Trigger*)
  * Tombol Bintang / Bookmark (Favorit)
* **FR-01.3**: Quick Open Mode: Mendukung 3 cara pembukaan aplikasi:
  * `NEW_TAB`: Membuka di tab browser baru (default untuk web app eksternal / Google Apps Script).
  * `SAME_TAB`: Redirect langsung di jendela yang sama.
  * `MODAL_IFRAME`: Membuka aplikasi di dalam dialog modal / embedded window tanpa meninggalkan portal (jika didukung header iframe aplikasi terkait).

### 5.2 FR-02: Instant Search & Multi-Filter Engine
* **FR-02.1**: Global Search bar dengan shortcut keyboard (`/` atau `Ctrl + K` / `Cmd + K`).
* **FR-02.2**: Real-time filtering berbasis karakter yang diketik pengguna (mencari berdasarkan nama aplikasi, deskripsi, dan tag).
* **FR-02.3**: Category Ribbon Filter: Tombol pill horizontal (`Semua`, `Akademik`, `Tahfidz`, `Keuangan`, `SDM`, `Sarpras`, `Wali Santri`, `Favorit`).
* **FR-02.4**: Tampilan *Empty State* yang ramah jika pencarian tidak menemukan hasil, disertai tombol reset filter.

### 5.3 FR-03: Dynamic Link & App Registry Management (Admin Area)
* **FR-03.1**: Antarmuka Admin untuk mengelola daftar aplikasi (*Create, Read, Update, Delete*):
  * Input Nama Aplikasi (string wajib)
  * Input Slug / ID Unik (string alfanumerik)
  * Input URL Target (URL valid HTTPS/HTTP)
  * Input Deskripsi (teks singkat)
  * Pilihan Ikon (Pilihan ikon internal atau custom image URL)
  * Pilihan Kategori (dropdown dinamis)
  * Pilihan Target Buka (`_blank` / `_self` / `iframe`)
  * Pilihan Status (`active`, `maintenance`, `draft`, `restricted`)
  * Input Urutan Tampil (*Display Order / Priority Sort*)
  * Input Role Minimal (`public`, `santri`, `asatidz`, `admin`, `superadmin`)
* **FR-03.2**: Fitur Export & Import konfigurasi registry aplikasi dalam format JSON agar mudah dibackup atau dipindahkan.
* **FR-03.3**: Fitur Link Health Checker sederhana (tombol tes koneksi ke URL target).

### 5.4 FR-04: Header, Widget & Pengumuman Ekosistem
* **FR-04.1**: Header dengan identitas Yiqul, kalender Masehi & Hijriyah dinamis, dan penunjuk waktu lokal.
* **FR-04.2**: Pengumuman Global (*Global Alert Banner*): Tempat admin menempelkan warta penting (misal: "Aplikasi Keuangan sedang tutup buku tgl 30").
* **FR-04.3**: Bagian "Sering Dibuka" (*Frequently Used*) & "Aplikasi Favorit" yang tersimpan di `localStorage` per-browser pengguna.

### 5.5 FR-05: Otentikasi & Otorisasi Ringan (RBAC)
* **FR-05.1**: Mode Publik / Tamu: Menampilkan aplikasi-aplikasi berlabel publik (Portal Berita, Pendaftaran Santri Baru, Donasi).
* **FR-05.2**: Mode Terotentikasi: Login via PIN / Sandi / Google OAuth untuk membuka modul internal (Keuangan, Presensi Pegawai, Pengaturan).
* **FR-05.3**: Role Matrix:
  * `GUEST`: Melihat aplikasi umum/eksternal.
  * `USER / ASATIDZ`: Melihat aplikasi umum + modul pembelajaran & keasramaan.
  * `ADMIN`: Melihat semua aplikasi operasional + akses terbatas edit link.
  * `SUPERADMIN`: Akses penuh CRUD aplikasi, pengaturan portal, dan log.

---

## 6. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Kategori | Spesifikasi & Standar |
| :--- | :--- |
| **Performa** | Bundle size awal < 250 KB (gzipped). Rendering daftar 100+ kartu aplikasi < 100ms. |
| **Responsivitas** | 100% responsif dan teruji pada resolusi 375px (Mobile Portrait), 768px (Tablet), 1024px (Laptop), dan 1440px+ (Desktop). |
| **Keamanan** | - URL Sanitization: Memastikan protokol hanya `https://` atau `http://` terpercaya (mencegah `javascript:` XSS attacks).<br>- Rel Security: Semua link eksternal dengan `target="_blank"` wajib memiliki `rel="noopener noreferrer"`.<br>- Content Security Policy (CSP) & Iframe frame-ancestors aware. |
| **PWA & Offline** | Mendukung Progressive Web App (PWA): manifest.json dan icon terpasang, dapat di-*Add to Home Screen* di Android & iOS. Cache static assets agar shell portal tetap terbuka saat offline. |
| **Aksesibilitas (a11y)**| Memenuhi standar WCAG 2.1 AA: kontras teks minimal 4.5:1, dukungan keyboard tab navigation, dan screen-reader label (`aria-label`). |
| **Kemandirian Stack** | Tidak bergantung pada runtime server yang berat; dapat dihosting pada platform gratis seperti GitHub Pages, Cloudflare Pages, Vercel, Firebase Hosting, atau Google Apps Script Web App. |

---

## 7. Model Data Aplikasi (App Registry Schema)

Setiap entitas aplikasi Yiqul dalam portal direpresentasikan dalam skema standar berikut:

```typescript
interface YiqulAppItem {
  id: string;               // UUID / slug unik (e.g. "yiqul-tahfidz")
  title: string;            // Nama aplikasi (e.g. "Mutaba'ah Tahfidz")
  shortDescription: string; // Ringkasan fungsi (maksimal 90 karakter)
  targetUrl: string;        // URL tujuan (e.g. "https://tahfidz.yiqul.id")
  category: string;         // Kategori (e.g. "tahfidz", "keuangan", "akademik")
  iconName: string;         // Nama icon (e.g. "BookOpen", "Coins", "GraduationCap")
  customIconUrl?: string;   // Opsional: URL gambar/logo custom
  targetMode: "_blank" | "_self" | "iframe"; // Cara buka
  status: "active" | "maintenance" | "new" | "coming_soon";
  rolesAllowed: ("public" | "santri" | "asatidz" | "admin" | "superadmin")[];
  displayOrder: number;     // Urutan pengurutan (integer ascending)
  isFeatured?: boolean;     // Ditandai sebagai aplikasi unggulan di hero
  updatedAt: string;        // Timestamp ISO 8601
}
```

---

## 8. Ruang Lingkup Rilis (Release Phasing)

### Fase 1 — MVP (Core Launcher & Static Registry)
* Setup antarmuka Bento Grid UI dengan Tailwind CSS / Modern CSS.
* Implementasi data store lokal / JSON registry untuk memuat seluruh link aplikasi Yiqul yang sudah jadi.
* Fitur pencarian instan dan tab filter kategori.
* Pin aplikasi favorit (disimpan di `localStorage`).
* Responsive test 375px mobile dan desktop.

### Fase 2 — Admin Engine & Dynamic Storage
* Formulir Admin untuk Tambah/Edit/Hapus link aplikasi langsung dari UI.
* Mekanisme penyimpanan persistent (Google Sheets API / Supabase / Firebase / Cloudflare KV).
* Banner pengumuman dinamis dan indikator status *maintenance*.
* Dialog modal iFrame viewer untuk aplikasi yang mendukung embed.

### Fase 3 — Single Sign-On (SSO) & Advanced Telemetry
* Integrasi auth gateway terpusat (SSO token passing ke URL anak).
* Pelacakan klik aplikasi (*Click Analytics & Most Popular Apps*).
* Ekspor/impor konfigurasi portal dalam 1-klik.

---

## 9. Definisi Selesai (Definition of Done - DoD)
Proyek Fase 1 dianggap selesai jika:
1. Seluruh link aplikasi Yiqul yang ada berhasil dimasukkan dan dapat diklik dengan aman (`rel="noopener noreferrer"`).
2. Pencarian instan dan filter kategori berfungsi tanpa lag (< 50ms respon).
3. Tampilan terverifikasi sempurna pada viewport 375px dan 1440px tanpa horizontal scroll liar.
4. Fitur CRUD / edit konfigurasi link siap pakai.
5. Dokumen `PRD.md`, `SDLC.md`, dan `DESIGN.md` menjadi acuan baku seluruh implementasi.
