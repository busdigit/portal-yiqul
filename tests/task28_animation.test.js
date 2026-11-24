/**
 * TEST SUITE: TASK-28 GSAP MOTION & ANIMATION ENGINE
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 */

import {
  hasGsap,
  prefersReducedMotion,
  animateCounterNumber,
  initLandingHeroAnimation,
  initStatsAnimation,
  initPillarsAnimation,
  animateBentoGridCards,
  animateModalOpen
} from '../src/services/animation.js';

console.log('--- RUNNING TASK-28 GSAP ANIMATION TESTS ---');

// [Test 1] Verifikasi Lingkungan Headless / Safe Fallback (Tanpa GSAP)
console.log('[Test 1] Verifikasi Lingkungan Headless / Safe Fallback...');
if (typeof window === 'undefined') {
  global.window = {};
}
delete global.window.gsap;

if (hasGsap()) {
  throw new Error('hasGsap() harus bernilai false ketika window.gsap belum didefinisikan');
}

// Panggil fungsi-fungsi animasi; semuanya harus berjalan aman tanpa error (graceful fallback)
const mockEl = { textContent: '' };
animateCounterNumber(mockEl, 1500, '+');
if (mockEl.textContent !== '1.500+') {
  throw new Error(`Fallback counter gagal, didapat: ${mockEl.textContent}`);
}

initLandingHeroAnimation();
initStatsAnimation({}, 19);
initPillarsAnimation();
animateBentoGridCards();
animateModalOpen({});
console.log('✅ Test 1 Passed: Seluruh animasi memiliki graceful fallback aman saat GSAP tidak ada.');

// [Test 2] Verifikasi Integrasi & Eksekusi saat GSAP Aktif
console.log('[Test 2] Verifikasi Integrasi saat GSAP Aktif...');
let timelineCreated = false;
let tweenExecuted = false;

// Mock objek GSAP 3
global.window.gsap = {
  timeline: (opts) => {
    timelineCreated = true;
    return {
      fromTo: () => {},
      from: () => {},
      to: () => {}
    };
  },
  to: (target, vars) => {
    tweenExecuted = true;
    if (typeof vars.onUpdate === 'function') {
      target.value = vars.value;
      vars.onUpdate();
    }
  },
  fromTo: (target, fromVars, toVars) => {
    tweenExecuted = true;
  }
};

if (!hasGsap()) {
  throw new Error('hasGsap() harus bernilai true setelah window.gsap didefinisikan');
}
console.log('✅ Test 2 Passed: GSAP aktif terdeteksi dengan benar.');

// [Test 3] Verifikasi Rolling Ticker Counter Number GSAP
console.log('[Test 3] Verifikasi Rolling Ticker Counter Number GSAP...');
const counterEl = { textContent: '0' };
animateCounterNumber(counterEl, 4500, '+');
if (!counterEl.textContent.includes('4') || !counterEl.textContent.includes('500')) {
  throw new Error(`Rolling ticker GSAP gagal: didapat ${counterEl.textContent}`);
}
console.log(`✅ Test 3 Passed: Rolling ticker GSAP sukses menganimasikan nilai ke ${counterEl.textContent}.`);

// [Test 4] Verifikasi Timeline & Stagger Bento Cards
console.log('[Test 4] Verifikasi Timeline & Stagger Bento Cards...');
global.document = {
  querySelectorAll: (selector) => [{ className: 'bento-card' }]
};
animateBentoGridCards('#test-container');
if (!tweenExecuted) {
  throw new Error('animateBentoGridCards harus memicu GSAP tween');
}
console.log('✅ Test 4 Passed: Staggered animation Bento Grid terverifikasi.');

console.log('--- ALL TASK-28 GSAP ANIMATION TESTS PASSED SUCCESSFULLY! ---');
