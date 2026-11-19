# SOFTWARE DEVELOPMENT LIFE CYCLE (SDLC)
## PORTAL YIQUL — Standard Operating Procedure & Vibe Coding Workflow

---

| Dokumen | Versi | Status | Metode Pengembangan | Standar Kualitas |
| :--- | :--- | :--- | :--- | :--- |
| **SDLC.md** | `v1.0.0` | **ACTIVE / BINDING** | Santriverse Agile Vibe Coding | Pre-Deploy Gate & Zero-Bloat |

---

## 1. Filosofi & Metodologi Pengembangan

Pengembangan **Portal Yiqul** mengadopsi standar **Santriverse Agile Vibe Coding**:
1. **Iteratif & Berbasis Gate**: Setiap fitur dikembangkan dalam satuan tugas (*atomic task*) yang jelas, terukur, dan memiliki gerbang verifikasi (*verification gate*) yang ketat sebelum lanjut ke tugas berikutnya.
2. **Dokumen Sebagai Sumber Kebenaran (*Single Source of Truth*)**: Seluruh keputusan arsitektur, desain, dan fitur bersumber dari dokumen resmi (`PRD.md`, `SDLC.md`, `DESIGN.md`, `ARCHITECTURE.md`, dan `TASKS.md`). Tidak ada keputusan yang dikarang secara spontan tanpa pencatatan.
3. **Prinsip Efisiensi Maksimal (*Zero-Bloat*)**: Jangan menambahkan dependensi eksternal (*third-party packages*) jika kapabilitas asli bahasa (native Web APIs / standard libraries) sudah memadai.
4. **Verifikasi Nyata (*Real Evidence*)**: Setiap penyelesaian tugas wajib dibuktikan melalui hasil build, lint, dan uji visual pada dua titik ekstrem resolusi layar: **Mobile (375px)** dan **Desktop (1440px)**.

---

## 2. 7 Tahapan Siklus Hidup (SDLC Stages)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   TAHAP 1    │ ──> │   TAHAP 2    │ ──> │   TAHAP 3    │ ──> │   TAHAP 4    │
│  Kebutuhan   │     │  UI/UX Desain│     │  Arsitektur  │     │ Implementasi │
│   (PRD.md)   │     │ (DESIGN.md)  │     │ (TASKS.md)   │     │ 1-Task/Cycle │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                       │
                                                                       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   TAHAP 7    │ <── │   TAHAP 6    │ <── │   TAHAP 5    │ <── │  Verifikasi  │
│  Monitoring  │     │  Deployment  │     │   Pre-Deploy │     │  Test & Lint │
│ & Maintenance│     │  Produksi    │     │     Gate     │     │ (Mobile/Desk)│
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### Tahap 1: Analisis Kebutuhan & Spesifikasi (PRD)
* Mengumpulkan seluruh inventaris aplikasi Yiqul yang sudah aktif (URL, kegunaan, target audiens).
* Mendefinisikan persona pengguna dan matriks hak akses.
* Mengunci dokumen `PRD.md` sebagai acuan fungsional.

### Tahap 2: Desain Sistem & UI/UX (DESIGN)
* Menentukan *Design Tokens*: Palet warna (Santri Emerald, Slate, Amber), tipografi, elevasi bayangan, dan grid bento.
* Merancang wireframe dan responsivitas untuk Mobile (375px), Tablet (768px), dan Desktop (1440px).
* Menentukan 4 *mandatory states* untuk setiap komponen UI: **Loading, Empty, Error, Success**.
* Mengunci dokumen `DESIGN.md`.

### Tahap 3: Arsitektur & Breakdown Tugas (Architecture & Tasks)
* Menentukan stack teknis (HTML5/Modern JS/Tailwind atau Vue/React/Svelte yang ringan).
* Menentukan format penyimpanan katalog aplikasi (JSON Registry lokal + opsi cloud sync).
* Memecah seluruh implementasi ke dalam `TASKS.md` dengan urutan prioritas yang tidak ambigu.

### Tahap 4: Implementasi Bertahap (Vibe Coding Loop)
* Mengambil tepat **1 tugas** belum selesai dari `TASKS.md`.
* Menjawab 5 pertanyaan sebelum menulis kode:
  1. *Apa task tunggalnya?*
  2. *Apa definisi selesai untuk task ini?*
  3. *File mana saja yang relevan untuk dimodifikasi?*
  4. *Test/verifikasi minimum apa yang membuktikan task selesai?*
  5. *Apakah tindakan ini berisiko merusak data atau kode lain?*
* Membuat perubahan seminimal mungkin (*minimum diff*).
* Dilarang melakukan "sekalian refactor" di luar cakupan task yang sedang dikerjakan.

### Tahap 5: Verifikasi & Pengujian Kualitas
* Menjalankan linting dan formatting otomatis.
* Menjalankan build command dan memastikan exit code `0` tanpa warning kritis.
* Uji responsivitas pada viewport 375px (memastikan tidak ada layout pecah atau horizontal scroll tak diinginkan).
* Uji sanitasi link URL (memastikan aman dari serangan `javascript:` dan atribut `target="_blank"` selalu disertai `rel="noopener noreferrer"`).

