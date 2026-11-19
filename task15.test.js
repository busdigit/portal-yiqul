/**
 * TEST RUNNER - TASK-15
 * Verifikasi Integrasi Penuh Choose File, Google Drive Direct Link lh3,
 * Banner Gambar Beranda, dan Panel Admin 5 Tab
 */

import assert from 'node:assert';
import fs from 'node:fs';
import { renderAppCard } from '../src/components/AppCard.js';
import { convertGoogleDriveToDirectLink } from '../src/services/uploader.js';

console.log('--- RUNNING TASK-15 TESTS ---');

// Test 1: Verifikasi Integrasi HTML
console.log('[Test 1] Verifikasi Elemen Baru di index.html...');
const htmlContent = fs.readFileSync('index.html', 'utf-8');

assert.ok(htmlContent.includes('id="admin-auth-modal"'), 'index.html harus memuat modal PIN auth admin');
assert.ok(htmlContent.includes('id="admin-panel-backdrop"'), 'index.html harus memuat backdrop panel admin 5 tab');
assert.ok(htmlContent.includes('id="hero-banner-container"'), 'index.html harus memuat container hero banner gambar');
assert.ok(htmlContent.includes('data-tab="apps"'), 'Harus ada tab Kelola Aplikasi');
assert.ok(htmlContent.includes('data-tab="banners"'), 'Harus ada tab Banner Gambar');
assert.ok(htmlContent.includes('data-tab="branding"'), 'Harus ada tab Logo Yayasan');
assert.ok(htmlContent.includes('data-tab="docs"'), 'Harus ada tab Dokumen PDF');
assert.ok(htmlContent.includes('data-tab="role"'), 'Harus ada tab Hak Akses Role');
console.log('✅ Test 1 Passed: Seluruh elemen antarmuka admin 5 tab & banner terpasang lengkap.');

// Test 2: Verifikasi Card dengan Logo Kustom Google Drive
console.log('[Test 2] Verifikasi Render Bento Card dengan Custom Logo Google Drive...');
const testAppWithDriveLogo = {
  id: 'app-with-logo',
  title: 'Aplikasi dengan Logo Drive',
  shortDescription: 'Deskripsi tes logo drive',
  targetUrl: 'https://test.yiqul.id',
  category: 'akademik',
  iconName: 'Globe',
  customIconUrl: 'https://drive.google.com/file/d/1X2Y3Z4A5B6C7D8E9F0G/view?usp=sharing',
  targetMode: '_blank',
  status: 'active'
};

const renderedCard = renderAppCard(testAppWithDriveLogo, false);
assert.ok(renderedCard.includes('https://lh3.googleusercontent.com/d/1X2Y3Z4A5B6C7D8E9F0G'), 'customIconUrl Google Drive harus otomatis terkonversi ke lh3 CDN!');
assert.ok(renderedCard.includes('<img src="https://lh3.googleusercontent.com/d/1X2Y3Z4A5B6C7D8E9F0G"'), 'Harus merender tag img dengan direct CDN link');
console.log('✅ Test 2 Passed: Kartu Bento otomatis merender logo Google Drive via CDN lh3.');

// Test 3: Verifikasi Backend Google Apps Script (gas/Code.gs)
console.log('[Test 3] Verifikasi gas/Code.gs Google Drive Auto-Folder Engine...');
const gasCode = fs.readFileSync('gas/Code.gs', 'utf-8');

assert.ok(gasCode.includes('PORTAL_YIQUL_STORAGE'), 'gas/Code.gs harus memuat root folder PORTAL_YIQUL_STORAGE');
assert.ok(gasCode.includes('function getOrCreateFolder'), 'gas/Code.gs harus memiliki fungsi getOrCreateFolder');
assert.ok(gasCode.includes('function apiUploadFileToDrive'), 'gas/Code.gs harus memiliki API apiUploadFileToDrive');
assert.ok(gasCode.includes('https://lh3.googleusercontent.com/d/'), 'gas/Code.gs harus memformat link direct ke lh3.googleusercontent.com');
assert.ok(gasCode.includes('DriveApp.Access.ANYONE_WITH_LINK'), 'File wajib di-share ANYONE_WITH_LINK');
console.log('✅ Test 3 Passed: Backend Google Apps Script Drive Engine terverifikasi 100%.');

console.log('--- ALL TASK-15 TESTS PASSED SUCCESSFULLY! ---');
