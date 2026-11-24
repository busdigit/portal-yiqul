/**
 * COMPONENT: BENTO GRID CONTROLLER
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengelola rendering Bento Grid dengan 4 Kondisi Wajib (Mandatory 4 States):
 * 1. LOADING STATE: Shimmer skeleton screen
 * 2. EMPTY STATE: Desain ramah saat data/pencarian nihil
 * 3. ERROR STATE: Tampilan kegagalan informatif + retry
 * 4. SUCCESS STATE: Grid kartu Bento interaktif
 */

import { renderAppCard } from './AppCard.js';
import { getFavorites, toggleFavorite, getAllApps, getAppById, verifyAppAccessPin, checkRateLimit } from '../services/storage.js';
import { resetFilters } from './SearchRibbon.js';
import { escapeHtml } from '../services/sanitizer.js';
import { recordAppLaunch } from '../services/analytics.js';
import { animateBentoGridCards } from '../services/animation.js';

let onOpenModalCallback = null;
let onEditAppCallback = null;

/**
 * Buka Modal PIN Akses Aplikasi Terkunci
 * @param {string} appId
 */
export function openAppLockModal(appId) {
  const app = getAppById(appId);
  if (!app) return;

  const modalBackdrop = document.getElementById('app-lock-modal');
  const titleEl = document.getElementById('lock-modal-app-title');
  const subEl = document.getElementById('lock-modal-subheading');
  const idInput = document.getElementById('lock-modal-app-id');
  const pinInput = document.getElementById('app-lock-pin-input');
  const errEl = document.getElementById('app-lock-error');

  const rateLimit = checkRateLimit();

  if (titleEl) titleEl.textContent = `Buka: ${app.title}`;
  if (subEl) subEl.textContent = `Aplikasi ${app.title} Terkunci`;
  if (idInput) idInput.value = app.id;
  if (pinInput) {
    pinInput.value = '';
    if (!rateLimit.isLocked) {
      setTimeout(() => pinInput.focus(), 100);
    }
  }
  if (errEl) {
    if (rateLimit.isLocked) {
      errEl.textContent = `🔒 Akses ditangguhkan! Silakan tunggu ${rateLimit.remainingSeconds} detik.`;
      errEl.style.display = 'block';
    } else {
      errEl.style.display = 'none';
      errEl.textContent = '';
    }
  }

  if (modalBackdrop) {
    modalBackdrop.classList.add('open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
  }
}

/**
 * Tutup Modal PIN Akses Aplikasi Terkunci
 */
export function closeAppLockModal() {
  const modalBackdrop = document.getElementById('app-lock-modal');
  if (modalBackdrop) {
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Render Skeleton Loading State (6 shimmer cards)
 */
export function renderLoadingSkeleton() {
  const container = document.getElementById('main-bento-grid');
  if (!container) return;

  container.innerHTML = Array.from({ length: 6 }).map(() => `
    <div class="skeleton-card skeleton-shimmer" aria-hidden="true">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div style="width: 3rem; height: 3rem; border-radius: 12px; background: rgba(0,0,0,0.06);"></div>
        <div style="width: 4rem; height: 1.25rem; border-radius: 999px; background: rgba(0,0,0,0.06);"></div>
      </div>
      <div style="margin-bottom: 1.5rem;">
        <div style="width: 80%; height: 1.25rem; border-radius: 6px; background: rgba(0,0,0,0.06); margin-bottom: 0.5rem;"></div>
        <div style="width: 100%; height: 0.875rem; border-radius: 4px; background: rgba(0,0,0,0.06); margin-bottom: 0.375rem;"></div>
        <div style="width: 60%; height: 0.875rem; border-radius: 4px; background: rgba(0,0,0,0.06);"></div>
      </div>
      <div style="width: 100%; height: 2.25rem; border-radius: 8px; background: rgba(0,0,0,0.06);"></div>
    </div>
  `).join('');
}

/**
 * Render Empty State (Ketika pencarian atau filter kategori tidak ada hasil)
 * @param {string} query
 * @param {string} category
 */
export function renderEmptyState(query = '', category = 'all') {
  const container = document.getElementById('main-bento-grid');
  const countBadge = document.getElementById('catalog-count-badge');
  if (countBadge) countBadge.textContent = '0 Aplikasi';

  if (!container) return;

  container.innerHTML = `
    <div class="empty-state-card fade-in" role="status">
      <div class="empty-icon-box" aria-hidden="true">
        <i data-lucide="search-x" width="36" height="36"></i>
      </div>
      <h4 class="empty-title">Aplikasi Tidak Ditemukan</h4>
      <p class="empty-subtitle">
        Tidak ada aplikasi yang cocok dengan kata kunci 
        ${query ? `<strong>"${escapeHtml(query)}"</strong>` : ''} 
        ${category !== 'all' ? `pada kategori <strong>"${escapeHtml(category)}"</strong>` : ''}.
      </p>
      <button type="button" id="btn-reset-empty" class="btn-primary" data-action="reset-filters">
        <i data-lucide="rotate-ccw" width="16" height="16"></i>
        <span>Reset Filter & Pencarian</span>
      </button>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Render Error State (Jika terjadi kegagalan pemuatan data)
 * @param {string} errorMessage
 * @param {Function} retryFn
 */
export function renderErrorState(errorMessage = 'Gagal memuat katalog data aplikasi.', retryFn = null) {
  const container = document.getElementById('main-bento-grid');
  if (!container) return;

  container.innerHTML = `
    <div class="error-state-card fade-in" role="alert">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;" aria-hidden="true">⚠️</div>
      <h4 style="font-weight: 700; font-size: 1.125rem; margin-bottom: 0.375rem;">Terjadi Kesalahan Sistem</h4>
      <p style="font-size: 0.875rem; margin-bottom: 1rem;">${escapeHtml(errorMessage)}</p>
      <button type="button" id="btn-retry-error" class="btn-primary" style="background: #DC2626;">
        <i data-lucide="refresh-cw" width="16" height="16"></i>
        <span>Coba Muat Ulang</span>
      </button>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  const retryBtn = document.getElementById('btn-retry-error');
  if (retryBtn && retryFn) {
    retryBtn.addEventListener('click', retryFn);
  }
}

/**
 * Render Success State (Daftar kartu Bento interaktif)
 * @param {Array} apps
 * @param {Object} filterState
 */
export function renderSuccessState(apps, { category = 'all', query = '' } = {}) {
  const container = document.getElementById('main-bento-grid');
  const countBadge = document.getElementById('catalog-count-badge');
  const headingText = document.getElementById('catalog-heading-text');
  const favorites = getFavorites();

  if (countBadge) countBadge.textContent = `${apps.length} Aplikasi`;

  if (headingText) {
    if (category === 'favorites') {
      headingText.textContent = 'Katalog Aplikasi Favorit';
    } else if (category !== 'all') {
      headingText.textContent = `Katalog: ${category.toUpperCase()}`;
    } else {
      headingText.textContent = query ? `Hasil Pencarian ("${query}")` : 'Semua Katalog Aplikasi';
    }
  }

  if (!apps || apps.length === 0) {
    renderEmptyState(query, category);
    renderFavoritesSection(favorites);
    return;
  }

  if (container) {
    container.innerHTML = apps.map(app => renderAppCard(app, favorites.includes(app.id))).join('');
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
    animateBentoGridCards('#main-bento-grid');
  }

  // Render Baris Cepat Favorit jika ada
  renderFavoritesSection(favorites, category);
}

/**
 * Render seksi quick-row favorit di bagian atas
 * @param {Array} favorites
 * @param {string} currentCategory
 */
function renderFavoritesSection(favorites = getFavorites(), currentCategory = 'all') {
  const favSection = document.getElementById('favorites-section');
  const favGrid = document.getElementById('favorites-grid');
  const favBadge = document.getElementById('favorites-count-badge');

  if (!favSection || !favGrid) return;

  // Sembunyikan jika tidak ada favorit ATAU pengguna memang sedang membuka tab Favorit
  if (!favorites || favorites.length === 0 || currentCategory === 'favorites') {
    favSection.style.display = 'none';
    favGrid.innerHTML = '';
    return;
  }

  const allApps = getAllApps();
  const favApps = allApps.filter(a => favorites.includes(a.id));

  if (favApps.length === 0) {
    favSection.style.display = 'none';
    favGrid.innerHTML = '';
    return;
  }

  favSection.style.display = 'block';
  if (favBadge) favBadge.textContent = `${favApps.length} Favorit`;
  favGrid.innerHTML = favApps.map(app => renderAppCard(app, true)).join('');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
  animateBentoGridCards('#favorites-grid');
}

/**
 * Inisialisasi event delegation untuk interaksi pada kartu Bento
 * @param {Object} handlers
 */
export function initBentoGridEvents({ onOpenModal, onEditApp }) {
  onOpenModalCallback = onOpenModal;
  onEditAppCallback = onEditApp;

  // Event delegation di body / main agar mencakup main-grid dan favorites-grid
  document.addEventListener('click', (e) => {
    // 1. Toggle Favorit
    const favBtn = e.target.closest('[data-action="toggle-fav"]');
    if (favBtn) {
      e.preventDefault();
      const appId = favBtn.getAttribute('data-app-id');
      if (appId) {
        toggleFavorite(appId);
      }
      return;
    }

    // 2. Open Modal Viewer (iframe)
    const modalBtn = e.target.closest('[data-action="open-modal"]');
    if (modalBtn) {
      e.preventDefault();
      const appId = modalBtn.getAttribute('data-app-id');
      if (appId) {
        recordAppLaunch(appId);
        if (typeof onOpenModalCallback === 'function') {
          const app = getAppById(appId);
          if (app) onOpenModalCallback(app);
        }
      }
      return;
    }

    // 2b. Open Direct Link / Tab Baru
    const launchLink = e.target.closest('a.btn-launch, [data-action="open-tab"]');
    if (launchLink) {
      const appId = launchLink.getAttribute('data-app-id');
      if (appId) {
        recordAppLaunch(appId);
      }
    }

    // 3. Edit App (Admin)
    const editBtn = e.target.closest('[data-action="edit-app"]');
    if (editBtn) {
      e.preventDefault();
      const appId = editBtn.getAttribute('data-app-id');
      if (appId && typeof onEditAppCallback === 'function') {
        const app = getAppById(appId);
        if (app) onEditAppCallback(app);
      }
      return;
    }

    // 4. Reset Filters dari Empty State
    const resetBtn = e.target.closest('[data-action="reset-filters"]');
    if (resetBtn) {
      e.preventDefault();
      resetFilters();
      return;
    }

    // 5. Prompt PIN Akses Aplikasi Terkunci
    const lockBtn = e.target.closest('[data-action="prompt-app-lock"]');
    if (lockBtn) {
      e.preventDefault();
      const appId = lockBtn.getAttribute('data-app-id');
      if (appId) {
        openAppLockModal(appId);
      }
      return;
    }
  });

  // Setup form & close events untuk Modal PIN Akses Aplikasi
  const lockForm = document.getElementById('app-lock-form');
  if (lockForm && !lockForm.__hasLockSubmitListener) {
    lockForm.__hasLockSubmitListener = true;
    lockForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const appId = document.getElementById('lock-modal-app-id').value;
      const pinInput = document.getElementById('app-lock-pin-input');
      const errEl = document.getElementById('app-lock-error');
      const inputPin = pinInput ? pinInput.value : '';
      const rateLimitBefore = checkRateLimit();

      if (rateLimitBefore.isLocked) {
        if (errEl) {
          errEl.textContent = `🔒 Akses ditangguhkan! Silakan tunggu ${rateLimitBefore.remainingSeconds} detik.`;
          errEl.style.display = 'block';
        }
        return;
      }

      if (verifyAppAccessPin(inputPin)) {
        closeAppLockModal();
        const app = getAppById(appId);
        if (app) {
          recordAppLaunch(app.id);
          if (app.targetMode === 'iframe' && typeof onOpenModalCallback === 'function') {
            onOpenModalCallback(app);
          } else if (app.targetMode === '_self') {
            window.location.href = app.targetUrl;
          } else {
            window.open(app.targetUrl, '_blank', 'noopener,noreferrer');
          }
        }
      } else {
        const rateLimitAfter = checkRateLimit();
        if (errEl) {
          if (rateLimitAfter.isLocked) {
            errEl.textContent = `🚨 Terlalu banyak percobaan! Akses ditangguhkan selama ${rateLimitAfter.remainingSeconds} detik.`;
          } else {
            errEl.textContent = `❌ PIN Akses Salah! Sisa percobaan: ${rateLimitAfter.attemptsLeft} kali lagi.`;
          }
          errEl.style.display = 'block';
        }
        if (pinInput) {
          pinInput.select();
        }
      }
    });
  }

  const closeLockBtn = document.getElementById('close-lock-modal-btn');
  if (closeLockBtn && !closeLockBtn.__hasListener) {
    closeLockBtn.__hasListener = true;
    closeLockBtn.addEventListener('click', closeAppLockModal);
  }

  const cancelLockBtn = document.getElementById('cancel-lock-modal-btn');
  if (cancelLockBtn && !cancelLockBtn.__hasListener) {
    cancelLockBtn.__hasListener = true;
    cancelLockBtn.addEventListener('click', closeAppLockModal);
  }

  const lockBackdrop = document.getElementById('app-lock-modal');
  if (lockBackdrop && !lockBackdrop.__hasBackdropListener) {
    lockBackdrop.__hasBackdropListener = true;
    lockBackdrop.addEventListener('click', (e) => {
      if (e.target === lockBackdrop) {
        closeAppLockModal();
      }
    });
  }
}
