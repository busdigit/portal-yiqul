/**
 * MASTER VERIFICATION GATE RUNNER
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * Santriverse Pre-Deploy Gate Verification
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

console.log('====================================================');
console.log('   PORTAL YIQUL — MASTER QUALITY VERIFICATION GATE   ');
console.log('====================================================');

const testFiles = [
  'tests/task01.test.js',
  'tests/task03.test.js',
  'tests/task04.test.js',
  'tests/task05.test.js',
  'tests/task11.test.js',
  'tests/task15.test.js',
  'tests/task21.test.js',
  'tests/task25.test.js'
];

let totalPassed = 0;

for (const testFile of testFiles) {
  console.log(`\n▶ Menjalankan ${testFile}...`);
  try {
    const output = execSync(`node ${testFile}`, { encoding: 'utf-8' });
    console.log(output.trim());
    totalPassed++;
  } catch (err) {
    console.error(`❌ Gagal pada ${testFile}:`, err.message);
    process.exit(1);
  }
}

console.log('\n----------------------------------------------------');
console.log('▶ Verifikasi Integritas File & Manifest JSON...');
const manifestRaw = fs.readFileSync('manifest.json', 'utf-8');
const manifest = JSON.parse(manifestRaw);
if (!manifest.name || !manifest.start_url || !manifest.theme_color) {
  throw new Error('Manifest JSON tidak valid');
}
console.log('✅ manifest.json: Valid!');

const htmlRaw = fs.readFileSync('index.html', 'utf-8');
if (!htmlRaw.includes('rel="manifest"') || !htmlRaw.includes('src/app.js')) {
  throw new Error('index.html kehilangan rel="manifest" atau src/app.js');
}
console.log('✅ index.html: Valid!');

console.log('\n====================================================');
console.log(`🏆 SELURUH ${totalPassed} SUITE TEST LULUS DENGAN SEMPURNA!`);
console.log('   Status: READY FOR PRODUCTION DEPLOYMENT          ');
console.log('====================================================');
