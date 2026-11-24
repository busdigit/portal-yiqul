/**
 * TEST SUITE: TASK-27 DAILY VISITOR ANALYTICS & MONITORING
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 */

import {
  getAnalyticsData,
  saveAnalyticsData,
  recordVisit,
  recordAppLaunch,
  getRecentDailyHistory,
  calibrateAnalytics,
  formatVisitorNumber,
  getTodayDateString
} from '../src/services/analytics.js';

console.log('--- RUNNING TASK-27 VISITOR ANALYTICS TESTS ---');

// Mock localStorage and sessionStorage for node test environment
const mockLocalStorage = {};
const mockSessionStorage = {};

global.localStorage = {
  getItem: (key) => mockLocalStorage[key] || null,
  setItem: (key, val) => { mockLocalStorage[key] = String(val); },
  removeItem: (key) => { delete mockLocalStorage[key]; },
  clear: () => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); }
};

global.sessionStorage = {
  getItem: (key) => mockSessionStorage[key] || null,
  setItem: (key, val) => { mockSessionStorage[key] = String(val); },
  removeItem: (key) => { delete mockSessionStorage[key]; },
  clear: () => { Object.keys(mockSessionStorage).forEach(k => delete mockSessionStorage[k]); }
};

// Mock window event dispatching
global.window = {
  dispatchEvent: () => {}
};

// [Test 1] Verifikasi Inisialisasi Data Analitik & Baseline
console.log('[Test 1] Verifikasi Inisialisasi Data Analitik & Baseline...');
const initialData = getAnalyticsData();
if (!initialData.totalVisits || initialData.totalVisits < 1000) {
  throw new Error(`Total visits baseline tidak valid: ${initialData.totalVisits}`);
}
if (!initialData.todayVisits || initialData.todayVisits < 10) {
  throw new Error(`Today visits baseline tidak valid: ${initialData.todayVisits}`);
}
console.log(`✅ Test 1 Passed: Inisialisasi baseline valid (Total: ${initialData.totalVisits}, Hari Ini: ${initialData.todayVisits}).`);

// [Test 2] Verifikasi Pencatatan Kunjungan (recordVisit)
console.log('[Test 2] Verifikasi Pencatatan Kunjungan (recordVisit)...');
const beforeVisits = initialData.totalVisits;
const beforeToday = initialData.todayVisits;

const afterData = recordVisit();
if (afterData.totalVisits !== beforeVisits + 1) {
  throw new Error(`Total visits harus bertambah 1: ekspektasi ${beforeVisits + 1}, didapat ${afterData.totalVisits}`);
}
if (afterData.todayVisits !== beforeToday + 1) {
  throw new Error(`Today visits harus bertambah 1: ekspektasi ${beforeToday + 1}, didapat ${afterData.todayVisits}`);
}
console.log('✅ Test 2 Passed: recordVisit menambah kunjungan total dan hari ini dengan akurat.');

// [Test 3] Verifikasi Pelacakan Peluncuran Aplikasi (recordAppLaunch)
console.log('[Test 3] Verifikasi Pelacakan Peluncuran Aplikasi (recordAppLaunch)...');
const testAppId = 'app-erapor-01';
const beforeLaunches = afterData.totalAppLaunches || 0;

recordAppLaunch(testAppId, 'E-Rapor Digital');
const launchData = getAnalyticsData();

if (launchData.totalAppLaunches !== beforeLaunches + 1) {
  throw new Error(`Total app launches harus bertambah 1: ekspektasi ${beforeLaunches + 1}, didapat ${launchData.totalAppLaunches}`);
}
if (!launchData.appLaunchesBreakdown[testAppId] || launchData.appLaunchesBreakdown[testAppId] < 1) {
  throw new Error(`Breakdown untuk ${testAppId} tidak tercatat`);
}
console.log('✅ Test 3 Passed: recordAppLaunch mencatat peluncuran aplikasi dan breakdown per ID.');

// [Test 4] Verifikasi Riwayat 7 Hari Terakhir
console.log('[Test 4] Verifikasi Riwayat 7 Hari Terakhir...');
const history = getRecentDailyHistory(7);
if (!Array.isArray(history) || history.length !== 7) {
  throw new Error(`Riwayat harus menghasilkan array 7 hari, didapat ${history.length}`);
}
const todayKey = getTodayDateString();
const latestDay = history[history.length - 1];
if (latestDay.date !== todayKey) {
  throw new Error(`Hari terakhir pada riwayat harus tanggal hari ini (${todayKey}), didapat ${latestDay.date}`);
}
console.log(`✅ Test 4 Passed: Riwayat 7 hari terakhir terstruktur rapi (Hari ini: ${latestDay.label} = ${latestDay.visits} kunjungan).`);

// [Test 5] Verifikasi Kalibrasi Manual Administrator
console.log('[Test 5] Verifikasi Kalibrasi Manual Administrator...');
calibrateAnalytics(5000, 250);
const calibrated = getAnalyticsData();
if (calibrated.totalVisits !== 5000) {
  throw new Error(`Kalibrasi totalVisits gagal: ekspektasi 5000, didapat ${calibrated.totalVisits}`);
}
if (calibrated.todayVisits !== 250) {
  throw new Error(`Kalibrasi todayVisits gagal: ekspektasi 250, didapat ${calibrated.todayVisits}`);
}
console.log('✅ Test 5 Passed: Kalibrasi manual administrator berjalan presisi.');

// [Test 6] Verifikasi Format Angka Ribuan Indonesia
console.log('[Test 6] Verifikasi Format Angka Ribuan Indonesia...');
const formatted = formatVisitorNumber(4500);
if (!formatted.includes('4') || !formatted.includes('500')) {
  throw new Error(`Format angka tidak sesuai: ${formatted}`);
}
console.log(`✅ Test 6 Passed: Format angka ribuan (${formatted}) valid.`);

console.log('--- ALL TASK-27 VISITOR ANALYTICS TESTS PASSED SUCCESSFULLY! ---');
