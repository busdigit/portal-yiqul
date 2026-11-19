/**
 * COMPONENT: MODAL IFRAME VIEWER
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengelola dialog modal pop-up untuk aplikasi web yang mendukung mode iframe embed,
 * memungkinkan pengguna bekerja langsung di dalam portal tanpa meninggalkan halaman.
 */

import { sanitizeUrl, escapeHtml } from '../services/sanitizer.js';

let isModalOpen = false;

/**
 * Buka aplikasi di dalam Modal Viewer
 * @param {Object} app
 */
export function openModalViewer(app) {
  if (!app) return;

  const backdrop = document.getElementById('modal-viewer-backdrop');
  const iframe = document.getElementById('modal-app-iframe');
  const titleEl = document.getElementById('modal-app-title');
  const externalBtn = document.getElementById('modal-open-external-btn');

  const safeUrl = sanitizeUrl(app.targetUrl);
  if (safeUrl === '#') {
    alert('URL aplikasi tidak valid atau tidak aman.');
    return;
  }

  if (titleEl) titleEl.textContent = app.title || 'Aplikasi Yiqul';
  if (externalBtn) {
    externalBtn.setAttribute('href', safeUrl);
    externalBtn.setAttribute('title', `Buka ${app.title} di tab baru`);
  }

  if (iframe) {
    iframe.src = safeUrl;
  }

  if (backdrop) {
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    isModalOpen = true;
  }
}

/**
 * Tutup Modal Viewer dan reset iframe src ke about:blank
 */
export function closeModalViewer() {
  const backdrop = document.getElementById('modal-viewer-backdrop');
  const iframe = document.getElementById('modal-app-iframe');

  if (backdrop) {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    isModalOpen = false;
  }

  if (iframe) {
    // Bersihkan iframe agar tidak memakan memori / audio latar
    iframe.src = 'about:blank';
  }
}

/**
 * Inisialisasi event listener modal viewer
 */
export function initModalViewer() {
  const backdrop = document.getElementById('modal-viewer-backdrop');
  const closeBtn = document.getElementById('modal-close-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeModalViewer();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      // Jika klik di luar modal container (di area latar blur)
      if (e.target === backdrop) {
        closeModalViewer();
      }
    });
  }

  // Keyboard shortcut Esc
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) {
      closeModalViewer();
    }
  });
}
