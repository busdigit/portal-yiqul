# TASKS BREAKDOWN (TASKS.md)
## PORTAL YIQUL — Implementation Roadmap & Verification Gates

---

| Dokumen | Versi | Status | Metode Kerja | Aturan Utama |
| :--- | :--- | :--- | :--- | :--- |
| **TASKS.md** | `v1.0.0` | **IN PROGRESS** | Santriverse Agile Vibe Coding | 1 Task Per Putaran & Real Evidence |

---

## Ringkasan Progres

- [x] **TASK-01**: Setup Pondasi Proyek, Skema Data Registry & Seed Catalog Yiqul
- [x] **TASK-02**: Design Tokens, Tema Santri Emerald, Dark/Light Mode & Base Shell
- [x] **TASK-03**: Interactive Header, Kalender Masehi/Hijriyah, Jam Digital WIB & Banner Pengumuman
- [x] **TASK-04**: Instant Search Engine, Keyboard Shortcut (`Ctrl+K` / `/`) & Category Ribbon Filter
- [x] **TASK-05**: Bento Grid Launcher, App Card Component, Pin Favorit & 4 Mandatory States
- [x] **TASK-06**: Quick Open Engine & iFrame Modal Viewer for Embedded Apps
- [x] **TASK-07**: Admin Dynamic Link Engine Drawer (CRUD Apps, Health Checker, Backup/Restore JSON)
- [x] **TASK-08**: PWA Shell (Manifest, Service Worker) & Google Apps Script Bridge (`gas/Code.gs`)
- [x] **TASK-09**: Verifikasi Kualitas Menyeluruh (375px & Desktop, Security Sanitizer, Pre-Deploy Gate)
- [x] **TASK-10**: Google Drive Auto-Folder Engine & `lh3.googleusercontent.com` Direct Link Converter (`gas/Code.gs`)
- [x] **TASK-11**: Uploader Client Service, Data Contract Branding, Banner & Role Storage (`src/services/uploader.js`, `storage.js`)
- [x] **TASK-12**: Komponen Visual File Uploader dengan Drag-Drop & Instant Preview (`src/components/FileUploader.js`)
- [x] **TASK-13**: Komponen Banner Gambar Promosi Dinamis di Beranda Depan (`src/components/BannerSlider.js`)
- [x] **TASK-14**: Panel Kontrol Admin Terpadu 5 Tab & Role Management Gate (`src/components/AdminPanel.js`)
- [x] **TASK-15**: Integrasi Penuh Antarmuka & Verifikasi Uji Kualitas Upload Drive (`tests/`)
- [x] **TASK-16**: Rancang Arsitektur Landing Page Bergaya Techwitpro (`ARCHITECTURE.md`, `TASKS.md`)
- [x] **TASK-17**: Floating Glassmorphism Navbar & Cosmic Midnight Styles (`src/styles/landing.css`, `style.css`)
- [x] **TASK-18**: Hero Section Landing Page: Trust Badges, Serif Accent Headline & Interactive Showcase (`src/components/LandingHero.js`)
- [x] **TASK-19**: Seksi Fitur Unggulan, Stats Counter & Alur Satu Pintu (`src/components/LandingFeatures.js`)
- [x] **TASK-20**: View Switcher & Hash Routing (`#/` Landing Page vs `#/portal` Bento Grid) (`src/app.js`, `index.html`)
- [x] **TASK-21**: Verifikasi Mutu Menyeluruh (Desktop & 375px Mobile, Quality Gate) (`tests/`)

---

## Detail Rincian Tugas

### [ ] TASK-01: Setup Pondasi Proyek, Skema Data Registry & Seed Catalog Yiqul
* **Deskripsi**: Menyiapkan struktur proyek, file `package.json`, model data seed aplikasi Yayasan Islam Qudwatul Ummah (18+ aplikasi siap pakai: HRIS, Keuangan, Presensi Rapat, Tahfidz, E-Rapor, Kasir, LMS, dll.), service storage lokal dengan auto-fallback, dan modul sanitasi URL & HTML.
* **Target Berkas**:
  * `package.json`
  * `src/data/defaultApps.js`
  * `src/services/storage.js`
  * `src/services/sanitizer.js`
