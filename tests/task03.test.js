/**
 * TEST RUNNER - TASK-03
 * Verifikasi Header Component Formatting: Masehi, Hijriyah & Jam WIB
 */

import assert from 'node:assert';
import { formatGregorianDate, formatHijriDate, formatTimeWIB } from '../src/components/Header.js';

console.log('--- RUNNING TASK-03 TESTS ---');

const testDate = new Date('2026-11-19T09:45:00+07:00');

// Test 1: Gregorian Date
console.log('[Test 1] Format Tanggal Masehi...');
const greg = formatGregorianDate(testDate);
console.log('  Hasil Masehi:', greg);
assert.ok(greg.includes('2026'), 'Tanggal Masehi harus memuat tahun 2026');
assert.ok(greg.toLowerCase().includes('nov'), 'Tanggal Masehi harus memuat bulan Nov');

// Test 2: Hijri Date
console.log('[Test 2] Format Tanggal Hijriyah...');
const hijri = formatHijriDate(testDate);
console.log('  Hasil Hijriyah:', hijri);
assert.ok(hijri.includes('1448') || hijri.includes('H'), 'Tanggal Hijriyah harus memuat penanggalan Hijriyah');

// Test 3: Time WIB
console.log('[Test 3] Format Jam WIB...');
const wib = formatTimeWIB(testDate);
console.log('  Hasil WIB:', wib);
assert.ok(/^\d{2}:\d{2}:\d{2}$/.test(wib), `Format jam WIB harus HH:mm:ss, didapat: ${wib}`);

console.log('--- ALL TASK-03 TESTS PASSED SUCCESSFULLY! ---');
