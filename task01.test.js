/**
 * TEST RUNNER - TASK-01
 * Verifikasi Data Registry, Storage Service, dan Sanitizer Security
 */

import assert from 'node:assert';
import { DEFAULT_APPS, CATEGORIES } from '../src/data/defaultApps.js';
import { sanitizeUrl, isValidUrl, escapeHtml, getSafeLinkAttributes } from '../src/services/sanitizer.js';
import {
  getAllApps,
  addApp,
  updateApp,
  deleteApp,
  toggleFavorite,
  getFavorites,
  exportRegistryJson,
  importRegistryJson,
  resetToDefault
} from '../src/services/storage.js';

console.log('--- RUNNING TASK-01 TESTS ---');

// 1. Verifikasi Seed Catalog
console.log('[Test 1] Verifikasi Seed Catalog Apps...');
assert.ok(Array.isArray(DEFAULT_APPS), 'DEFAULT_APPS harus array');
assert.ok(DEFAULT_APPS.length >= 18, `Seed apps harus >= 18, saat ini: ${DEFAULT_APPS.length}`);
DEFAULT_APPS.forEach(app => {
  assert.ok(app.id, `App ${app.title} harus punya ID`);
  assert.ok(app.title, `App ${app.id} harus punya Title`);
  assert.ok(app.targetUrl, `App ${app.id} harus punya targetUrl`);
  assert.ok(isValidUrl(app.targetUrl), `URL ${app.targetUrl} harus valid`);
  assert.ok(app.category, `App ${app.id} harus punya category`);
  assert.ok(['active', 'maintenance', 'new', 'coming_soon'].includes(app.status), `Status ${app.status} tidak valid`);
  assert.ok(['_blank', '_self', 'iframe'].includes(app.targetMode), `TargetMode ${app.targetMode} tidak valid`);
});
console.log('✅ Test 1 Passed: Seed Catalog memuat 18+ aplikasi valid.');

// 2. Verifikasi Sanitizer Security
console.log('[Test 2] Verifikasi Sanitizer Security...');
assert.strictEqual(sanitizeUrl('https://tahfidz.qudwatulummah.sch.id'), 'https://tahfidz.qudwatulummah.sch.id');
assert.strictEqual(sanitizeUrl('http://infaq.yiqul.id/donasi'), 'http://infaq.yiqul.id/donasi');
assert.strictEqual(sanitizeUrl('javascript:alert(document.cookie)'), '#', 'javascript: URI wajib diblokir');
assert.strictEqual(sanitizeUrl('data:text/html,<script>alert(1)</script>'), '#', 'data: URI wajib diblokir');
assert.strictEqual(sanitizeUrl('vbscript:msgbox("test")'), '#', 'vbscript: URI wajib diblokir');
assert.strictEqual(sanitizeUrl(''), '#');
assert.strictEqual(sanitizeUrl(null), '#');

assert.strictEqual(escapeHtml('<script>alert("hack")</script>'), '&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;');
assert.ok(getSafeLinkAttributes('_blank').includes('rel="noopener noreferrer"'), 'Atribut _blank wajib punya noopener noreferrer');
console.log('✅ Test 2 Passed: Sanitizer dan Anti-XSS bekerja presisi.');

// 3. Verifikasi Storage CRUD
console.log('[Test 3] Verifikasi Storage Service CRUD...');
resetToDefault();
const initialApps = getAllApps();
assert.strictEqual(initialApps.length, DEFAULT_APPS.length);

// Tambah App Baru
const newApp = addApp({
  title: 'Test App Santri',
  targetUrl: 'https://test.yiqul.id',
  category: 'akademik',
  shortDescription: 'Deskripsi tes aplikasi',
  targetMode: '_blank',
  status: 'active'
});
assert.ok(newApp.id, 'App baru harus punya ID');
assert.strictEqual(getAllApps().length, initialApps.length + 1);

// Update App
const updated = updateApp(newApp.id, { title: 'Test App Santri Updated' });
assert.strictEqual(updated.title, 'Test App Santri Updated');

// Toggle Favorite
assert.strictEqual(toggleFavorite(newApp.id), true);
assert.ok(getFavorites().includes(newApp.id));
assert.strictEqual(toggleFavorite(newApp.id), false);
assert.ok(!getFavorites().includes(newApp.id));

// Ekspor & Impor
const exportedJson = exportRegistryJson();
assert.ok(exportedJson.includes('Test App Santri Updated'));

// Delete App
const deleted = deleteApp(newApp.id);
assert.strictEqual(deleted, true);
assert.strictEqual(getAllApps().length, initialApps.length);

// Impor Kembali
const importResult = importRegistryJson(exportedJson);
assert.strictEqual(importResult.success, true);
assert.strictEqual(getAllApps().length, initialApps.length + 1);

resetToDefault();
assert.strictEqual(getAllApps().length, DEFAULT_APPS.length);
console.log('✅ Test 3 Passed: Storage CRUD, Bookmark, Export, & Import 100% lulus.');

console.log('--- ALL TASK-01 TESTS PASSED SUCCESSFULLY! ---');