* **Definisi Selesai (DoD)**:
  * File seed data memuat minimal 18 aplikasi dengan kategori lengkap dan format skema `YiqulAppItem`.
  * Modul `storage.js` dapat membaca, menyimpan, memfilter, dan mereset registry.
  * Modul `sanitizer.js` memvalidasi URL (hanya https/http diizinkan) dan me-reject `javascript:` attack.
* **Verifikasi**: Jalankan test unit berbasis Node.js untuk memastikan seed catalog dan sanitizer bekerja 100%.

---

### [ ] TASK-02: Design Tokens, Tema Santri Emerald, Dark/Light Mode & Base Shell
* **Deskripsi**: Membangun fondasi visual modern berbasis CSS Variables (Santri Emerald `#10B981`, Deep Slate `#0F172A`, Warm Amber `#F59E0B`), typography Plus Jakarta Sans, utility grid, tombol interaktif, toggle mode gelap/terang, dan kerangka dasar `index.html`.
* **Target Berkas**:
  * `index.html`
  * `src/styles/style.css`
* **Definisi Selesai (DoD)**:
  * CSS Variables terdefinisi lengkap sesuai `DESIGN.md`.
  * Tampilan responsif mobile 375px hingga desktop 1440px tanpa horizontal overflow.
  * Mode gelap/terang tersimpan di `localStorage` dan dapat ditoggle mulus.
* **Verifikasi**: Render HTML di browser, verifikasi toggle mode gelap dan variabel warna.

---

### [ ] TASK-03: Interactive Header, Kalender Masehi/Hijriyah, Jam Digital WIB & Banner Pengumuman
* **Deskripsi**: Mengembangkan komponen header portal yang menampilkan logo identitas Yiqul, ucapan salam Bismillah, kalender Masehi dan Hijriyah terhitung dinamis, jam digital WIB berdetik real-time, tombol toggle tema, dan global announcement ticker.
* **Target Berkas**:
  * `src/components/Header.js`
* **Definisi Selesai (DoD)**:
  * Jam WIB berjalan real-time dengan format HH:mm:ss WIB.
  * Kalender Hijriyah dihitung akurat berdasarkan algoritma kalender Islam / Ummul Qura.
  * Banner pengumuman dinamis dapat ditampilkan atau disembunyikan oleh admin.
* **Verifikasi**: Uji fungsionalitas rendering jam dan tanggal di konsol/browser.

---

### [ ] TASK-04: Instant Search Engine, Keyboard Shortcut (`Ctrl+K` / `/`) & Category Ribbon Filter
* **Deskripsi**: Membangun komponen bilah pencarian instan dengan respon ketik real-time (<50ms), shortcut keyboard global (`/` dan `Ctrl+K` / `Cmd+K`), tombol clear text `(X)`, dan ribbon kategori horizontal yang dapat digeser (swipeable) pada mobile.
* **Target Berkas**:
  * `src/components/SearchRibbon.js`
* **Definisi Selesai (DoD)**:
  * Ketik karakter langsung memfilter daftar aplikasi berdasarkan nama, deskripsi, atau tag.
  * Menekan shortcut `/` atau `Ctrl+K` otomatis mengarahkan fokus kursor ke input pencarian.
  * Pill kategori (Semua, Akademik, Tahfidz, Keuangan, SDM, Sarpras, Wali, Favorit) memfilter dengan presisi dan menampilkan indikator aktif.
* **Verifikasi**: Uji respons pencarian dan interaksi shortcut keyboard.

---

### [ ] TASK-05: Bento Grid Launcher, App Card Component, Pin Favorit & 4 Mandatory States
* **Deskripsi**: Membangun Bento Grid Launcher responsif (1 kolom mobile, 2 kolom tablet, 3-4 kolom desktop) beserta komponen kartu aplikasi yang memuat ikon, nama, deskripsi, pill kategori, status dot (Online/Maintenance/Baru), tombol Buka Aplikasi (`rel="noopener noreferrer"`), tombol bintang favorit tersimpan di `localStorage`, serta implementasi penuh 4 Mandatory States: Loading (shimmer skeleton), Empty, Error, dan Success.
* **Target Berkas**:
  * `src/components/AppCard.js`
  * `src/components/BentoGrid.js`
