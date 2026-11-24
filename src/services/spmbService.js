/**
 * SERVICE: SPMB ONLINE (PENDAFTARAN SANTRI BARU) DATABASE ENGINE
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * Yayasan Islam Qudwatul Ummah (Yiqul)
 * 
 * Mengelola penyimpanan formulir pendaftaran santri baru, pembuatan nomor registrasi,
 * verifikasi status panitia PSB, pencetakan kartu tanda terima, dan ekspor data CSV.
 */

const STORAGE_KEY_SPMB = 'yiqul_spmb_registrations';

/**
 * Daftar Resmi Jenjang Pendidikan Yayasan Islam Qudwatul Ummah (Yiqul)
 */
export const JENJANG_OPTIONS = [
  'Day Care',
  'Play Group',
  'RAT Al-Qudwah',
  'TKT Al-Qudwah',
  'SDT Al-Qudwah',
  'SMPT Al-Qudwah',
  'SMAT Al-Qudwah'
];

/**
 * Daftar pendaftar awal (seed data) agar sistem langsung siap diuji
 */
const DEFAULT_SPMB_SEED = [
  {
    id: 'SPMB-2026-0001',
    createdAt: '2026-11-20T08:30:00.000Z',
    status: 'verified',
    adminNotes: 'Berkas administrasi lengkap, siap mengikuti tes wawancara & tahfidz.',
    jenjang: 'SMPT Al-Qudwah',
    jalur: 'Reguler',
    asrama: 'Boarding',
    namaLengkap: 'Muhammad Fatih Al-Ayyubi',
    nisn: '0112839481',
    nikSantri: '3602191208110001',
    jenisKelamin: 'L',
    tempatLahir: 'Lebak',
    tanggalLahir: '2014-05-12',
    asalSekolah: 'SDT Al-Qudwah Lebak',
    riwayatHafalan: '3-5 Juz',
    namaAyah: 'H. Ahmad Syarifudin, M.Pd.',
    pekerjaanAyah: 'Guru/Dosen',
    namaIbu: 'Hj. Siti Aminah, S.Pd.',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    penghasilanOrtu: '5 - 10 Juta',
    noWhatsapp: '081289123456',
    hubunganWali: 'Orang Tua Kandung',
    alamatLengkap: 'Jl. Raya Rangkasbitung - Pandeglang Km. 4',
    kelurahanDesa: 'Cijoro Pasir',
    kecamatan: 'Rangkasbitung',
    kotaKabupaten: 'Kab. Lebak',
    provinsi: 'Banten',
    catatanKesehatan: 'Tidak ada riwayat alergi / sehat walafiat.'
  },
  {
    id: 'SPMB-2026-0002',
    createdAt: '2026-11-21T10:15:00.000Z',
    status: 'accepted',
    adminNotes: 'Lulus seleksi beasiswa tahfidz 5 juz dengan nilai mumtaz.',
    jenjang: 'SMAT Al-Qudwah',
    jalur: 'Beasiswa_Tahfidz',
    asrama: 'Boarding',
    namaLengkap: 'Aisyah Humaira Azzahra',
    nisn: '0098712345',
    nikSantri: '3602195509090002',
    jenisKelamin: 'P',
    tempatLahir: 'Serang',
    tanggalLahir: '2011-09-25',
    asalSekolah: 'SMPT Al-Qudwah Lebak',
    riwayatHafalan: '> 5 Juz',
    namaAyah: 'Drs. Bambang Irawan',
    pekerjaanAyah: 'PNS/TNI/Polri',
    namaIbu: 'Nur Hasanah',
    pekerjaanIbu: 'Karyawan Swasta',
    penghasilanOrtu: '5 - 10 Juta',
    noWhatsapp: '087788991122',
    hubunganWali: 'Orang Tua Kandung',
    alamatLengkap: 'Komplek Griya Qudwah Indah Blok B3 No. 12',
    kelurahanDesa: 'Muara Ciujung Timur',
    kecamatan: 'Rangkasbitung',
    kotaKabupaten: 'Kab. Lebak',
    provinsi: 'Banten',
    catatanKesehatan: 'Asma ringan saat cuaca dingin.'
  }
];

/**
 * Ambil seluruh data pendaftar SPMB
 * @returns {Array<Object>}
 */
export function getAllRegistrations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SPMB);
    if (!raw) {
      saveAllRegistrations(DEFAULT_SPMB_SEED);
      return [...DEFAULT_SPMB_SEED];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_SPMB_SEED];
  } catch (err) {
    console.error('[SPMB] Gagal membaca data pendaftaran:', err);
    return [...DEFAULT_SPMB_SEED];
  }
}

