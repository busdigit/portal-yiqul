/**
 * TEST RUNNER - TASK-30
 * Verifikasi Integrasi Penuh Fitur Jadwal & Agenda Kegiatan Yayasan (CRUD Storage, Admin Panel Tab 7, dan Modal Display)
 */

import assert from 'node:assert';
import fs from 'node:fs';
import { 
  getSchedules, 
  addSchedule, 
  updateSchedule, 
  deleteSchedule, 
  resetSchedules, 
  exportRegistryJson, 
  importRegistryJson 
} from '../src/services/storage.js';

console.log('--- RUNNING TASK-30 JADWAL TESTS ---');

// Test 1: Verifikasi Seed Jadwal Awal
console.log('[Test 1] Verifikasi Seed Jadwal Awal Yayasan...');
resetSchedules();
const initialSchedules = getSchedules();
assert.ok(Array.isArray(initialSchedules), 'getSchedules() harus mengembalikan array');
assert.ok(initialSchedules.length >= 4, 'Seed awal jadwal harus memuat minimal 4 agenda');

const wisuda = initialSchedules.find(s => s.title.includes('Wisuda Tahfidz'));
assert.ok(wisuda, 'Harus ada agenda Wisuda Tahfidz');
assert.strictEqual(wisuda.category, 'Tahfidz');
console.log('✅ Test 1 Passed: Seed awal jadwal valid dan lengkap (' + initialSchedules.length + ' agenda).');

// Test 2: Verifikasi Tambah Jadwal Baru (Create)
console.log('[Test 2] Verifikasi Tambah Jadwal Baru...');
const newSchedule = addSchedule({
  title: 'Kajian Bulanan & Doa Bersama Wali Santri',
  category: 'Yayasan',
  date: '2026-11-29',
  time: '09:00 - 11:30 WIB',
  location: 'Masjid Utama Pesantren',
  description: 'Kajian tematik tafsir Al-Qur\'an bersama Mudir Pesantren.',
  speakerOrHost: 'KH. Pimpinan Yayasan'
});

assert.ok(newSchedule && newSchedule.id, 'Jadwal baru harus memiliki ID unik');
const listAfterAdd = getSchedules();
const found = listAfterAdd.find(s => s.id === newSchedule.id);
assert.ok(found, 'Jadwal baru harus tersimpan dalam storage');
assert.strictEqual(found.title, 'Kajian Bulanan & Doa Bersama Wali Santri');
console.log('✅ Test 2 Passed: Berhasil menambahkan agenda baru (' + found.id + ').');

// Test 3: Verifikasi Update Jadwal (Update)
console.log('[Test 3] Verifikasi Pembaruan Jadwal...');
const updated = updateSchedule(newSchedule.id, {
  time: '08:30 - 11:30 WIB',
  location: 'Auditorium Utama Lantai 2'
});

assert.ok(updated, 'Update jadwal harus mengembalikan data yang diperbarui');
assert.strictEqual(updated.time, '08:30 - 11:30 WIB');
assert.strictEqual(updated.location, 'Auditorium Utama Lantai 2');
console.log('✅ Test 3 Passed: Pembaruan jadwal berjalan presisi.');

// Test 4: Verifikasi Hapus Jadwal (Delete)
console.log('[Test 4] Verifikasi Penghapusan Jadwal...');
const deleteResult = deleteSchedule(newSchedule.id);
assert.strictEqual(deleteResult, true);
const listAfterDelete = getSchedules();
assert.strictEqual(listAfterDelete.some(s => s.id === newSchedule.id), false, 'Jadwal yang dihapus tidak boleh ada lagi');
console.log('✅ Test 4 Passed: Penghapusan jadwal berhasil.');

// Test 5: Verifikasi Ekspor & Impor JSON
console.log('[Test 5] Verifikasi Ekspor & Impor JSON Jadwal...');
const exported = exportRegistryJson();
assert.ok(exported.includes('"schedules"'), 'Ekspor JSON harus menyertakan array schedules');

const importResult = importRegistryJson(exported);
assert.strictEqual(importResult.success, true, 'Impor JSON harus berhasil');
console.log('✅ Test 5 Passed: Backup & Restore jadwal via JSON valid.');

// Test 6: Verifikasi Elemen HTML dan Modal Jadwal
console.log('[Test 6] Verifikasi Integrasi HTML Modal & Tab Admin...');
const indexHtml = fs.readFileSync('index.html', 'utf-8');
assert.ok(indexHtml.includes('id="jadwal-modal"'), 'index.html harus memuat #jadwal-modal');
assert.ok(indexHtml.includes('data-tab="schedules"'), 'index.html harus memuat tab 7. Jadwal & Agenda');
assert.ok(indexHtml.includes('id="spmb-modal"'), 'index.html harus memuat #spmb-modal');
console.log('✅ Test 6 Passed: Antarmuka modal jadwal & tab admin 7 terintegrasi rapi di HTML.');

console.log('--- ALL TASK-30 JADWAL TESTS PASSED SUCCESSFULLY! ---');