* **Definisi Selesai (DoD)**:
  * 4 states tertangani: Skeleton Loading saat awal, Empty State ramah saat hasil pencarian nihil dengan tombol Reset, Error State informatif, dan Success State dengan animasi kartu.
  * Pin favorit berfungsi dan memindahkan/menandai aplikasi ke kategori Favorit & Quick Row.
  * Semua link eksternal memiliki atribut `rel="noopener noreferrer"` dan `target="_blank"`.
* **Verifikasi**: Uji visual 4 states dan fungsionalitas bookmarking.

---

### [ ] TASK-06: Quick Open Engine & iFrame Modal Viewer for Embedded Apps
* **Deskripsi**: Menyediakan kapabilitas multi-mode pembukaan aplikasi (`_blank` tab baru, `_self` navigasi halaman, dan `iframe` embedded modal viewer) agar pengguna dapat menjalankan web app internal langsung di dalam portal tanpa meninggalkan antarmuka utama.
* **Target Berkas**:
  * `src/components/ModalViewer.js`
* **Definisi Selesai (DoD)**:
  * Aplikasi dengan `targetMode: "iframe"` membuka dialog modal overlay dengan header, tombol refresh, tombol buka di tab baru, dan tombol tutup (`Esc` support).
  * iFrame dilengkapi sandbox security (`allow-scripts allow-forms allow-same-origin allow-popups`).
* **Verifikasi**: Buka aplikasi bertipe modal dan verifikasi penutupan via tombol dan tombol `Esc`.

---

### [ ] TASK-07: Admin Dynamic Link Engine Drawer (CRUD Apps, Health Checker, Backup/Restore JSON)
* **Deskripsi**: Membangun antarmuka admin drawer/modal untuk Super Admin guna menambah, mengubah, mengurutkan, dan menghapus tautan aplikasi di registry secara visual tanpa perlu edit kode sumber. Dilengkapi fitur Ekspor JSON, Impor JSON dengan validasi skema, dan tombol uji kesehatan link (*Link Health Ping*).
* **Target Berkas**:
  * `src/components/AdminDrawer.js`
* **Definisi Selesai (DoD)**:
  * Admin dapat menginput form aplikasi baru atau mengedit aplikasi lama.
  * Perubahan langsung tersimpan ke `localStorage` dan merender ulang grid instan.
  * Fitur Ekspor menghasilkan file JSON yang valid; Impor memvalidasi struktur data dan mencegah corrupt.
* **Verifikasi**: Uji skenario Tambah Link -> Edit -> Ekspor -> Impor -> Hapus.

---

### [ ] TASK-08: PWA Shell (Manifest, Service Worker) & Google Apps Script Bridge (`gas/Code.gs`)
* **Deskripsi**: Menyiapkan dukungan Progressive Web App (`manifest.json` dan `sw.js` cache shell offline) serta skrip backend Google Apps Script (`gas/Code.gs` dan `appsscript.json`) agar portal dapat dihosting di Google Apps Script secara native maupun sebagai PWA mandiri di browser/ponsel.
* **Target Berkas**:
  * `manifest.json`
  * `sw.js`
  * `gas/Code.gs`
  * `gas/appsscript.json`
* **Definisi Selesai (DoD)**:
  * Web app manifest valid dan dapat dikenali browser untuk *Add to Home Screen*.
  * Service worker meng-cache asset statis dan fallback jika offline.
  * File `gas/Code.gs` siap dipakai di Google Apps Script editor dengan `doGet()` melayani UI portal.
* **Verifikasi**: Validasi manifest syntax dan kelayakan PWA.

---

### [ ] TASK-09: Verifikasi Kualitas Menyeluruh (375px & Desktop, Security Sanitizer, Pre-Deploy Gate)
* **Deskripsi**: Melakukan pengujian menyeluruh (regression & quality gate) pada resolusi 375px (Mobile) dan 1440px (Desktop), memeriksa ketiadaan horizontal scrolling, memastikan sanitasi XSS dan URL aman, memastikan konsistensi DoD, dan menyusun laporan penyelesaian proyek.
* **Target Berkas**:
  * Seluruh berkas proyek
* **Definisi Selesai (DoD)**:
  * Lulus seluruh gerbang verifikasi Santriverse SDLC.
  * Tidak ada console error, tidak ada link rentan.
* **Verifikasi**: Uji otomatis lewat Node test script dan audit visual.
