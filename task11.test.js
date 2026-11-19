/**
 * TEST RUNNER - TASK-11
 * Verifikasi Uploader Google Drive Converter & Storage Branding, Banners, Docs, Role
 */

import assert from 'node:assert';
import { convertGoogleDriveToDirectLink } from '../src/services/uploader.js';
import {
  getBranding,
  saveBranding,
  getBanners,
  addBanner,
  updateBanner,
  deleteBanner,
  getDocuments,
  addDocument,
  deleteDocument,
  getCurrentRole,
  setCurrentRole,
  verifyAdminPin,
  logoutAdmin,
  exportRegistryJson,
  importRegistryJson
} from '../src/services/storage.js';

console.log('--- RUNNING TASK-11 TESTS ---');

// Test 1: Konversi Link Google Drive ke Direct lh3.googleusercontent.com
console.log('[Test 1] Verifikasi Konversi Direct Link Google Drive...');
const driveUrl1 = 'https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing';
const direct1 = convertGoogleDriveToDirectLink(driveUrl1);
assert.strictEqual(direct1, 'https://lh3.googleusercontent.com/d/1A2B3C4D5E6F7G8H9I0J');

const driveUrl2 = 'https://drive.google.com/uc?id=9Z8Y7X6W5V4U3T2S1R0Q&export=download';
const direct2 = convertGoogleDriveToDirectLink(driveUrl2);
assert.strictEqual(direct2, 'https://lh3.googleusercontent.com/d/9Z8Y7X6W5V4U3T2S1R0Q');
console.log('✅ Test 1 Passed: Google Drive Link berhasil dikonversi ke lh3.googleusercontent.com!');

// Test 2: Branding Management
console.log('[Test 2] Verifikasi Branding Management...');
const initialBranding = getBranding();
assert.ok(initialBranding.portalTitle, 'Harus punya portalTitle');

saveBranding({
  portalTitle: 'PORTAL YIQUL TESTING',
  logoUrl: 'https://lh3.googleusercontent.com/d/mock-logo-123'
});
const updatedBranding = getBranding();
assert.strictEqual(updatedBranding.portalTitle, 'PORTAL YIQUL TESTING');
assert.strictEqual(updatedBranding.logoUrl, 'https://lh3.googleusercontent.com/d/mock-logo-123');
console.log('✅ Test 2 Passed: Branding Logo & Portal Title tersimpan presisi.');

// Test 3: Banner Promosi Bergambar
console.log('[Test 3] Verifikasi Banner Promosi Management...');
const banners = getBanners();
assert.ok(banners.length >= 2, 'Harus memuat seed banner minimal 2');

const newBanner = addBanner({
  title: 'Banner Uji Coba',
  subtitle: 'Deskripsi banner uji coba',
  imageUrl: 'https://lh3.googleusercontent.com/d/mock-banner-456',
  actionUrl: 'https://qudwatulummah.sch.id',
  actionText: 'Daftar'
});
assert.ok(newBanner.id);
assert.strictEqual(getBanners().length, banners.length + 1);

updateBanner(newBanner.id, { title: 'Banner Uji Coba Updated' });
deleteBanner(newBanner.id);
assert.strictEqual(getBanners().length, banners.length);
console.log('✅ Test 3 Passed: Banner Bergambar CRUD berjalan sempurna.');

// Test 4: Role & PIN Authentication
console.log('[Test 4] Verifikasi Role & PIN Admin Gate...');
setCurrentRole('guest');
assert.strictEqual(getCurrentRole(), 'guest');

// PIN default 1234
assert.strictEqual(verifyAdminPin('9999'), false, 'PIN salah wajib ditolak');
assert.strictEqual(getCurrentRole(), 'guest');

assert.strictEqual(verifyAdminPin('1234'), true, 'PIN default 1234 wajib diterima');
assert.strictEqual(getCurrentRole(), 'superadmin');

logoutAdmin();
assert.strictEqual(getCurrentRole(), 'guest');
console.log('✅ Test 4 Passed: Role & Admin PIN Authentication aman.');

console.log('--- ALL TASK-11 TESTS PASSED SUCCESSFULLY! ---');
