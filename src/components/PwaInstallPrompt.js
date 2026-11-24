/**
 * COMPONENT: IN-APP PWA INSTALL PROMPT
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Menangkap event 'beforeinstallprompt' dari browser Android / iOS / Desktop Chrome,
 * dan memunculkan toast banner ramah untuk menginstal aplikasi ke Homescreen.
 */

let deferredInstallPrompt = null;

export function initPwaInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Cegah mini-infobar default browser
    e.preventDefault();
    deferredInstallPrompt = e;

    showInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    hideInstallBanner();
    console.log('[PWA] Portal Yiqul berhasil terpasang di perangkat pengguna!');
  });
}

function showInstallBanner() {
  let banner = document.getElementById('pwa-install-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'pwa-install-toast fade-in';
    banner.innerHTML = `
      <div class="pwa-toast-content">
        <div class="pwa-toast-icon" aria-hidden="true">
          <i data-lucide="smartphone" width="22" height="22"></i>
        </div>
        <div class="pwa-toast-text">
          <strong>Pasang Aplikasi Portal Yiqul</strong>
          <p>Akses 1-klik langsung dari layar utama HP / Komputer tanpa buka browser.</p>
        </div>
      </div>
      <div class="pwa-toast-actions">
        <button type="button" id="btn-pwa-dismiss" class="btn-secondary" style="font-size: 0.75rem; padding: 0.35rem 0.75rem; min-height: 32px;">
          Nanti Saja
        </button>
        <button type="button" id="btn-pwa-install" class="btn-primary" style="font-size: 0.75rem; padding: 0.35rem 1rem; min-height: 32px;">
          <i data-lucide="download" width="14" height="14"></i> Pasang
        </button>
      </div>
    `;
    document.body.appendChild(banner);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    document.getElementById('btn-pwa-dismiss').addEventListener('click', hideInstallBanner);
    document.getElementById('btn-pwa-install').addEventListener('click', triggerInstallPrompt);
  } else {
    banner.style.display = 'flex';
  }
}

function hideInstallBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

async function triggerInstallPrompt() {
  if (!deferredInstallPrompt) return;

  deferredInstallPrompt.prompt();
  const choiceResult = await deferredInstallPrompt.userChoice;
  if (choiceResult.outcome === 'accepted') {
    console.log('[PWA] Pengguna menyetujui pemasangan aplikasi.');
  }
  deferredInstallPrompt = null;
  hideInstallBanner();
}
