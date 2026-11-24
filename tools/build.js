/**
 * ZERO-DEPENDENCY BUNDLER FOR PORTAL YIQUL
 * Menghasilkan bundle.css dan bundle.js di root proyek
 * untuk memastikan aplikasi berjalan 100% sempurna di GitHub Pages & Netlify
 * tanpa risiko file 404 atau masalah path subfolder.
 */

import fs from 'node:fs';
import path from 'node:path';

console.log('=== BUNDLING PORTAL YIQUL ASSETS ===');

// 1. Bundle CSS (style.css + landing.css)
const styleCss = fs.readFileSync('src/styles/style.css', 'utf-8');
const landingCss = fs.readFileSync('src/styles/landing.css', 'utf-8');
const bundleCss = `/* PORTAL YIQUL BUNDLE CSS */\n${styleCss}\n\n${landingCss}`;
fs.writeFileSync('bundle.css', bundleCss, 'utf-8');
console.log('✅ bundle.css berhasil dibuat (' + (bundleCss.length / 1024).toFixed(1) + ' KB)');

// 2. Daftar file JS dalam urutan dependensi
const jsFiles = [
  'src/services/sanitizer.js',
  'src/services/security.js',
  'src/services/analytics.js',
  'src/services/animation.js',
  'src/services/spmbService.js',
  'src/data/defaultApps.js',
  'src/services/storage.js',
  'src/services/uploader.js',
  'src/services/cloudSync.js',
  'src/services/firebaseService.js',
  'src/components/Header.js',
  'src/components/SearchRibbon.js',
  'src/components/AppCard.js',
  'src/components/BentoGrid.js',
  'src/components/ModalViewer.js',
  'src/components/BannerSlider.js',
  'src/components/SpmbModal.js',
  'src/components/FileUploader.js',
  'src/components/AdminPanel.js',
  'src/components/LandingHero.js',
  'src/components/LandingFeatures.js',
  'src/components/PwaInstallPrompt.js',
  'src/app.js'
];

let bundleJsParts = [];

for (const file of jsFiles) {
  let content = fs.readFileSync(file, 'utf-8');
  // Hapus semua baris import
  content = content.replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '');
  // Hapus kata kunci export default dan export
  content = content.replace(/^export\s+default\s+/gm, '');
  content = content.replace(/^export\s+(const|let|var|function|async function|class)\s+/gm, '$1 ');
  // Hapus named export object di akhir file jika ada (export { ... })
  content = content.replace(/^export\s*\{[\s\S]*?\};?\s*$/gm, '');

  bundleJsParts.push(`\n/* --- MODULE: ${file} --- */\n${content}`);
}

const bundleJs = `/**
 * PORTAL YIQUL — ALL-IN-ONE BUNDLE JS
 * Zero-Bloat Standalone Client Engine
 */
(function() {
  'use strict';
  ${bundleJsParts.join('\n')}
})();
`;

fs.writeFileSync('bundle.js', bundleJs, 'utf-8');
console.log('✅ bundle.js berhasil dibuat (' + (bundleJs.length / 1024).toFixed(1) + ' KB)');

console.log('=== BUNDLE SELESAI DENGAN SUKSES! ===');
