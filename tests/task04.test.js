/**
 * TEST RUNNER - TASK-04
 * Verifikasi Logika Filter & Instant Search
 */

import assert from 'node:assert';
import { filterApps } from '../src/components/SearchRibbon.js';
import { DEFAULT_APPS } from '../src/data/defaultApps.js';

console.log('--- RUNNING TASK-04 TESTS ---');

// Test 1: Filter All
console.log('[Test 1] Filter Category "all"...');
const all = filterApps(DEFAULT_APPS, { category: 'all', query: '', favorites: [] });
assert.strictEqual(all.length, DEFAULT_APPS.length);
console.log(`✅ Test 1 Passed: Category 'all' mengembalikan semua ${all.length} aplikasi.`);

// Test 2: Filter Category "tahfidz"
console.log('[Test 2] Filter Category "tahfidz"...');
const tahfidz = filterApps(DEFAULT_APPS, { category: 'tahfidz', query: '', favorites: [] });
assert.ok(tahfidz.length >= 2, 'Kategori tahfidz harus punya minimal 2 aplikasi');
tahfidz.forEach(app => assert.strictEqual(app.category, 'tahfidz'));
console.log(`✅ Test 2 Passed: Kategori 'tahfidz' menyaring ${tahfidz.length} aplikasi.`);

// Test 3: Search Query
console.log('[Test 3] Search Query "kasir"...');
const searchKasir = filterApps(DEFAULT_APPS, { category: 'all', query: 'kasir', favorites: [] });
assert.ok(searchKasir.length >= 1, 'Pencarian kasir harus menemukan aplikasi');
assert.ok(searchKasir[0].title.toLowerCase().includes('kasir') || searchKasir[0].shortDescription.toLowerCase().includes('kasir'));
console.log(`✅ Test 3 Passed: Pencarian teks 'kasir' berhasil memfilter aplikasi.`);

// Test 4: Favorites Filter
console.log('[Test 4] Filter Favorites...');
const favList = ['yiqul-erapor', 'yiqul-tahfidz'];
const favApps = filterApps(DEFAULT_APPS, { category: 'favorites', query: '', favorites: favList });
assert.strictEqual(favApps.length, 2);
assert.strictEqual(favApps[0].id, 'yiqul-erapor');
assert.strictEqual(favApps[1].id, 'yiqul-tahfidz');
console.log('✅ Test 4 Passed: Filter Favorit menyaring tepat ID yang dibookmark.');

console.log('--- ALL TASK-04 TESTS PASSED SUCCESSFULLY! ---');