/**
 * Simpan seluruh pendaftar ke localStorage
 * @param {Array<Object>} list 
 */
export function saveAllRegistrations(list) {
  try {
    localStorage.setItem(STORAGE_KEY_SPMB, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('yiqul:spmb-changed', { detail: { count: list.length } }));
    }
  } catch (err) {
    console.error('[SPMB] Gagal menyimpan data:', err);
  }
}

/**
 * Buat nomor registrasi pendaftar unik baru (Contoh: SPMB-2026-0003)
 * @param {Array<Object>} currentList 
 * @returns {string}
 */
export function generateRegistrationNumber(currentList = []) {
  const currentYear = new Date().getFullYear();
  let maxSeq = 0;

  for (const item of currentList) {
    if (item.id && item.id.startsWith(`SPMB-${currentYear}-`)) {
      const parts = item.id.split('-');
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `SPMB-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
}

/**
 * Daftarkan calon santri baru
 * @param {Object} formData 
 * @returns {Object} Data pendaftar yang tersimpan lengkap dengan nomor registrasi
 */
export function registerNewStudent(formData) {
  const list = getAllRegistrations();
  const regNumber = generateRegistrationNumber(list);

  const newRegistration = {
    id: regNumber,
    createdAt: new Date().toISOString(),
    status: 'pending', // 'pending' | 'verified' | 'accepted' | 'rejected'
    adminNotes: 'Pendaftaran mandiri online via Portal Yiqul. Menunggu verifikasi berkas panitia.',

    // Pilihan Jenjang & Jalur
    jenjang: String(formData.jenjang || 'SDT Al-Qudwah').trim(),
    jalur: String(formData.jalur || 'Reguler').trim(),
    asrama: String(formData.asrama || 'Boarding').trim(),

    // Data Calon Santri
    namaLengkap: String(formData.namaLengkap || '').trim(),
    nisn: String(formData.nisn || '').trim(),
    nikSantri: String(formData.nikSantri || '').trim(),
    jenisKelamin: String(formData.jenisKelamin || 'L').trim(),
    tempatLahir: String(formData.tempatLahir || '').trim(),
    tanggalLahir: String(formData.tanggalLahir || '').trim(),
    asalSekolah: String(formData.asalSekolah || '').trim(),
    riwayatHafalan: String(formData.riwayatHafalan || 'Belum Ada').trim(),

    // Data Orang Tua / Wali
    namaAyah: String(formData.namaAyah || '').trim(),
    pekerjaanAyah: String(formData.pekerjaanAyah || 'Lainnya').trim(),
    namaIbu: String(formData.namaIbu || '').trim(),
    pekerjaanIbu: String(formData.pekerjaanIbu || 'Ibu Rumah Tangga').trim(),
    penghasilanOrtu: String(formData.penghasilanOrtu || '2 - 5 Juta').trim(),
    noWhatsapp: String(formData.noWhatsapp || '').trim(),
    hubunganWali: String(formData.hubunganWali || 'Orang Tua Kandung').trim(),

    // Alamat & Kontak
    alamatLengkap: String(formData.alamatLengkap || '').trim(),
    kelurahanDesa: String(formData.kelurahanDesa || '').trim(),
    kecamatan: String(formData.kecamatan || '').trim(),
    kotaKabupaten: String(formData.kotaKabupaten || '').trim(),
    provinsi: String(formData.provinsi || 'Banten').trim(),
    catatanKesehatan: String(formData.catatanKesehatan || '').trim()
  };

  list.unshift(newRegistration);
  saveAllRegistrations(list);

  return newRegistration;
}

/**
 * Cari pendaftar berdasarkan ID / Nomor Registrasi
 * @param {string} id 
 * @returns {Object|null}
 */
export function getRegistrationById(id) {
  const list = getAllRegistrations();
  return list.find(r => r.id === id) || null;
}

/**
 * Perbarui status verifikasi pendaftar oleh admin
 * @param {string} id - Nomor registrasi
 * @param {string} newStatus - 'pending' | 'verified' | 'accepted' | 'rejected'
 * @param {string} notes - Catatan panitia
 * @returns {boolean}
 */
export function updateRegistrationStatus(id, newStatus, notes = '') {
  const list = getAllRegistrations();
  const index = list.findIndex(r => r.id === id);
  if (index === -1) return false;

  list[index].status = newStatus;
  if (notes) {
    list[index].adminNotes = notes;
  }
  list[index].updatedAt = new Date().toISOString();

  saveAllRegistrations(list);
  return true;
}

/**
 * Hapus data pendaftaran
 * @param {string} id 
 * @returns {boolean}
 */
export function deleteRegistration(id) {
  let list = getAllRegistrations();
  const initialLen = list.length;
  list = list.filter(r => r.id !== id);
  if (list.length === initialLen) return false;

  saveAllRegistrations(list);
  return true;
}

/**
 * Hitung ringkasan statistik pendaftaran untuk dasbor admin
 * @returns {Object}
 */
export function getSpmbSummary() {
  const list = getAllRegistrations();
  return {
    total: list.length,
    daycare: list.filter(r => r.jenjang === 'Day Care').length,
    playgroup: list.filter(r => r.jenjang === 'Play Group').length,
    rat: list.filter(r => r.jenjang === 'RAT Al-Qudwah').length,
    tkt: list.filter(r => r.jenjang === 'TKT Al-Qudwah').length,
    sdt: list.filter(r => r.jenjang === 'SDT Al-Qudwah').length,
    smpt: list.filter(r => r.jenjang === 'SMPT Al-Qudwah').length,
    smat: list.filter(r => r.jenjang === 'SMAT Al-Qudwah').length,
    mts: list.filter(r => r.jenjang === 'SMPT Al-Qudwah' || r.jenjang === 'MTs').length,
    ma: list.filter(r => r.jenjang === 'SMAT Al-Qudwah' || r.jenjang === 'MA').length,
    pending: list.filter(r => r.status === 'pending').length,
    verified: list.filter(r => r.status === 'verified').length,
    accepted: list.filter(r => r.status === 'accepted').length,
    rejected: list.filter(r => r.status === 'rejected').length
  };
}

/**
 * Ekspor seluruh data pendaftar ke format CSV (Excel)
 * @returns {string} String konten CSV
 */
export function exportRegistrationsCsv() {
  const list = getAllRegistrations();
  const headers = [
    'No. Registrasi',
    'Tanggal Daftar',
    'Status',
    'Jenjang',
    'Jalur',
    'Asrama',
    'Nama Lengkap Santri',
    'NISN',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Asal Sekolah',
    'Riwayat Hafalan',
    'Nama Ayah',
    'Pekerjaan Ayah',
    'Nama Ibu',
    'Pekerjaan Ibu',
    'Penghasilan Ortu',
    'No. WhatsApp',
    'Alamat Lengkap',
    'Kota/Kabupaten',
    'Catatan Panitia'
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = list.map(r => [
    escapeCsv(r.id),
    escapeCsv(new Date(r.createdAt).toLocaleDateString('id-ID')),
    escapeCsv(r.status),
    escapeCsv(r.jenjang),
    escapeCsv(r.jalur),
    escapeCsv(r.asrama),
    escapeCsv(r.namaLengkap),
    escapeCsv(r.nisn),
    escapeCsv(r.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'),
    escapeCsv(r.tempatLahir),
    escapeCsv(r.tanggalLahir),
    escapeCsv(r.asalSekolah),
    escapeCsv(r.riwayatHafalan),
    escapeCsv(r.namaAyah),
    escapeCsv(r.pekerjaanAyah),
    escapeCsv(r.namaIbu),
    escapeCsv(r.pekerjaanIbu),
    escapeCsv(r.penghasilanOrtu),
    escapeCsv(r.noWhatsapp),
    escapeCsv(r.alamatLengkap),
    escapeCsv(r.kotaKabupaten),
    escapeCsv(r.adminNotes)
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Buat tautan konfirmasi WhatsApp ke panitia PSB yayasan
 * @param {Object} reg - Data pendaftaran
 * @param {string} committeePhone - Nomor WA Panitia
 * @returns {string}
 */
export function createWhatsAppConfirmationLink(reg, committeePhone = '6281289123456') {
  const message = `Assalamu'alaikum Panitia PSB Yayasan Islam Qudwatul Ummah,

Saya ingin mengonfirmasi pendaftaran santri baru online:
*No. Registrasi:* ${reg.id}
*Nama Calon Santri:* ${reg.namaLengkap}
*Jenjang Pilihan:* ${reg.jenjang} (${reg.jalur})
*Asal Sekolah:* ${reg.asalSekolah}
*Nama Orang Tua:* ${reg.namaAyah} / ${reg.namaIbu}
*No. Kontak:* ${reg.noWhatsapp}

Mohon arahan terkait jadwal verifikasi berkas & tes seleksi selanjutnya. Terima kasih.
Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;

  return `https://wa.me/${committeePhone}?text=${encodeURIComponent(message)}`;
}
