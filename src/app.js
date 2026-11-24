/**
 * MASTER APPLICATION ORCHESTRATOR & DUAL-VIEW ROUTER
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * Yayasan Islam Qudwatul Ummah (Yiqul)
 */

import { getAllApps, getFavorites, logoutAdmin } from './services/storage.js';
import { initSessionTimeout, checkClickjackingGuard } from './services/security.js';
import { recordVisit } from './services/analytics.js';
import { initHeader } from './components/Header.js';
import { initSearchAndRibbon, filterApps, getCurrentFilterState } from './components/SearchRibbon.js';
import { 
  renderLoadingSkeleton, 
  renderSuccessState, 
  renderErrorState, 
  initBentoGridEvents 
} from './components/BentoGrid.js';
import { initModalViewer, openModalViewer } from './components/ModalViewer.js';
import { initBannerSlider } from './components/BannerSlider.js';
import { initAdminPanel, openAdminPanel, closeAdminPanel } from './components/AdminPanel.js';
import { renderLandingHero } from './components/LandingHero.js';
import { renderLandingFeatures } from './components/LandingFeatures.js';
import { initPwaInstallPrompt } from './components/PwaInstallPrompt.js';

/**
 * Update rendering katalog Bento Grid berdasarkan filter saat ini
 */
function refreshCatalogView() {
  try {
    const allApps = getAllApps();
    const favorites = getFavorites();
    const filterState = getCurrentFilterState();
    const filtered = filterApps(allApps, {
      category: filterState.category,
      query: filterState.query,
      favorites
    });
    renderSuccessState(filtered, filterState);
  } catch (error) {
    console.error('[Portal App] Gagal me-refresh tampilan katalog:', error);
    renderErrorState(error.message, refreshCatalogView);
  }
}

/**
 * Handle Hash-Based Dual-View Routing (#/ Landing Page vs #/portal Bento Launcher)
 */
function handleRouting() {
  const hash = window.location.hash || '';

  if (hash.startsWith('#/portal')) {
    // Mode View 2: Portal Bento Launcher
    document.body.classList.remove('view-landing');
    document.body.classList.add('view-portal');
    refreshCatalogView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // Mode View 1: Landing Page (Techwitpro Style)
    document.body.classList.remove('view-portal');
    document.body.classList.add('view-landing');
    renderLandingHero();
    renderLandingFeatures();

    // Jika mengarah ke anchor section tertentu (misal: #showcase-section)
    if (hash.startsWith('#') && hash !== '#/' && hash !== '#') {
      const targetEl = document.querySelector(hash);
      if (targetEl) {
        setTimeout(() => targetEl.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

/**
 * Bootstrapping Aplikasi Utama Portal Yiqul
 */
function bootstrap() {
  if (typeof window !== 'undefined') {
    if (window.__PORTAL_YIQUL_BOOTSTRAPPED__) return;
    window.__PORTAL_YIQUL_BOOTSTRAPPED__ = true;
  }
  console.log('🚀 [Portal Yiqul] Initializing Unified Ecosystem Launcher & Landing Page...');

  // 0. Pelacakan Pengunjung & Kunjungan Harian Real-time
  try {
    recordVisit();
  } catch (err) {
    console.warn('[Analytics] Gagal mencatat kunjungan:', err);
  }

  // 1. Inisialisasi Tampilan Landing Page
  renderLandingHero();
  renderLandingFeatures();

  // 2. Tampilkan Skeleton Loading State untuk Portal View
  renderLoadingSkeleton();

  // 3. Inisialisasi Header, Kalender, Jam & Tema
  initHeader();

  // 4. Inisialisasi Modal Viewer (iframe)
  initModalViewer();

  // 5. Inisialisasi Banner Promosi Bergambar (Hero Slider)
  initBannerSlider();

  // 6. Inisialisasi Admin Panel 5 Tab Terpadu & Role Gate
  initAdminPanel();

  // 7. Inisialisasi Event Delegation Kartu Bento
  initBentoGridEvents({
    onOpenModal: (app) => {
      openModalViewer(app);
    },
    onEditApp: (app) => {
      openAdminPanel('apps');
    }
  });

  // 8. Inisialisasi Search & Ribbon
  initSearchAndRibbon(() => {
    refreshCatalogView();
  });

  // 9. Jalankan Router Hash Awal
  handleRouting();
  window.addEventListener('hashchange', handleRouting);

  // 10. Re-render jika branding berubah
  window.addEventListener('yiqul:branding-changed', () => {
    renderLandingHero();
    renderLandingFeatures();
  });

  // 11. Inisialisasi PWA In-App Install Prompt
  initPwaInstallPrompt();

  // 12. Register Service Worker jika di environment production PWA
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[PWA] Service Worker terdaftar:', reg.scope))
      .catch(err => console.log('[PWA] Service Worker registration skipped:', err));
  }

  // 13. Cyber Security Defense: Anti-Clickjacking Frame Guard & Session Auto-Timeout
  checkClickjackingGuard();
  initSessionTimeout(() => {
    logoutAdmin();
    closeAdminPanel();
  });
}

// Jalankan ketika DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
