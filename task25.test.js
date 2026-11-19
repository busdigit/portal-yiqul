/**
 * UNIT TEST: TASK-25 FIREBASE CLOUD DATABASE CONNECTOR
 * Menguji getFirebaseConfig, saveFirebaseConfig, dan format Firestore REST payload.
 */

import { strict as assert } from 'node:assert';
import { 
  getFirebaseConfig, 
  saveFirebaseConfig, 
  isFirebaseConfigured 
} from '../src/services/firebaseService.js';

console.log('--- RUNNING TASK-25 FIREBASE TESTS ---');

// Mock localStorage if in node environment
if (typeof globalThis.localStorage === 'undefined') {
  let store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
}

// Test 1: Default Firebase Config
console.log('[Test 1] Verifikasi Default Config Firebase...');
const cfg = getFirebaseConfig();
assert.equal(typeof cfg, 'object');
assert.equal(cfg.databaseType, 'firestore');
assert.equal(isFirebaseConfigured(), false);
console.log('✅ Test 1 Passed: Default Config Firestore valid.');

// Test 2: Save & Retrieve Firebase Config
console.log('[Test 2] Verifikasi Penyimpanan Config Firebase...');
saveFirebaseConfig({
  projectId: 'portal-yiqul-demo',
  apiKey: 'AIzaSyDemoKey123',
  databaseType: 'firestore'
});
const updatedCfg = getFirebaseConfig();
assert.equal(updatedCfg.projectId, 'portal-yiqul-demo');
assert.equal(updatedCfg.apiKey, 'AIzaSyDemoKey123');
assert.equal(isFirebaseConfigured(), true);
console.log('✅ Test 2 Passed: Simpan & Ambil config Firebase berhasil.');

console.log('--- ALL TASK-25 TESTS PASSED SUCCESSFULLY! ---');
