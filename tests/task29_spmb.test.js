/**
 * TEST SUITE: TASK-29 SPMB ONLINE DATABASE & REGISTRATION ENGINE
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * Yayasan Islam Qudwatul Ummah (Yiqul)
 */

import {
  getAllRegistrations,
  saveAllRegistrations,
  generateRegistrationNumber,
  registerNewStudent,
  getRegistrationById,
  updateRegistrationStatus,
  deleteRegistration,
  getSpmbSummary,
  exportRegistrationsCsv,
  createWhatsAppConfirmationLink
} from '../src/services/spmbService.js';

console.log('--- RUNNING TASK-29 SPMB ONLINE REGISTRATION ENGINE TESTS ---');

// Mock localStorage for Node test environment
const mockLocalStorage = {};

global.localStorage = {
  getItem: (key) => mockLocalStorage[key] || null,
  setItem: (key, val) => { mockLocalStorage[key] = String(val); },
  removeItem: (key) => { delete mockLocalStorage[key]; },
  clear: () => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); }
};

global.window = {
  dispatchEvent: () => {}
};

// [Test 1] Verifikasi Seed Data Awal SPMB
console.log('[Test 1] Verifikasi Seed Data Awal SPMB...');
const initialList = getAllRegistrations();
if (!Array.isArray(initialList) || initialList.length < 2) {
  throw new Error(`Seed data awal SPMB harus memiliki minimal 2 pendaftar contoh, didapat ${initialList.length}`);
}
console.log(`✅ Test 1 Passed: Seed awal tersedia (${initialList.length} pendaftar).`);

// [Test 2] Verifikasi Pembuatan Nomor Registrasi Unik
console.log('[Test 2] Verifikasi Pembuatan Nomor Registrasi...');
const currentYear = new Date().getFullYear();
const nextRegNum = generateRegistrationNumber(initialList);
if (!nextRegNum.startsWith(`SPMB-${currentYear}-`)) {
  throw new Error(`Format nomor registrasi salah: didapat ${nextRegNum}`);
}
console.log(`✅ Test 2 Passed: Nomor registrasi unik terformat sempurna (${nextRegNum}).`);

// [Test 3] Verifikasi Pendaftaran Santri Baru (registerNewStudent)
console.log('[Test 3] Verifikasi Pendaftaran Santri Baru...');
const testStudent = {
  jenjang: 'SMPT Al-Qudwah',
  jalur: 'Prestasi',
  asrama: 'Boarding',
  namaLengkap: 'Zaidan Ahmad Al-Farisi',
  nisn: '0091827364',
  nikSantri: '3602191503110003',
  jenisKelamin: 'L',
  tempatLahir: 'Lebak',
  tanggalLahir: '2013-03-15',
  asalSekolah: 'SDT Al-Qudwah Lebak',
  riwayatHafalan: '3-5 Juz',
  namaAyah: 'H. Lukman Hakim',
  pekerjaanAyah: 'Wiraswasta/Pedagang',
  namaIbu: 'Hj. Maryam',
  pekerjaanIbu: 'Guru/Dosen',
  penghasilanOrtu: '5 - 10 Juta',
  noWhatsapp: '081399887766',
  hubunganWali: 'Orang Tua Kandung',
  alamatLengkap: 'Jl. Multatuli No. 45',
  kelurahanDesa: 'Muara Ciujung Barat',
  kecamatan: 'Rangkasbitung',
  kotaKabupaten: 'Kab. Lebak',
  provinsi: 'Banten',
  catatanKesehatan: 'Sehat walafiat'
};

const registered = registerNewStudent(testStudent);
if (!registered.id || !registered.id.startsWith(`SPMB-${currentYear}-`)) {
  throw new Error(`ID pendaftar baru tidak valid: ${registered.id}`);
}
if (registered.status !== 'pending') {
  throw new Error(`Status awal pendaftar baru harus pending, didapat: ${registered.status}`);
}
if (registered.namaLengkap !== 'Zaidan Ahmad Al-Farisi') {
  throw new Error(`Nama pendaftar tidak cocok: ${registered.namaLengkap}`);
}
console.log(`✅ Test 3 Passed: Pendaftaran baru berhasil disimpan dengan ID ${registered.id}.`);

