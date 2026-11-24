/**
 * DEFAULT SEED CATALOG
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Memuat katalog awal aplikasi digital yang siap pakai di lingkungan
 * Yayasan Islam Qudwatul Ummah (Yiqul).
 */

export const CATEGORIES = [
  { id: "all", name: "Semua", icon: "LayoutGrid" },
  { id: "favorites", name: "Favorit", icon: "Star" },
  { id: "akademik", name: "Akademik & LMS", icon: "GraduationCap" },
  { id: "tahfidz", name: "Tahfidz & Asrama", icon: "BookOpen" },
  { id: "keuangan", name: "Keuangan & Kasir", icon: "Coins" },
  { id: "sdm", name: "SDM & Presensi", icon: "Users" },
  { id: "sarpras", name: "Sarpras & Aset", icon: "Building2" },
  { id: "wali", name: "Layanan Wali", icon: "HeartHandshake" },
  { id: "umum", name: "Publik & Utility", icon: "Globe" }
];

export const DEFAULT_APPS = [
  {
    id: "yiqul-erapor",
    title: "E-Rapor Santri Digital",
    shortDescription: "Input nilai, cetak buku rapor berkala, dan evaluasi capaian santri.",
    targetUrl: "https://erapor.qudwatulummah.sch.id",
    category: "akademik",
    iconName: "GraduationCap",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["admin", "asatidz"],
    displayOrder: 1,
    isFeatured: true,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-tahfidz",
    title: "Mutaba'ah Tahfidz Quran",
    shortDescription: "Pencatatan setoran hafalan, mutaba'ah halaqah, dan riwayat muroja'ah santri.",
    targetUrl: "https://tahfidz.qudwatulummah.sch.id",
    category: "tahfidz",
    iconName: "BookOpen",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["admin", "asatidz", "santri"],
    displayOrder: 2,
    isFeatured: true,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-kasir",
    title: "Kasir & Billing SPP Yiqul",
    shortDescription: "Sistem tagihan SPP bulanan, kuitansi digital, dan rekap kasir pondok.",
    targetUrl: "https://keuangan.qudwatulummah.sch.id/kasir",
    category: "keuangan",
    iconName: "Coins",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["admin"],
    displayOrder: 3,
    isFeatured: true,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-presensi",
    title: "Presensi Rapat & Asatidz",
    shortDescription: "Absensi digital rapat pimpinan, barcode check-in, dan log presensi pengajar.",
    targetUrl: "https://presensi.qudwatulummah.sch.id",
    category: "sdm",
    iconName: "UserCheck",
    targetMode: "iframe",
    status: "active",
    rolesAllowed: ["admin", "asatidz"],
    displayOrder: 4,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-hris",
    title: "HRIS & Divisi Tilawah UPA",
    shortDescription: "Manajemen data pegawai, cuti, surat tugas, dan performa kinerja asatidz.",
    targetUrl: "https://hris.qudwatulummah.sch.id",
    category: "sdm",
    iconName: "Users",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["admin"],
    displayOrder: 5,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-lms",
    title: "LMS Santri CodeVerse",
    shortDescription: "Portal pembelajaran digital santri, modul BusDigit, dan pengumpulan tugas.",
    targetUrl: "https://lms.qudwatulummah.sch.id",
    category: "akademik",
    iconName: "Laptop",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["admin", "asatidz", "santri"],
    displayOrder: 6,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-keuangan-bot",
    title: "Sistem Keuangan Bot Telegram",
    shortDescription: "Arus kas cepat operasional pesantren dan notifikasi transaksi via bot.",
    targetUrl: "https://t.me/YiqulFinanceBot",
    category: "keuangan",
    iconName: "Send",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["admin"],
    displayOrder: 7,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-wali",
    title: "Portal Wali Santri",
    shortDescription: "Informasi perkembangan santri, riwayat hafalan, kesehatan, dan tagihan infaq.",
    targetUrl: "https://wali.qudwatulummah.sch.id",
    category: "wali",
    iconName: "HeartHandshake",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["public", "santri"],
    displayOrder: 8,
    isFeatured: true,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-sarpras",
    title: "Manajemen Sarpras & Aset",
    shortDescription: "Pencatatan aset gedung, booking aula/ruang pertemuan, dan komplain sarana.",
    targetUrl: "https://sarpras.qudwatulummah.sch.id",
    category: "sarpras",
    iconName: "Building2",
    targetMode: "iframe",
    status: "active",
    rolesAllowed: ["admin", "asatidz"],
    displayOrder: 9,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-perizinan",
    title: "Perizinan & Disiplin Santri",
    shortDescription: "Sistem izin pulang santri, kartu pass digital, dan rekapitulasi asrama.",
    targetUrl: "https://keasramaan.qudwatulummah.sch.id/izin",
    category: "tahfidz",
    iconName: "ShieldCheck",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["admin", "asatidz"],
    displayOrder: 10,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-poskestren",
    title: "Poskestren / Rekam Medis",
    shortDescription: "Pemeriksaan kesehatan santri, stok obat klinik, dan rujukan faskes.",
    targetUrl: "https://poskestren.qudwatulummah.sch.id",
    category: "wali",
    iconName: "Activity",
    targetMode: "iframe",
    status: "maintenance",
    rolesAllowed: ["admin", "asatidz"],
    displayOrder: 11,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-donasi",
    title: "Infaq & Wakaf Digital",
    shortDescription: "Gerbang donasi pembangunan fasilitas santri dan beasiswa yatim dhuafa.",
    targetUrl: "https://donasi.qudwatulummah.sch.id",
    category: "keuangan",
    iconName: "Heart",
    targetMode: "_blank",
    status: "new",
    rolesAllowed: ["public"],
    displayOrder: 12,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-psb",
    title: "PSB Online Yiqul",
    shortDescription: "Pendaftaran Santri Baru, unggah berkas, jadwal tes seleksi & kelulusan.",
    targetUrl: "https://psb.qudwatulummah.sch.id",
    category: "umum",
    iconName: "UserPlus",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["public"],
    displayOrder: 13,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-maktabah",
    title: "Maktabah & Digital Library",
    shortDescription: "Koleksi kitab kuning digital, ensiklopedia Islam, dan peminjaman buku.",
    targetUrl: "https://maktabah.qudwatulummah.sch.id",
    category: "akademik",
    iconName: "Library",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["public", "asatidz", "santri"],
    displayOrder: 14,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-jadwal",
    title: "Kalender & Agenda Yayasan",
    shortDescription: "Kalender tahunan agenda yayasan, jadwal imam rawatib, dan kajian rutin.",
    targetUrl: "https://qudwatulummah.sch.id/agenda",
    category: "umum",
    iconName: "Calendar",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["public"],
    displayOrder: 15,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-vegetable",
    title: "Vegetable Business Management",
    shortDescription: "Pencatatan hasil panen kebun hidroponik dan agrobisnis santripreneur.",
    targetUrl: "https://agro.qudwatulummah.sch.id",
    category: "sarpras",
    iconName: "Sprout",
    targetMode: "iframe",
    status: "new",
    rolesAllowed: ["admin"],
    displayOrder: 16,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-website",
    title: "Portal Web Yayasan Resmi",
    shortDescription: "Website resmi Yayasan Islam Qudwatul Ummah Lebak - Banten.",
    targetUrl: "https://qudwatulummah.sch.id",
    category: "umum",
    iconName: "Globe",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["public"],
    displayOrder: 17,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-helpdesk",
    title: "Pusat Bantuan & IT Support",
    shortDescription: "Tiket keluhan sistem, panduan penggunaan aplikasi, dan kontak IT Support.",
    targetUrl: "https://helpdesk.qudwatulummah.sch.id",
    category: "umum",
    iconName: "HelpCircle",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["public", "asatidz", "santri", "admin"],
    displayOrder: 18,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  }
];

