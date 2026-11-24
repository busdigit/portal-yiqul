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
  if (sessionStorage.getItem('yiqul_pwa_dismissed') === 'true') {
    return;
  }

  let banner = document.getElementById('pwa-install-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'pwa-install-toast pwa-toast-enter';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Pasang Aplikasi Portal Yiqul');
    banner.innerHTML = `
      <div class="pwa-toast-header">
        <div class="pwa-toast-icon" aria-hidden="true">
          <i data-lucide="smartphone" width="22" height="22"></i>
        </div>
        <div class="pwa-toast-info">
          <div class="pwa-toast-title-row">
            <strong class="pwa-toast-title">Pasang Aplikasi Portal Yiqul</strong>
            <span class="pwa-toast-badge">PWA</span>
          </div>
          <p class="pwa-toast-desc">Akses cepat 1-klik langsung dari layar HP tanpa perlu buka browser.</p>
        </div>
        <button type="button" id="btn-pwa-close" class="pwa-toast-close" aria-label="Tutup Banner">
          <i data-lucide="x" width="16" height="16"></i>
        </button>
      </div>
      <div class="pwa-toast-actions">
        <button type="button" id="btn-pwa-dismiss" class="btn-pwa-secondary">
          Nanti Saja
        </button>
        <button type="button" id="btn-pwa-install" class="btn-pwa-primary">
          <i data-lucide="download" width="15" height="15"></i>
          <span>Pasang Sekarang</span>
        </button>
      </div>
    `;
    document.body.appendChild(banner);

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    const dismissHandler = () => {
      sessionStorage.setItem('yiqul_pwa_dismissed', 'true');
      hideInstallBanner();
    };

    document.getElementById('btn-pwa-close')?.addEventListener('click', dismissHandler);
    document.getElementById('btn-pwa-dismiss')?.addEventListener('click', dismissHandler);
    document.getElementById('btn-pwa-install')?.addEventListener('click', triggerInstallPrompt);
  } else {
    banner.style.display = 'flex';
    banner.classList.remove('pwa-toast-exit');
    banner.classList.add('pwa-toast-enter');
  }
}

function hideInstallBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.classList.remove('pwa-toast-enter');
    banner.classList.add('pwa-toast-exit');
    setTimeout(() => {
      banner.style.display = 'none';
      banner.classList.remove('pwa-toast-exit');
    }, 250);
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