// [Test 4] Verifikasi Pencarian Pendaftar Berdasarkan ID (getRegistrationById)
console.log('[Test 4] Verifikasi Pencarian Berdasarkan ID...');
const found = getRegistrationById(registered.id);
if (!found || found.namaLengkap !== 'Zaidan Ahmad Al-Farisi') {
  throw new Error(`Pencarian getRegistrationById gagal menemukan ID ${registered.id}`);
}
console.log('✅ Test 4 Passed: Pencarian pendaftar berdasarkan ID akurat.');

// [Test 5] Verifikasi Pembaruan Status Verifikasi Panitia
console.log('[Test 5] Verifikasi Pembaruan Status Panitia...');
const updateSuccess = updateRegistrationStatus(registered.id, 'accepted', 'Lulus tes seleksi tahfidz & wawancara.');
if (!updateSuccess) {
  throw new Error('updateRegistrationStatus mengembalikan false');
}
const updated = getRegistrationById(registered.id);
if (updated.status !== 'accepted' || !updated.adminNotes.includes('Lulus')) {
  throw new Error(`Pembaruan status gagal: status ${updated.status}, notes: ${updated.adminNotes}`);
}
console.log('✅ Test 5 Passed: Pembaruan status menjadi accepted berhasil.');

// [Test 6] Verifikasi Ringkasan Dasbor SPMB (getSpmbSummary)
console.log('[Test 6] Verifikasi Ringkasan Statistik SPMB...');
const summary = getSpmbSummary();
if (summary.total < 3) {
  throw new Error(`Total ringkasan pendaftar harus minimal 3, didapat ${summary.total}`);
}
if (summary.accepted < 1) {
  throw new Error(`Jumlah accepted harus minimal 1, didapat ${summary.accepted}`);
}
if (summary.smpt < 2) {
  throw new Error(`Jumlah SMPT harus minimal 2, didapat ${summary.smpt}`);
}
console.log(`✅ Test 6 Passed: Ringkasan metrik akurat (Total: ${summary.total}, SMPT: ${summary.smpt}, SMAT: ${summary.smat}, Diterima: ${summary.accepted}).`);

// [Test 7] Verifikasi Ekspor Data ke Format CSV
console.log('[Test 7] Verifikasi Ekspor CSV...');
const csv = exportRegistrationsCsv();
if (!csv.includes('No. Registrasi') || !csv.includes('Zaidan Ahmad Al-Farisi') || !csv.includes('accepted')) {
  throw new Error('Konten CSV tidak lengkap atau tidak memuat data yang diekspor');
}
console.log('✅ Test 7 Passed: Konten ekspor CSV valid dan siap diunduh ke Excel.');

// [Test 8] Verifikasi Tautan Konfirmasi WhatsApp Panitia
console.log('[Test 8] Verifikasi Tautan Konfirmasi WhatsApp...');
const waLink = createWhatsAppConfirmationLink(registered, '6281289123456');
if (!waLink.startsWith('https://wa.me/6281289123456?text=')) {
  throw new Error(`Format tautan WhatsApp tidak valid: ${waLink}`);
}
if (!waLink.includes(encodeURIComponent(registered.id))) {
  throw new Error('Tautan WhatsApp harus menyertakan No. Registrasi santri yang di-encode');
}
console.log('✅ Test 8 Passed: Tautan konfirmasi WhatsApp berhasil dibuat.');

// [Test 9] Verifikasi Penghapusan Data Pendaftar
console.log('[Test 9] Verifikasi Penghapusan Data Pendaftar...');
const initialLen = getAllRegistrations().length;
const deleteSuccess = deleteRegistration(registered.id);
if (!deleteSuccess) {
  throw new Error(`Gagal menghapus pendaftar ${registered.id}`);
}
const afterLen = getAllRegistrations().length;
if (afterLen !== initialLen - 1) {
  throw new Error(`Panjang data setelah penghapusan tidak berkurang: ekspektasi ${initialLen - 1}, didapat ${afterLen}`);
}
console.log('✅ Test 9 Passed: Penghapusan pendaftar berhasil.');

console.log('\n⭐ ALL 9 TESTS PASSED FOR SPMB ONLINE REGISTRATION ENGINE! ⭐');