export const DEFAULT_ANNOUNCEMENT = {
  id: "ann-01",
  text: "Selamat Datang di Portal Yiqul — Seluruh aplikasi digital yayasan kini terpusat dalam satu gerbang.",
  type: "info",
  isActive: true,
  updatedAt: "2026-11-19T08:00:00Z"
};


export const DEFAULT_BRANDING = {
  portalTitle: "PORTAL YIQUL",
  portalSubtitle: "Ecosystem Command Center",
  organizationName: "Yayasan Islam Qudwatul Ummah",
  logoUrl: "",
  faviconUrl: ""
};

export const DEFAULT_BANNERS = [
  {
    id: "banner-01",
    title: "Penerimaan Santri Baru (PSB) 2026/2027 Telah Dibuka",
    subtitle: "Pendaftaran santri baru terpadu jenjang MTs & MA Qudwatul Ummah Lebak.",
    imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200&auto=format&fit=crop",
    actionUrl: "https://psb.qudwatulummah.sch.id",
    actionText: "Daftar Online ↗",
    isActive: true,
    displayOrder: 1
  },
  {
    id: "banner-02",
    title: "Wisuda Tahfidz & Haflah Khotmil Quran",
    subtitle: "Apresiasi setoran mutaba'ah hafalan santri dan pembagian sanad tahfidz.",
    imageUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1200&auto=format&fit=crop",
    actionUrl: "https://tahfidz.qudwatulummah.sch.id",
    actionText: "Lihat Jadwal ↗",
    isActive: true,
    displayOrder: 2
  }
];

export const DEFAULT_DOCUMENTS = [
  {
    id: "doc-01",
    title: "Buku Panduan Penggunaan Portal Digital Yiqul",
    category: "Panduan IT",
    fileUrl: "https://qudwatulummah.sch.id/panduan-portal.pdf",
    fileType: "application/pdf",
    fileSize: "2.4 MB",
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "doc-02",
    title: "Kalender Akademik & Jadwal Kegiatan Pesantren 2026/2027",
    category: "Akademik",
    fileUrl: "https://qudwatulummah.sch.id/kalender-akademik-2026.pdf",
    fileType: "application/pdf",
    fileSize: "1.8 MB",
    updatedAt: "2026-11-19T08:00:00Z"
  }
];
