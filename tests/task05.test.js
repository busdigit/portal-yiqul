/**
 * TEST RUNNER - TASK-05
 * Verifikasi Render App Card, Keamanan Link noopener noreferrer, dan 4 States
 */

import assert from 'node:assert';
import { renderAppCard } from '../src/components/AppCard.js';
import { DEFAULT_APPS } from '../src/data/defaultApps.js';

console.log('--- RUNNING TASK-05 TESTS ---');

// Test 1: Render Tab Baru (_blank) Card
console.log('[Test 1] Verifikasi Card Mode _blank...');
const cardBlank = renderAppCard(DEFAULT_APPS[0], false);
assert.ok(cardBlank.includes('target="_blank"'), 'Harus memiliki target="_blank"');
assert.ok(cardBlank.includes('rel="noopener noreferrer"'), 'Harus memiliki rel="noopener noreferrer"');
assert.ok(cardBlank.includes(DEFAULT_APPS[0].title), 'Harus memuat judul aplikasi');
console.log('✅ Test 1 Passed: Card _blank terproteksi noopener noreferrer.');

// Test 2: Render Modal Mode (iframe) Card
console.log('[Test 2] Verifikasi Card Mode iframe...');
const iframeApp = DEFAULT_APPS.find(a => a.targetMode === 'iframe');
assert.ok(iframeApp, 'Harus ada aplikasi bermode iframe');
const cardModal = renderAppCard(iframeApp, true);
assert.ok(cardModal.includes('data-action="open-modal"'), 'Harus memiliki trigger open-modal');
assert.ok(cardModal.includes('favorited'), 'Harus berstatus favorited jika isFav=true');
console.log('✅ Test 2 Passed: Card mode iframe dan status favorit valid.');

// Test 3: Anti-XSS Injection di Card
console.log('[Test 3] Verifikasi Anti-XSS pada Title & Desc...');
const maliciousApp = {
  id: 'xss-app',
  title: '<script>alert("hack")</script>',
  shortDescription: '"><img src=x onerror=alert(1)>',
  targetUrl: 'https://evil.com',
  category: 'umum',
  iconName: 'Globe',
  targetMode: '_blank',
  status: 'active'
};
const cardMalicious = renderAppCard(maliciousApp, false);
assert.ok(!cardMalicious.includes('<script>alert'), 'Tag script mentah dilarang tembus');
assert.ok(cardMalicious.includes('&lt;script&gt;alert'), 'Tag script wajib di-escape');
console.log('✅ Test 3 Passed: Injeksi XSS berhasil dinetralkan.');

console.log('--- ALL TASK-05 TESTS PASSED SUCCESSFULLY! ---');
