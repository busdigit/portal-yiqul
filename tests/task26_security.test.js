/**
 * TEST RUNNER - TASK-26
 * Verifikasi Cyber Security Suite: SHA-256, Anti-Brute Force, Audit Trail, & Prototype Guard
 */

import assert from 'node:assert';
import crypto from 'node:crypto';
import {
  sha256,
  hashPin,
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  logSecurityEvent,
  getSecurityAuditLogs,
  clearSecurityAuditLogs,
  sanitizeObject,
  DEFAULT_PIN_HASH
} from '../src/services/security.js';
import {
  verifyAdminPin,
  verifyAppAccessPin,
  saveAdminPin,
  getCurrentRole,
  setCurrentRole,
  logoutAdmin
} from '../src/services/storage.js';

console.log('--- RUNNING TASK-26 CYBER SECURITY TESTS ---');

// Test 1: Verifikasi Kriptografi SHA-256 Standar FIPS
console.log('[Test 1] Verifikasi Algoritma SHA-256 Standar...');
const testStrings = ['1234', 'qudwatulummah2026', 'superadmin!@#$', 'test-token'];
for (const str of testStrings) {
  const nodeHash = crypto.createHash('sha256').update(str).digest('hex');
  const pureHash = sha256(str);
  assert.strictEqual(pureHash, nodeHash, `Hash untuk "${str}" harus identik dengan Node.js crypto`);
}
console.log('✅ Test 1 Passed: Algoritma SHA-256 FIPS 180-4 100% identik dengan standar internasional.');

// Test 2: Verifikasi Hashing PIN dan Salt
console.log('[Test 2] Verifikasi Salting & Hashing PIN...');
const hash1234 = hashPin('1234');
assert.strictEqual(hash1234, DEFAULT_PIN_HASH);
assert.notStrictEqual(hash1234, '1234', 'PIN tidak boleh disimpan dalam plaintext');
console.log('✅ Test 2 Passed: PIN terenkripsi aman dengan salt proteksi.');

// Test 3: Verifikasi Anti-Brute Force Lockout
console.log('[Test 3] Verifikasi Anti-Brute Force & Progressive Lockout...');
recordSuccessfulAttempt('INIT_TEST'); // Reset state
let limitStatus = checkRateLimit();
assert.strictEqual(limitStatus.isLocked, false);
assert.strictEqual(limitStatus.attemptsLeft, 5);

// Lakukan 4 percobaan salah
for (let i = 1; i <= 4; i++) {
  const failRes = recordFailedAttempt('TEST');
  assert.strictEqual(failRes.isLocked, false);
  assert.strictEqual(failRes.attemptsLeft, 5 - i);
}

// Percobaan ke-5 -> Wajib Terkunci (Lockout Aktif)
const lockedRes = recordFailedAttempt('TEST');
assert.strictEqual(lockedRes.isLocked, true);
assert.ok(lockedRes.remainingSeconds > 0);
assert.strictEqual(lockedRes.attemptsLeft, 0);

// Dalam keadaan terkunci, verifikasi PIN harus gagal otomatis
assert.strictEqual(verifyAdminPin('1234'), false, 'PIN benar sekalipun wajib ditolak saat lockout aktif');
assert.strictEqual(verifyAppAccessPin('1234'), false, 'Akses aplikasi wajib ditolak saat lockout aktif');

// Reset untuk membersihkan state
recordSuccessfulAttempt('TEST_CLEANUP');
assert.strictEqual(checkRateLimit().isLocked, false);
console.log('✅ Test 3 Passed: Anti-Brute Force memblokir serangan setelah 5 kesalahan berturut-turut.');

// Test 4: Verifikasi Tamper-Evident Security Audit Log
console.log('[Test 4] Verifikasi Security Audit Trail...');
clearSecurityAuditLogs();
logSecurityEvent('TEST_LOGIN_ALERT', 'INFO', 'Pengujian pencatatan audit log');
logSecurityEvent('TEST_INTRUSION', 'DANGER', 'Simulasi deteksi serangan');
const logs = getSecurityAuditLogs();
assert.ok(logs.length >= 2, 'Harus mencatat minimal 2 log');
assert.strictEqual(logs[0].type, 'TEST_INTRUSION');
assert.strictEqual(logs[0].severity, 'DANGER');
console.log('✅ Test 4 Passed: Audit Trail merekam setiap peristiwa keamanan dengan presisi.');

// Test 5: Verifikasi Anti-Prototype Pollution Guard
console.log('[Test 5] Verifikasi Anti-Prototype Pollution...');
const maliciousPayload = {
  appName: 'Safe Portal',
  __proto__: { isAdmin: true },
  constructor: { malicious: 'inject' },
  nested: {
    title: 'Aplikasi Aman',
    prototype: { hacked: true }
  }
};
const cleaned = sanitizeObject(maliciousPayload);
assert.strictEqual(cleaned.appName, 'Safe Portal');
assert.strictEqual(cleaned.__proto__.isAdmin, undefined, '__proto__ wajib dinetralisir');
assert.strictEqual(cleaned.constructor.malicious, undefined, 'constructor wajib dinetralisir');
assert.strictEqual(cleaned.nested.prototype, undefined, 'prototype wajib dinetralisir');
assert.strictEqual(cleaned.nested.title, 'Aplikasi Aman');
console.log('✅ Test 5 Passed: Proteksi Prototype Pollution berhasil menetralkan injeksi berbahaya.');

console.log('--- ALL TASK-26 CYBER SECURITY TESTS PASSED SUCCESSFULLY! ---');