### Tahap 6: Pre-Deploy Gate & Rilis Produksi
* Menjalankan checklist pra-rilis (*Pre-Deploy Gate*).
* Memverifikasi ketiadaan file rahasia/kredensial di dalam repositori (`.env`, private keys).
* Deploy ke server/hosting target (GitHub Pages / Cloudflare Pages / Vercel / Apps Script Web App).

### Tahap 7: Operasional, Pemeliharaan & Monitoring
* Memantau ketersediaan aplikasi target (*Link Health Checking* berkala).
* Backup rutin berkas registry data aplikasi.
* Mengumpulkan masukan dari pengguna untuk iterasi sprint berikutnya.

---

## 3. Aturan Keras Pengembang (Hard Rules)

Setiap pengembang (manusia maupun AI assistant) wajib mematuhi aturan baku berikut:

1. **Satu Task Per Putaran**: Jangan pernah mengerjakan lebih dari satu task sekaligus. Selesaikan, uji, laporkan, baru beralih ke task berikutnya.
2. **Kedaulatan Dokumen**: Dokumen repo (`PRD.md`, `SDLC.md`, `DESIGN.md`, `ARCHITECTURE.md`, `TASKS.md`) adalah sumber kebenaran tertinggi. Jika ada pertentangan antara asumsi dan dokumen, pengembangan harus dihentikan untuk konfirmasi.
3. **Larangan Keras Credential Hardcoding**: Kredensial, secret token, atau kunci API hanya boleh disimpan di environment variables. Dilarang keras menaruh token di dalam kode publik atau mencetaknya ke konsol log.
4. **Mandatory 4-State UI**: Setiap komponen penampil data (seperti grid aplikasi, hasil pencarian, daftar link) wajib memiliki tampilan untuk:
   * **Loading State**: Shimmer / Skeleton screen.
   * **Empty State**: Ilustrasi/pesan saat data tidak ditemukan atau kosong.
   * **Error State**: Pesan kesalahan informatif disertai tombol coba lagi (*retry*).
   * **Success State**: Tampilan data normal dengan micro-interaction yang rapi.
5. **Uji Resolusi 375px & Desktop**: Semua kontrol antarmuka harus dapat diklik dengan mudah pada jempol ponsel (area klik minimal 44x44px) dan tidak menyebabkan pergeseran tata letak (*layout shift*). Kontrol yang tidak berfungsi dilarang dipasang.
6. **Keamanan Link Eksternal**: Setiap link pembuka aplikasi yang membuka tab baru wajib memiliki:
   ```html
   <a href="https://target.url" target="_blank" rel="noopener noreferrer">...</a>
   ```
7. **Larangan Perintah Destruktif Tanpa Izin**: Perintah penghapusan direktori, reset git paksa (`git reset --hard`), penghapusan database, atau deploy ke produksi wajib meminta konfirmasi eksplisit dari pengguna.

---

## 4. Standar Git & Konvensi Branching

### 4.1 Struktur Branch
```
main (Production)
  └── staging (Release Candidate / Testing)
        ├── feature/portal-bento-grid
        ├── feature/dynamic-link-crud
        ├── feature/instant-search
        └── fix/mobile-viewport-overflow
```

### 4.2 Format Pesan Commit (Conventional Commits)
Setiap commit harus mengikuti pola:
`<tipe>(<cakupan>): <deskripsi singkat>`

Contoh tipe yang diizinkan:
* `feat(catalog)`: Menambahkan filter kategori pada launcher grid
* `fix(search)`: Memperbaiki debounce pada kotak pencarian instan
* `docs(prd)`: Memperbarui spesifikasi role pengguna di PRD.md
* `style(card)`: Merapikan padding dan shadow kartu bento
* `refactor(registry)`: Menyederhanakan pembacaan file JSON aplikasi
* `test(link)`: Menambahkan test validasi protokol URL target
* `chore(config)`: Memperbarui konfigurasi Tailwind CSS

---

## 5. Gerbang Penyelesaian Tugas (Task Completion Gate)

Sebuah task dalam `TASKS.md` **HANYA** boleh dicentang selesai `[x]` apabila seluruh kriteria berikut terpenuhi secara faktual:

```text
[ ] 1. Implementasi memenuhi 100% kriteria penerimaan (acceptance criteria) task.
[ ] 2. Tidak ada error sintaks, warning fatal, atau broken references.
[ ] 3. Lulus uji responsif pada resolusi 375px (ponsel) dan 1440px (desktop).
[ ] 4. Seluruh interaksi link telah divalidasi dan aman (noopener noreferrer).
[ ] 5. Tidak ada secret / file temporer liar di `git status`.
[ ] 6. Tidak ada perubahan file di luar cakupan task yang sedang dikerjakan.
```

---

## 6. Format Laporan Akhir Siklus (Execution Report)

Setiap kali menyelesaikan satu siklus task, asisten pengembang wajib menyampaikan laporan dengan format standar Santriverse:

```text
Selesai: <Hasil ringkas task yang diselesaikan>.
Berubah: <Daftar file utama yang dimodifikasi>.
Verifikasi: <Command atau metode pengujian> — <Hasil bukti nyata>.
Sisa: <Tidak ada / blocker yang membutuhkan input user>.
```
