/**
 * COMPONENT: HEADER & GLOBAL INFO
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengelola jam digital real-time WIB, penanggalan Masehi & Hijriyah,
 * banner pengumuman dinamis, serta toggle mode gelap/terang.
 */

import { getAnnouncement, getSavedTheme, saveTheme, getBranding } from '../services/storage.js';
import { escapeHtml } from '../services/sanitizer.js';
import { convertGoogleDriveToDirectLink } from '../services/uploader.js';

let clockTimer = null;
let portalTypewriterTimer = null;

/**
 * Inisialisasi Mode Typing Teks Emas Menyala pada Portal Hero Title
 */
export function initPortalHeroTypewriter() {
  if (typeof window === 'undefined') return;
  if (portalTypewriterTimer) {
    clearTimeout(portalTypewriterTimer);
    portalTypewriterTimer = null;
  }

  const textEl = document.getElementById('portal-typewriter-text');
  if (!textEl) return;

  const branding = getBranding();
  const orgName = branding.organizationName || 'Yayasan Islam Qudwatul Ummah';

  const phrases = [
    'Gerbang Navigasi Ekosistem Digital',
    orgName,
    'Ekosistem Pendidikan Berbasis Karakter & Qur\'ani',
    'Pusat Layanan Terpadu Day Care s.d SMAT'
  ];

  let phraseIndex = 0;
  let charIndex = phrases[0].length;
  let isDeleting = true;

  function loop() {
    const current = phrases[phraseIndex % phrases.length];

    if (isDeleting) {
      charIndex--;
      textEl.textContent = current.substring(0, charIndex);
    } else {
      charIndex++;
      textEl.textContent = current.substring(0, charIndex);
    }

    let speed = isDeleting ? 32 : 65;

    if (!isDeleting && charIndex === current.length) {
      speed = 2600; // Jeda waktu membaca
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex++;
      speed = 350; // Jeda sebelum mulai mengetik frasa berikutnya
    }

    portalTypewriterTimer = setTimeout(loop, speed);
  }

  portalTypewriterTimer = setTimeout(loop, 800);
}

/**
 * Render Logo dan Identitas Branding Yayasan secara dinamis
 */
export function renderBranding() {
  const branding = getBranding();
  const logoBadge = document.querySelector('.brand-logo-badge');
  const titleEl = document.querySelector('.brand-text h1');
  const subEl = document.querySelector('.brand-text p');

  if (titleEl && branding.portalTitle) {
    titleEl.textContent = branding.portalTitle;
  }

  if (subEl && branding.portalSubtitle) {
    subEl.textContent = branding.portalSubtitle;
  }

  if (logoBadge) {
    if (branding.logoUrl) {
      const directLogo = convertGoogleDriveToDirectLink(branding.logoUrl);
      logoBadge.innerHTML = `<img src="${directLogo}" alt="Logo Yayasan" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" />`;
      logoBadge.style.background = 'transparent';
      logoBadge.style.boxShadow = 'none';
    } else {
      logoBadge.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      `;
      logoBadge.style.background = 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))';
    }
  }
}

/**
 * Format tanggal Masehi ke bahasa Indonesia
 * @param {Date} date
 * @returns {string} Contoh: "Kamis, 19 November 2026"
 */
export function formatGregorianDate(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return date.toDateString();
  }
}

/**
 * Format tanggal Hijriyah ke bahasa Indonesia menggunakan Intl Umalqura
 * dengan fallback manual jika tidak didukung.
 * @param {Date} date
 * @returns {string} Contoh: "9 Jumadil Akhir 1448 H"
 */
export function formatHijriDate(date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formatted = formatter.format(date);
    // Tambahkan 'H' jika belum ada
    return formatted.includes('H') ? formatted : `${formatted} H`;
  } catch (e) {
    // Fallback perkiraan kalender Hijriyah sederhana
    return '1448 H';
  }
}

/**
 * Format jam ke format WIB (HH:mm:ss)
 * @param {Date} date
 * @returns {string}
 */
export function formatTimeWIB(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date).replace(/\./g, ':');
  } catch (e) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
}

/**
 * Inisialisasi jam digital real-time
 */
export function initLiveClock() {
  const clockEl = document.getElementById('live-clock-display');
  const gregEl = document.getElementById('gregorian-date-display');
  const hijriEl = document.getElementById('hijri-date-display');

  function updateClock() {
    const now = new Date();
    if (clockEl) clockEl.textContent = formatTimeWIB(now);
    if (gregEl) gregEl.textContent = formatGregorianDate(now);
    if (hijriEl) hijriEl.textContent = formatHijriDate(now);
  }

  updateClock();
  if (clockTimer) clearInterval(clockTimer);
  clockTimer = setInterval(updateClock, 1000);
}

/**
 * Inisialisasi dan render banner pengumuman dinamis
 */
export function renderAnnouncement() {
  const wrapper = document.getElementById('announcement-wrapper');
  if (!wrapper) return;

  const announcement = getAnnouncement();
  if (!announcement || !announcement.isActive || !announcement.text) {
    wrapper.innerHTML = '';
    return;
  }

  wrapper.innerHTML = `
    <div class="announcement-banner fade-in" role="alert" aria-live="polite">
      <div class="announcement-content">
        <span class="announcement-icon" aria-hidden="true">
          <i data-lucide="megaphone" width="20" height="20"></i>
        </span>
        <div>
          <strong>Pengumuman:</strong> ${escapeHtml(announcement.text)}
        </div>
      </div>
      <button id="dismiss-announcement-btn" class="btn-icon" style="min-width: 32px; min-height: 32px; width: 32px; height: 32px; border: none; background: transparent;" aria-label="Tutup Pengumuman">
        <i data-lucide="x" width="16" height="16"></i>
      </button>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  const dismissBtn = document.getElementById('dismiss-announcement-btn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      wrapper.innerHTML = '';
    });
  }
}

/**
 * Inisialisasi toggle tema Gelap/Terang
 */
export function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const htmlEl = document.documentElement;

  // Baca tema tersimpan atau ikuti preferensi sistem
  const savedTheme = getSavedTheme();
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

  if (isDark) {
    htmlEl.classList.add('dark');
  } else {
    htmlEl.classList.remove('dark');
  }

  updateThemeIcon(isDark);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const willBeDark = !htmlEl.classList.contains('dark');
      htmlEl.classList.toggle('dark', willBeDark);
      saveTheme(willBeDark ? 'dark' : 'light');
      updateThemeIcon(willBeDark);
    });
  }

  function updateThemeIcon(dark) {
    if (!themeIcon) return;
    themeIcon.setAttribute('data-lucide', dark ? 'sun' : 'moon');
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }
}

/**
 * Inisialisasi seluruh komponen Header
 */
export function initHeader() {
  renderBranding();
  initLiveClock();
  initThemeToggle();
  renderAnnouncement();
  initPortalHeroTypewriter();

  // Dengarkan perubahan pengumuman & branding dari admin
  if (typeof window !== 'undefined') {
    window.addEventListener('yiqul:announcement-changed', () => {
      renderAnnouncement();
    });

    window.addEventListener('yiqul:branding-changed', () => {
      renderBranding();
      initPortalHeroTypewriter();
    });
  }
}
