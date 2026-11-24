/**
 * TEST RUNNER - TASK-21
 * Verifikasi Integrasi Landing Page Bergaya Techwitpro, Floating Navbar,
 * dan Dual-View Routing (#/ vs #/portal)
 */

import assert from 'node:assert';
import fs from 'node:fs';

console.log('--- RUNNING TASK-21 TESTS ---');

// Test 1: Verifikasi File Landing Page & CSS
console.log('[Test 1] Verifikasi Berkas Landing Page & Stylesheet...');
assert.ok(fs.existsSync('src/styles/landing.css'), 'src/styles/landing.css harus ada');
assert.ok(fs.existsSync('src/components/LandingHero.js'), 'src/components/LandingHero.js harus ada');
assert.ok(fs.existsSync('src/components/LandingFeatures.js'), 'src/components/LandingFeatures.js harus ada');

const landingCss = fs.readFileSync('src/styles/landing.css', 'utf-8');
assert.ok(landingCss.includes('.floating-pill-nav'), 'Harus memuat styling floating pill navbar');
assert.ok(landingCss.includes('.btn-white-pill'), 'Harus memuat styling tombol white pill Techwitpro');
assert.ok(landingCss.includes('.headline-serif-italic'), 'Harus memuat styling serif italic headline');
assert.ok(landingCss.includes('.showcase-browser-frame'), 'Harus memuat frame 3D browser mockup');
console.log('✅ Test 1 Passed: Seluruh komponen visual Techwitpro style terverifikasi di stylesheet.');

// Test 2: Verifikasi Dual-View Container di index.html
console.log('[Test 2] Verifikasi Dual-View Container di index.html...');
const indexHtml = fs.readFileSync('index.html', 'utf-8');
assert.ok(indexHtml.includes('id="landing-view-container"'), 'Harus memuat #landing-view-container');
assert.ok(indexHtml.includes('id="portal-view-container"'), 'Harus memuat #portal-view-container');
assert.ok(indexHtml.includes('id="btn-back-to-landing"'), 'Harus memuat tombol kembali ke beranda di navbar portal');
assert.ok(indexHtml.includes('href="src/styles/landing.css"'), 'Harus me-load src/styles/landing.css');
console.log('✅ Test 2 Passed: Dual-View container Landing Page & Portal Launcher terpasang rapi.');

// Test 3: Verifikasi Router Hash di src/app.js
console.log('[Test 3] Verifikasi Router Hash di src/app.js...');
const appJs = fs.readFileSync('src/app.js', 'utf-8');
assert.ok(appJs.includes("hash.startsWith('#/portal')"), 'app.js harus menangani route #/portal');
assert.ok(appJs.includes('renderLandingHero'), 'app.js harus memanggil renderLandingHero');
assert.ok(appJs.includes('renderLandingFeatures'), 'app.js harus memanggil renderLandingFeatures');
assert.ok(appJs.includes('hashchange'), 'app.js harus memantau event hashchange');
console.log('✅ Test 3 Passed: Hash router zero-bloat siap beroperasi.');

console.log('--- ALL TASK-21 TESTS PASSED SUCCESSFULLY! ---');
