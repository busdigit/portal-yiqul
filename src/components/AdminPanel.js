/**
 * COMPONENT: COMPREHENSIVE ADMIN CONTROL PANEL & ROLE GATE
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Pusat kendali Super Administrator:
 * Tab 1: Kelola Aplikasi + Upload Logo Aplikasi via Choose File (Google Drive)
 * Tab 2: Banner Gambar Promo + Upload Banner via Choose File (Google Drive)
 * Tab 3: Logo & Branding Yayasan + Upload Logo via Choose File (Google Drive)
 * Tab 4: Dokumen & Panduan + Upload PDF via Choose File (Google Drive)
 * Tab 5: Hak Akses Role, Ubah PIN, Backup/Restore JSON & Reset
 */

import {
  getAllApps,
  addApp,
  updateApp,
  deleteApp,
  reorderApp,
  toggleAppLock,
  getBranding,
  saveBranding,
  getBanners,
  addBanner,
  updateBanner,
  deleteBanner,
  reorderBanner,
  getDocuments,
  addDocument,
  deleteDocument,
  getCurrentRole,
  setCurrentRole,
  verifyAdminPin,
  saveAdminPin,
  isAdminLoggedIn,
  logoutAdmin,
  checkRateLimit,
  getSecurityAuditLogs,
  clearSecurityAuditLogs,
  exportRegistryJson,
  importRegistryJson,
  resetToDefault
} from '../services/storage.js';
import { createFileUploader } from './FileUploader.js';
import { escapeHtml, isValidUrl } from '../services/sanitizer.js';
import { 
  getCloudBackendUrl, 
  saveCloudBackendUrl, 
  pullFromCloud, 
  pushToCloud 
} from '../services/cloudSync.js';
import {
  getFirebaseConfig,
  saveFirebaseConfig,
  pushToFirebase,
  pullFromFirebase,
  testFirebaseConnection
} from '../services/firebaseService.js';

let activeTab = 'apps'; // 'apps' | 'banners' | 'branding' | 'docs' | 'role'
let appLogoUploader = null;
let bannerImageUploader = null;
let brandingLogoUploader = null;
let documentFileUploader = null;

// Temporary states for uploaders
let currentUploadedAppLogo = '';
let currentUploadedBannerImg = '';
let currentUploadedBrandingLogo = '';
let currentUploadedDocFile = { url: '', name: '', type: '', size: '' };

/**
 * Buka Admin Panel (atau Login PIN Modal jika belum terotentikasi)
 */
export function openAdminPanel(defaultTab = 'apps') {
  activeTab = defaultTab;

  if (!isAdminLoggedIn()) {
    showAdminAuthModal();
    return;
  }

  showAdminDashboardModal();
}

/**
 * Tampilkan dialog otentikasi PIN Administrator
 */
function showAdminAuthModal() {
  const modalBackdrop = document.getElementById('admin-auth-modal');
  if (modalBackdrop) {
    modalBackdrop.classList.add('open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    const pinInput = document.getElementById('admin-pin-input');
    const errorEl = document.getElementById('admin-auth-error');
    const rateLimit = checkRateLimit();

    if (errorEl) {
      if (rateLimit.isLocked) {
        errorEl.textContent = `🔒 Akses ditangguhkan! Terlalu banyak percobaan salah. Silakan tunggu ${rateLimit.remainingSeconds} detik.`;
        errorEl.style.display = 'block';
      } else {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
      }
    }

    if (pinInput) {
      pinInput.value = '';
      if (!rateLimit.isLocked) {
        setTimeout(() => pinInput.focus(), 100);
      }
    }
  }
}

export function closeAdminAuthModal() {
  const modalBackdrop = document.getElementById('admin-auth-modal');
  if (modalBackdrop) {
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Tampilkan Dashboard Admin Panel 5 Tab
 */
function showAdminDashboardModal() {
  closeAdminAuthModal();
  const panelBackdrop = document.getElementById('admin-panel-backdrop');
  if (panelBackdrop) {
    panelBackdrop.classList.add('open');
    panelBackdrop.setAttribute('aria-hidden', 'false');
    renderActiveTabContent();
  }
}

export function closeAdminPanel() {
  const panelBackdrop = document.getElementById('admin-panel-backdrop');
  if (panelBackdrop) {
    panelBackdrop.classList.remove('open');
    panelBackdrop.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Render konten tab yang aktif di Admin Panel
 */
export function renderActiveTabContent() {
  // Update Tab Navigation Pills
  document.querySelectorAll('.admin-nav-tab').forEach(tabBtn => {
    const tabName = tabBtn.getAttribute('data-tab');
    if (tabName === activeTab) {
      tabBtn.classList.add('active');
    } else {
      tabBtn.classList.remove('active');
    }
  });

  const contentArea = document.getElementById('admin-panel-tab-content');
  if (!contentArea) return;

  if (activeTab === 'apps') {
    renderTabApps(contentArea);
  } else if (activeTab === 'banners') {
    renderTabBanners(contentArea);
  } else if (activeTab === 'branding') {
    renderTabBranding(contentArea);
  } else if (activeTab === 'docs') {
    renderTabDocuments(contentArea);
  } else if (activeTab === 'role') {
    renderTabRoleSettings(contentArea);
  }

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/* ==========================================================================
   TAB 1: KELOLA APLIKASI (DENGAN CHOOSE FILE LOGO APPS GOOGLE DRIVE)
   ========================================================================== */
function renderTabApps(container) {
  const allApps = getAllApps();

  container.innerHTML = `
    <div class="tab-pane-layout">
      <!-- Form Input Aplikasi -->
      <div class="tab-form-column">
        <h3 class="admin-pane-title">
          <i data-lucide="plus-circle" width="18" height="18"></i>
          <span id="app-editor-heading">Pasang Link Aplikasi Baru</span>
        </h3>
        
        <form id="admin-app-form">
          <input type="hidden" id="admin-form-app-id" value="">

          <div class="form-group">
            <label class="form-label" for="admin-form-app-title">Nama Aplikasi *</label>
            <input type="text" id="admin-form-app-title" class="form-input" placeholder="Contoh: E-Rapor Santri Digital" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="admin-form-app-url">URL Target *</label>
            <input type="url" id="admin-form-app-url" class="form-input" placeholder="https://erapor.qudwatulummah.sch.id" required>
          </div>

          <!-- Uploader Logo Khusus Aplikasi (Choose File ke Drive) -->
          <div id="app-logo-uploader-container"></div>

          <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div>
              <label class="form-label" for="admin-form-app-cat">Kategori</label>
              <select id="admin-form-app-cat" class="form-select">
                <option value="akademik">Akademik & LMS</option>
                <option value="tahfidz">Tahfidz & Asrama</option>
                <option value="keuangan">Keuangan & Kasir</option>
                <option value="sdm">SDM & Presensi</option>
                <option value="sarpras">Sarpras & Aset</option>
                <option value="wali">Layanan Wali</option>
                <option value="umum">Publik & Utility</option>
              </select>
            </div>
            <div>
              <label class="form-label" for="admin-form-app-icon">Icon Fallback</label>
              <select id="admin-form-app-icon" class="form-select">
                <option value="Globe">Globe</option>
                <option value="GraduationCap">GraduationCap</option>
                <option value="BookOpen">BookOpen</option>
                <option value="Coins">Coins</option>
                <option value="Users">Users</option>
                <option value="UserCheck">UserCheck</option>
                <option value="Building2">Building2</option>
                <option value="HeartHandshake">HeartHandshake</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="admin-form-app-desc">Deskripsi Singkat</label>
            <textarea id="admin-form-app-desc" class="form-textarea" placeholder="Ringkasan fungsi aplikasi..."></textarea>
          </div>

          <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div>
              <label class="form-label" for="admin-form-app-target">Mode Buka</label>
              <select id="admin-form-app-target" class="form-select">
                <option value="_blank">Tab Baru (_blank)</option>
                <option value="iframe">Modal Window (iframe)</option>
                <option value="_self">Jendela Ini (_self)</option>
              </select>
            </div>
            <div>
              <label class="form-label" for="admin-form-app-status">Status</label>
              <select id="admin-form-app-status" class="form-select">
                <option value="active">🟢 Online</option>
                <option value="maintenance">🟡 Maintenance</option>
                <option value="new">🔵 Baru</option>
              </select>
            </div>
          </div>

          <!-- Hak Akses / Proteksi Kunci Aplikasi -->
          <div class="form-group">
            <label class="form-label" for="admin-form-app-locked">Hak Akses & Proteksi Aplikasi</label>
            <select id="admin-form-app-locked" class="form-select">
              <option value="false">🔓 Terbuka untuk Umum (Semua Bisa Buka)</option>
              <option value="true">🔒 Terkunci (Khusus Admin / Butuh PIN Akses)</option>
            </select>
            <span style="font-size: 0.6875rem; color: var(--text-muted); display: block; margin-top: 0.25rem;">
              Jika dikunci, pengguna harus memasukkan PIN Yayasan (atau login Admin) untuk membuka aplikasi ini.
            </span>
          </div>

          <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.25rem;">
            <button type="button" id="admin-app-reset-btn" class="btn-secondary">Reset Form</button>
            <button type="submit" class="btn-primary" id="admin-app-save-btn">
              <i data-lucide="check" width="16" height="16"></i> Simpan Aplikasi
            </button>
          </div>
        </form>
      </div>

      <!-- List Aplikasi Terpasang -->
      <div class="tab-list-column">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h4 style="font-weight: 700; font-size: 0.9375rem; color: var(--text-primary);">
            Daftar Aplikasi (${allApps.length})
          </h4>
        </div>
        <div class="admin-items-scroll">
          ${allApps.map((app, idx) => `
            <div class="admin-item-row">
              <div class="admin-item-thumb">
                ${app.customIconUrl ? `<img src="${app.customIconUrl}" alt="${app.title}" />` : `<i data-lucide="${app.iconName || 'Globe'}" width="20" height="20"></i>`}
              </div>
              <div class="admin-item-info">
                <strong>${escapeHtml(app.title)}</strong>
                <span style="font-size: 0.6875rem; color: var(--text-muted);">${escapeHtml(app.targetUrl)}</span>
              </div>
              <div style="display: flex; gap: 0.25rem; align-items: center;">
                <button type="button" class="btn-icon btn-toggle-lock" data-app-id="${app.id}" title="${app.isLocked ? 'Status Terkunci: Butuh PIN (Klik untuk Buka Akses)' : 'Status Terbuka: Umum (Klik untuk Kunci Akses)'}" style="${app.isLocked ? 'color: #F59E0B; background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.35);' : 'color: var(--text-muted);'}">
                  <i data-lucide="${app.isLocked ? 'lock' : 'unlock'}" width="14" height="14"></i>
                </button>
                <button type="button" class="btn-icon btn-move-app-up" data-app-id="${app.id}" title="Pindahkan ke Atas" ${idx === 0 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>
                  <i data-lucide="arrow-up" width="14" height="14"></i>
                </button>
                <button type="button" class="btn-icon btn-move-app-down" data-app-id="${app.id}" title="Pindahkan ke Bawah" ${idx === allApps.length - 1 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>
                  <i data-lucide="arrow-down" width="14" height="14"></i>
                </button>
                <button type="button" class="btn-icon btn-edit-app-item" data-app-id="${app.id}" title="Edit">
                  <i data-lucide="pencil" width="14" height="14"></i>
                </button>
                <button type="button" class="btn-icon btn-delete-app-item" data-app-id="${app.id}" title="Hapus" style="color: #EF4444;">
                  <i data-lucide="trash-2" width="14" height="14"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Init Choose File Uploader untuk Logo Aplikasi
  appLogoUploader = createFileUploader({
    container: '#app-logo-uploader-container',
    accept: 'image/*',
    folderType: 'app_icons',
    currentUrl: currentUploadedAppLogo,
    label: 'Upload Logo Khusus Aplikasi (Pilih dari PC ke Drive)',
    onSuccess: (res) => {
      currentUploadedAppLogo = res.directUrl;
    },
    onRemove: () => {
      currentUploadedAppLogo = '';
    }
  });

  // Bind App Form Submit
  const form = document.getElementById('admin-app-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('admin-form-app-id').value;
      const title = document.getElementById('admin-form-app-title').value.trim();
      const targetUrl = document.getElementById('admin-form-app-url').value.trim();
      const category = document.getElementById('admin-form-app-cat').value;
      const iconName = document.getElementById('admin-form-app-icon').value;
      const shortDescription = document.getElementById('admin-form-app-desc').value.trim();
      const targetMode = document.getElementById('admin-form-app-target').value;
      const status = document.getElementById('admin-form-app-status').value;
      const isLocked = document.getElementById('admin-form-app-locked').value === 'true';

      if (!isValidUrl(targetUrl)) {
        alert('URL tujuan tidak valid! Wajib berawalan https:// atau http://');
        return;
      }

      if (id) {
        updateApp(id, {
          title,
          targetUrl,
          category,
          iconName,
          customIconUrl: currentUploadedAppLogo,
          shortDescription,
          targetMode,
          status,
          isLocked
        });
      } else {
        addApp({
          title,
          targetUrl,
          category,
          iconName,
          customIconUrl: currentUploadedAppLogo,
          shortDescription,
          targetMode,
          status,
          isLocked
        });
      }

      currentUploadedAppLogo = '';
      renderTabApps(container);
    });
  }

  // Bind Reset Form
  const resetBtn = document.getElementById('admin-app-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentUploadedAppLogo = '';
      const lockSelect = document.getElementById('admin-form-app-locked');
      if (lockSelect) lockSelect.value = 'false';
      renderTabApps(container);
    });
  }

  // Bind Edit & Delete Items
  container.querySelectorAll('.btn-edit-app-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const appId = btn.getAttribute('data-app-id');
      const app = allApps.find(a => a.id === appId);
      if (!app) return;

      document.getElementById('admin-form-app-id').value = app.id;
      document.getElementById('admin-form-app-title').value = app.title;
      document.getElementById('admin-form-app-url').value = app.targetUrl;
      document.getElementById('admin-form-app-cat').value = app.category;
      document.getElementById('admin-form-app-icon').value = app.iconName || 'Globe';
      document.getElementById('admin-form-app-desc').value = app.shortDescription || '';
      document.getElementById('admin-form-app-target').value = app.targetMode || '_blank';
      document.getElementById('admin-form-app-status').value = app.status || 'active';
      const lockSelect = document.getElementById('admin-form-app-locked');
      if (lockSelect) lockSelect.value = app.isLocked ? 'true' : 'false';
      document.getElementById('app-editor-heading').textContent = `Edit: ${app.title}`;

      currentUploadedAppLogo = app.customIconUrl || '';
      if (appLogoUploader) appLogoUploader.setValue(currentUploadedAppLogo);
    });
  });

  // Bind Toggle Kunci / Buka Akses Aplikasi
  container.querySelectorAll('.btn-toggle-lock').forEach(btn => {
    btn.addEventListener('click', () => {
      const appId = btn.getAttribute('data-app-id');
      toggleAppLock(appId);
      renderTabApps(container);
    });
  });

  // Bind Pindahkan Posisi Aplikasi (Move Up & Down)
  container.querySelectorAll('.btn-move-app-up').forEach(btn => {
    btn.addEventListener('click', () => {
      const appId = btn.getAttribute('data-app-id');
      reorderApp(appId, 'up');
      renderTabApps(container);
    });
  });

  container.querySelectorAll('.btn-move-app-down').forEach(btn => {
    btn.addEventListener('click', () => {
      const appId = btn.getAttribute('data-app-id');
      reorderApp(appId, 'down');
      renderTabApps(container);
    });
  });

  container.querySelectorAll('.btn-delete-app-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const appId = btn.getAttribute('data-app-id');
      if (confirm('Hapus aplikasi ini dari katalog?')) {
        deleteApp(appId);
        renderTabApps(container);
      }
    });
  });
}

/* ==========================================================================
   TAB 2: BANNER BERGAMBAR & PROMO (CHOOSE FILE BANNER GOOGLE DRIVE)
   ========================================================================== */
function renderTabBanners(container) {
  const banners = getBanners();

  container.innerHTML = `
    <div class="tab-pane-layout">
      <!-- Form Input Banner -->
      <div class="tab-form-column">
        <h3 class="admin-pane-title">
          <i data-lucide="image" width="18" height="18"></i>
          <span id="banner-editor-heading">Pasang Banner Promosi Baru</span>
        </h3>

        <form id="admin-banner-form">
          <input type="hidden" id="admin-banner-id" value="">

          <div class="form-group">
            <label class="form-label" for="admin-banner-title">Judul Banner *</label>
            <input type="text" id="admin-banner-title" class="form-input" placeholder="Contoh: Pendaftaran Santri Baru 2026/2027" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="admin-banner-sub">Keterangan / Subtitle</label>
            <textarea id="admin-banner-sub" class="form-textarea" placeholder="Deskripsi singkat kegiatan/agenda..."></textarea>
          </div>

          <!-- Uploader Gambar Banner (Choose File ke Drive) -->
          <div id="banner-image-uploader-container"></div>

          <div class="form-group" style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.75rem;">
            <div>
              <label class="form-label" for="admin-banner-url">URL Aksi Link (Opsional)</label>
              <input type="url" id="admin-banner-url" class="form-input" placeholder="https://psb.qudwatulummah.sch.id">
            </div>
            <div>
              <label class="form-label" for="admin-banner-btn-text">Teks Tombol</label>
              <input type="text" id="admin-banner-btn-text" class="form-input" placeholder="Daftar Sekarang ↗">
            </div>
          </div>

          <div class="form-group" style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" id="admin-banner-active" checked style="width: 18px; height: 18px;">
            <label for="admin-banner-active" style="font-size: 0.875rem; font-weight: 600; cursor: pointer;">
              Aktifkan banner ini di halaman beranda
            </label>
          </div>

          <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.25rem;">
            <button type="button" id="admin-banner-reset-btn" class="btn-secondary">Reset</button>
            <button type="submit" class="btn-primary">
              <i data-lucide="check" width="16" height="16"></i> Simpan Banner
            </button>
          </div>
        </form>
      </div>

      <!-- List Banner Terpasang -->
      <div class="tab-list-column">
        <h4 style="font-weight: 700; font-size: 0.9375rem; margin-bottom: 0.75rem;">
          Banner Terpasang (${banners.length})
        </h4>
        <div class="admin-items-scroll">
          ${banners.map((b, idx) => `
            <div class="admin-item-row">
              <div class="admin-item-thumb" style="width: 72px; height: 48px; border-radius: 6px;">
                <img src="${b.imageUrl}" alt="${b.title}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <div class="admin-item-info">
                <strong>${escapeHtml(b.title)}</strong>
                <span style="font-size: 0.6875rem; color: ${b.isActive ? '#059669' : '#94A3B8'};">
                  ${b.isActive ? '🟢 Ditampilkan di Beranda' : '⚪ Nonaktif'}
                </span>
              </div>
              <div style="display: flex; gap: 0.25rem; align-items: center;">
                <button type="button" class="btn-icon btn-move-banner-up" data-banner-id="${b.id}" title="Pindahkan ke Atas" ${idx === 0 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>
                  <i data-lucide="arrow-up" width="14" height="14"></i>
                </button>
                <button type="button" class="btn-icon btn-move-banner-down" data-banner-id="${b.id}" title="Pindahkan ke Bawah" ${idx === banners.length - 1 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>
                  <i data-lucide="arrow-down" width="14" height="14"></i>
                </button>
                <button type="button" class="btn-icon btn-edit-banner-item" data-banner-id="${b.id}" title="Edit">
                  <i data-lucide="pencil" width="14" height="14"></i>
                </button>
                <button type="button" class="btn-icon btn-delete-banner-item" data-banner-id="${b.id}" title="Hapus" style="color: #EF4444;">
                  <i data-lucide="trash-2" width="14" height="14"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  bannerImageUploader = createFileUploader({
    container: '#banner-image-uploader-container',
    accept: 'image/*',
    folderType: 'banners',
    currentUrl: currentUploadedBannerImg,
    label: 'Upload Gambar Banner (Pilih File dari PC ke Google Drive)',
    onSuccess: (res) => {
      currentUploadedBannerImg = res.directUrl;
    },
    onRemove: () => {
      currentUploadedBannerImg = '';
    }
  });

  const form = document.getElementById('admin-banner-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('admin-banner-id').value;
      const title = document.getElementById('admin-banner-title').value.trim();
      const subtitle = document.getElementById('admin-banner-sub').value.trim();
      const actionUrl = document.getElementById('admin-banner-url').value.trim();
      const actionText = document.getElementById('admin-banner-btn-text').value.trim();
      const isActive = document.getElementById('admin-banner-active').checked;

      if (!currentUploadedBannerImg) {
        alert('Harap pilih/unggah gambar banner terlebih dahulu!');
        return;
      }

      if (id) {
        updateBanner(id, {
          title,
          subtitle,
          imageUrl: currentUploadedBannerImg,
          actionUrl,
          actionText,
          isActive
        });
      } else {
        addBanner({
          title,
          subtitle,
          imageUrl: currentUploadedBannerImg,
          actionUrl,
          actionText,
          isActive
        });
      }

      currentUploadedBannerImg = '';
      renderTabBanners(container);
    });
  }

  const resetBtn = document.getElementById('admin-banner-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentUploadedBannerImg = '';
      renderTabBanners(container);
    });
  }

  // Bind Pindahkan Posisi Banner (Move Up & Down)
  container.querySelectorAll('.btn-move-banner-up').forEach(btn => {
    btn.addEventListener('click', () => {
      const bannerId = btn.getAttribute('data-banner-id');
      reorderBanner(bannerId, 'up');
      renderTabBanners(container);
    });
  });

  container.querySelectorAll('.btn-move-banner-down').forEach(btn => {
    btn.addEventListener('click', () => {
      const bannerId = btn.getAttribute('data-banner-id');
      reorderBanner(bannerId, 'down');
      renderTabBanners(container);
    });
  });

  container.querySelectorAll('.btn-edit-banner-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const bannerId = btn.getAttribute('data-banner-id');
      const b = banners.find(item => item.id === bannerId);
      if (!b) return;

      document.getElementById('admin-banner-id').value = b.id;
      document.getElementById('admin-banner-title').value = b.title;
      document.getElementById('admin-banner-sub').value = b.subtitle || '';
      document.getElementById('admin-banner-url').value = b.actionUrl || '';
      document.getElementById('admin-banner-btn-text').value = b.actionText || 'Daftar Sekarang ↗';
      document.getElementById('admin-banner-active').checked = b.isActive !== false;
      document.getElementById('banner-editor-heading').textContent = `Edit Banner: ${b.title}`;

      currentUploadedBannerImg = b.imageUrl || '';
      if (bannerImageUploader) bannerImageUploader.setValue(currentUploadedBannerImg);
    });
  });

  container.querySelectorAll('.btn-delete-banner-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const bannerId = btn.getAttribute('data-banner-id');
      if (confirm('Hapus banner ini?')) {
        deleteBanner(bannerId);
        renderTabBanners(container);
      }
    });
  });
}

/* ==========================================================================
   TAB 3: LOGO & BRANDING YAYASAN (CHOOSE FILE LOGO PORTAL GOOGLE DRIVE)
   ========================================================================== */
function renderTabBranding(container) {
  const branding = getBranding();
  currentUploadedBrandingLogo = branding.logoUrl || '';

  container.innerHTML = `
    <div style="max-width: 650px; margin: 0 auto;">
      <h3 class="admin-pane-title" style="margin-bottom: 1.25rem;">
        <i data-lucide="palette" width="20" height="20"></i>
        <span>Pengaturan Identitas & Logo Yayasan</span>
      </h3>

      <form id="admin-branding-form">
        <!-- Uploader Logo Yayasan (Choose File ke Google Drive) -->
        <div id="branding-logo-uploader-container"></div>

        <div class="form-group">
          <label class="form-label" for="brand-portal-title">Nama Portal Utama *</label>
          <input type="text" id="brand-portal-title" class="form-input" value="${escapeHtml(branding.portalTitle)}" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="brand-portal-sub">Sub Judul / Tagline</label>
          <input type="text" id="brand-portal-sub" class="form-input" value="${escapeHtml(branding.portalSubtitle)}">
        </div>

        <div class="form-group">
          <label class="form-label" for="brand-org-name">Nama Yayasan / Lembaga</label>
          <input type="text" id="brand-org-name" class="form-input" value="${escapeHtml(branding.organizationName)}">
        </div>

        <div style="margin-top: 1.5rem; text-align: right;">
          <button type="submit" class="btn-primary" style="min-width: 180px;">
            <i data-lucide="check" width="16" height="16"></i> Simpan Branding
          </button>
        </div>
      </form>
    </div>
  `;

  brandingLogoUploader = createFileUploader({
    container: '#branding-logo-uploader-container',
    accept: 'image/*',
    folderType: 'logos',
    currentUrl: currentUploadedBrandingLogo,
    label: 'Upload Logo Yayasan (Pilih File dari PC ke Folder Google Drive LOGOS)',
    onSuccess: (res) => {
      currentUploadedBrandingLogo = res.directUrl;
    },
    onRemove: () => {
      currentUploadedBrandingLogo = '';
    }
  });

  const form = document.getElementById('admin-branding-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const portalTitle = document.getElementById('brand-portal-title').value.trim();
      const portalSubtitle = document.getElementById('brand-portal-sub').value.trim();
      const organizationName = document.getElementById('brand-org-name').value.trim();

      saveBranding({
        portalTitle,
        portalSubtitle,
        organizationName,
        logoUrl: currentUploadedBrandingLogo
      });

      alert('Identitas & Logo Yayasan berhasil disimpan dan langsung diperbarui di antarmuka!');
      renderTabBranding(container);
    });
  }
}

/* ==========================================================================
   TAB 4: DOKUMEN & PANDUAN (CHOOSE FILE PDF/DOC KE GOOGLE DRIVE)
   ========================================================================== */
function renderTabDocuments(container) {
  const docs = getDocuments();

  container.innerHTML = `
    <div class="tab-pane-layout">
      <!-- Form Input Dokumen -->
      <div class="tab-form-column">
        <h3 class="admin-pane-title">
          <i data-lucide="file-up" width="18" height="18"></i>
          <span>Upload Dokumen / Buku Panduan Baru</span>
        </h3>

        <form id="admin-doc-form">
          <div class="form-group">
            <label class="form-label" for="admin-doc-title">Nama Dokumen *</label>
            <input type="text" id="admin-doc-title" class="form-input" placeholder="Contoh: Buku Panduan Santri 2026.pdf" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="admin-doc-cat">Kategori Dokumen</label>
            <select id="admin-doc-cat" class="form-select">
              <option value="Panduan IT">Panduan IT</option>
              <option value="Akademik">Akademik & Kurikulum</option>
              <option value="Kepesantrenan">Kepesantrenan & Tahfidz</option>
              <option value="Keuangan">Keuangan & Regulasi</option>
            </select>
          </div>

          <!-- Uploader Dokumen (Choose File PDF/DOCX ke Drive) -->
          <div id="doc-file-uploader-container"></div>

          <div style="margin-top: 1.25rem; text-align: right;">
            <button type="submit" class="btn-primary">
              <i data-lucide="upload" width="16" height="16"></i> Simpan Dokumen
            </button>
          </div>
        </form>
      </div>

      <!-- List Dokumen Terunggah -->
      <div class="tab-list-column">
        <h4 style="font-weight: 700; font-size: 0.9375rem; margin-bottom: 0.75rem;">
          Dokumen Terdaftar (${docs.length})
        </h4>
        <div class="admin-items-scroll">
          ${docs.map(d => `
            <div class="admin-item-row">
              <div class="doc-preview-icon" style="width: 44px; height: 44px;">
                <i data-lucide="file-text" width="22" height="22"></i>
              </div>
              <div class="admin-item-info">
                <strong>${escapeHtml(d.title)}</strong>
                <span style="font-size: 0.6875rem; color: var(--text-muted);">${escapeHtml(d.category)} • ${escapeHtml(d.fileSize || 'PDF')}</span>
              </div>
              <div style="display: flex; gap: 0.25rem;">
                <a href="${d.fileUrl}" target="_blank" rel="noopener noreferrer" class="btn-icon" title="Buka Dokumen">
                  <i data-lucide="external-link" width="14" height="14"></i>
                </a>
                <button type="button" class="btn-icon btn-delete-doc-item" data-doc-id="${d.id}" title="Hapus" style="color: #EF4444;">
                  <i data-lucide="trash-2" width="14" height="14"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  documentFileUploader = createFileUploader({
    container: '#doc-file-uploader-container',
    accept: '.pdf,.doc,.docx,.xls,.xlsx',
    folderType: 'documents',
    currentUrl: currentUploadedDocFile.url,
    label: 'Pilih Berkas Dokumen dari PC (Folder Google Drive DOCUMENTS)',
    onSuccess: (res) => {
      currentUploadedDocFile = {
        url: res.directUrl,
        name: res.fileName,
        type: res.mimeType,
        size: 'Tersimpan'
      };
      const titleInput = document.getElementById('admin-doc-title');
      if (titleInput && !titleInput.value) {
        titleInput.value = res.fileName;
      }
    },
    onRemove: () => {
      currentUploadedDocFile = { url: '', name: '', type: '', size: '' };
    }
  });

  const form = document.getElementById('admin-doc-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('admin-doc-title').value.trim();
      const category = document.getElementById('admin-doc-cat').value;

      if (!currentUploadedDocFile.url) {
        alert('Harap pilih berkas dokumen dari PC terlebih dahulu!');
        return;
      }

      addDocument({
        title,
        category,
        fileUrl: currentUploadedDocFile.url,
        fileType: currentUploadedDocFile.type,
        fileSize: currentUploadedDocFile.size
      });

      currentUploadedDocFile = { url: '', name: '', type: '', size: '' };
      renderTabDocuments(container);
    });
  }

  container.querySelectorAll('.btn-delete-doc-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const docId = btn.getAttribute('data-doc-id');
      if (confirm('Hapus dokumen ini?')) {
        deleteDocument(docId);
        renderTabDocuments(container);
      }
    });
  });
}

/* ==========================================================================
   TAB 5: HAK AKSES ROLE & PENGATURAN KEAMANAN
   ========================================================================== */
function renderTabRoleSettings(container) {
  const currentRole = getCurrentRole();
  const currentCloudUrl = getCloudBackendUrl();
  const currentFb = getFirebaseConfig();
  const securityLogs = getSecurityAuditLogs();

  container.innerHTML = `
    <div style="max-width: 600px; margin: 0 auto;">
      <h3 class="admin-pane-title" style="margin-bottom: 1.25rem;">
        <i data-lucide="shield" width="20" height="20"></i>
        <span>Pengaturan Hak Akses & Keamanan Admin</span>
      </h3>

      <!-- Current Role Indicator -->
      <div style="background-color: var(--color-primary-50); border: 1px solid var(--color-primary-200); border-radius: var(--radius-card); padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
        <div>
          <span style="font-size: 0.75rem; color: var(--color-primary-700); font-weight: 600; text-transform: uppercase;">Peran Aktif Saat Ini</span>
          <h4 style="font-size: 1.125rem; font-weight: 800; color: var(--color-primary-800); text-transform: capitalize;">
            🛡️ ${currentRole}
          </h4>
        </div>
        <button type="button" id="admin-logout-btn" class="btn-secondary" style="color: #EF4444;">
          <i data-lucide="log-out" width="14" height="14"></i> Keluar Admin
        </button>
      </div>

      <!-- Pusat Pertahanan Siber & Log Audit Real-Time -->
      <div style="background-color: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-card); padding: 1.25rem; margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <h4 style="font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="shield-alert" width="18" height="18" style="color: #10B981;"></i>
            <span>Pusat Pertahanan Siber & Log Audit</span>
          </h4>
          <span style="font-size: 0.6875rem; background: rgba(16, 185, 129, 0.15); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: 600;">
            🛡️ SHA-256 & Rate Limiter Aktif
          </span>
        </div>
        <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.875rem;">
          Memonitor setiap aktivitas autentikasi, mitigasi brute force, dan integritas sistem secara real-time.
        </p>

        <!-- Daftar Log Keamanan Real-Time -->
        <div style="max-height: 160px; overflow-y: auto; background: var(--bg-main); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 0.5rem; font-family: monospace; font-size: 0.6875rem; margin-bottom: 0.75rem;">
          ${securityLogs.length === 0 ? '<div style="color: var(--text-muted); text-align: center; padding: 1rem;">Belum ada catatan aktivitas keamanan.</div>' : securityLogs.map(log => `
            <div style="display: flex; justify-content: space-between; padding: 0.25rem 0.35rem; border-bottom: 1px solid rgba(0,0,0,0.05); gap: 0.5rem;">
              <span style="color: var(--text-muted); white-space: nowrap;">${new Date(log.timestamp).toLocaleTimeString('id-ID')}</span>
              <span style="font-weight: 700; color: ${log.severity === 'DANGER' ? '#EF4444' : log.severity === 'WARN' ? '#F59E0B' : '#10B981'}; white-space: nowrap;">[${log.type}]</span>
              <span style="flex: 1; color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${escapeHtml(log.details)}</span>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; justify-content: flex-end;">
          <button type="button" id="btn-clear-sec-logs" class="btn-secondary" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;">
            <i data-lucide="trash-2" width="12" height="12"></i> Bersihkan Log
          </button>
        </div>
      </div>

      <!-- Cloud Database Firebase (Firestore Spark Plan Gratis) -->
      <div style="background-color: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-card); padding: 1.25rem; margin-bottom: 1.5rem;">
        <h4 style="font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
          <i data-lucide="database" width="18" height="18" style="color: #F59E0B;"></i>
          <span>Database Cloud Firebase (Spark Plan - 100% Gratis)</span>
        </h4>
        <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Gunakan <strong>Google Cloud Firestore</strong> gratisan (50.000 reads/hari, 1 GB storage). Data tersimpan aman di cloud Google.
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem;">
          <div>
            <label style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.25rem; display: block;">Firebase Project ID</label>
            <input type="text" id="firebase-project-id" class="form-input" placeholder="contoh: portal-yiqul-app" value="${escapeHtml(currentFb.projectId)}">
          </div>
          <div>
            <label style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.25rem; display: block;">Firebase Web API Key</label>
            <input type="text" id="firebase-api-key" class="form-input" placeholder="contoh: AIzaSyD..." value="${escapeHtml(currentFb.apiKey)}">
            <p style="font-size: 0.6875rem; color: #3B82F6; margin-top: 0.35rem;">
              <a href="https://console.firebase.google.com/project/${escapeHtml(currentFb.projectId || 'portal-yiqul-db')}/firestore" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">
                🔗 Buka Firestore Console Project Ini (Pastikan Database Dibuat) ↗
              </a>
            </p>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <label style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); min-width: 100px;">Tipe Database:</label>
            <select id="firebase-db-type" class="form-input" style="flex: 1;">
              <option value="firestore" ${currentFb.databaseType !== 'rtdb' ? 'selected' : ''}>Cloud Firestore (Rekomendasi NoSQL)</option>
              <option value="rtdb" ${currentFb.databaseType === 'rtdb' ? 'selected' : ''}>Realtime Database (JSON Tree)</option>
            </select>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
          <button type="button" id="save-firebase-cfg-btn" class="btn-primary" style="flex: 1;">
            <i data-lucide="save" width="14" height="14"></i> Simpan Konfigurasi
          </button>
          <button type="button" id="test-firebase-btn" class="btn-secondary" style="flex: 1;">
            <i data-lucide="activity" width="14" height="14"></i> Tes Koneksi
          </button>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <button type="button" id="btn-pull-firebase" class="btn-secondary" style="flex: 1; font-size: 0.75rem;">
            <i data-lucide="download-cloud" width="14" height="14"></i> Tarik dari Firebase (Pull)
          </button>
          <button type="button" id="btn-push-firebase" class="btn-secondary" style="flex: 1; font-size: 0.75rem;">
            <i data-lucide="upload-cloud" width="14" height="14"></i> Unggah ke Firebase (Push)
          </button>
        </div>
      </div>

      <!-- Cloud Backend API & Database Sync -->
      <div style="background-color: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-card); padding: 1.25rem; margin-bottom: 1.5rem;">
        <h4 style="font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
          <i data-lucide="cloud" width="18" height="18" style="color: #3B82F6;"></i>
          <span>Koneksi Cloud Backend (Google Apps Script / Sheets)</span>
        </h4>
        <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Masukkan URL Web App Google Apps Script agar website di Netlify dapat membaca & menyimpan data langsung ke Google Drive & Google Sheets secara online.
        </p>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
          <input type="url" id="cloud-backend-url-input" class="form-input" placeholder="https://script.google.com/macros/s/.../exec" value="${escapeHtml(currentCloudUrl)}" style="flex: 1;">
          <button type="button" id="save-cloud-url-btn" class="btn-primary" style="white-space: nowrap;">
            <i data-lucide="save" width="16" height="16"></i> Simpan
          </button>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button type="button" id="btn-pull-cloud" class="btn-secondary" style="flex: 1; font-size: 0.75rem;">
            <i data-lucide="cloud-download" width="14" height="14"></i> Tarik dari Cloud (Pull)
          </button>
          <button type="button" id="btn-push-cloud" class="btn-secondary" style="flex: 1; font-size: 0.75rem;">
            <i data-lucide="cloud-upload" width="14" height="14"></i> Unggah ke Cloud (Push)
          </button>
        </div>
      </div>

      <!-- Ubah PIN Admin -->
      <div style="background-color: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-card); padding: 1.25rem; margin-bottom: 1.5rem;">
        <h4 style="font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">Ubah PIN Masuk Admin</h4>
        <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 1rem;">
          PIN standar awal adalah <code>1234</code>. Anda dapat mengubahnya untuk keamanan sistem.
        </p>
        <form id="change-pin-form" style="display: flex; gap: 0.5rem;">
          <input type="password" id="new-pin-input" class="form-input" placeholder="Masukkan PIN baru (min. 4 digit)" style="flex: 1;" required>
          <button type="submit" class="btn-primary">
            <i data-lucide="key" width="16" height="16"></i> Simpan PIN
          </button>
        </form>
      </div>

      <!-- Backup, Restore, Reset Data -->
      <div style="background-color: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-card); padding: 1.25rem;">
        <h4 style="font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">Pencadangan & Pemulihan (Backup/Restore)</h4>
        <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Cadangkan seluruh database link, branding, dan banner ke dalam berkas JSON.
        </p>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button type="button" id="admin-export-btn" class="btn-secondary" style="flex: 1;">
            <i data-lucide="download" width="14" height="14"></i> Ekspor Cadangan JSON
          </button>
          <label class="btn-secondary" style="flex: 1; cursor: pointer; text-align: center;">
            <i data-lucide="upload" width="14" height="14"></i> Pulihkan dari JSON
            <input type="file" id="admin-import-file" accept=".json" style="display: none;">
          </label>
        </div>
        <div style="margin-top: 1rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem; text-align: right;">
          <button type="button" id="admin-reset-all-btn" class="btn-secondary" style="color: #EF4444;">
            <i data-lucide="rotate-ccw" width="14" height="14"></i> Reset ke Bawaan Yayasan
          </button>
        </div>
      </div>
    </div>
  `;

  // Bind Firebase Events
  const saveFbBtn = document.getElementById('save-firebase-cfg-btn');
  const testFbBtn = document.getElementById('test-firebase-btn');
  const pullFbBtn = document.getElementById('btn-pull-firebase');
  const pushFbBtn = document.getElementById('btn-push-firebase');

  if (saveFbBtn) {
    saveFbBtn.addEventListener('click', () => {
      const projectId = document.getElementById('firebase-project-id')?.value.trim();
      const apiKey = document.getElementById('firebase-api-key')?.value.trim();
      const databaseType = document.getElementById('firebase-db-type')?.value;
      saveFirebaseConfig({ projectId, apiKey, databaseType });
      alert('Konfigurasi Firebase berhasil disimpan!');
    });
  }

  if (testFbBtn) {
    testFbBtn.addEventListener('click', async () => {
      testFbBtn.disabled = true;
      testFbBtn.textContent = 'Menguji...';
      const projectId = document.getElementById('firebase-project-id')?.value.trim();
      const apiKey = document.getElementById('firebase-api-key')?.value.trim();
      const databaseType = document.getElementById('firebase-db-type')?.value;
      saveFirebaseConfig({ projectId, apiKey, databaseType });

      const testRes = await testFirebaseConnection();
      alert(testRes.message);
      testFbBtn.disabled = false;
      testFbBtn.innerHTML = `<i data-lucide="activity" width="14" height="14"></i> Tes Koneksi`;
    });
  }

  if (pullFbBtn) {
    pullFbBtn.addEventListener('click', async () => {
      try {
        pullFbBtn.disabled = true;
        pullFbBtn.textContent = 'Menarik dari Firebase...';
        await pullFromFirebase();
        alert('Berhasil! Data terbaru dari Firebase Firestore berhasil disinkronkan ke lokal.');
        renderTabRoleSettings(container);
      } catch (err) {
        alert(`Gagal menarik dari Firebase: ${err.message}`);
      } finally {
        pullFbBtn.disabled = false;
        pullFbBtn.innerHTML = `<i data-lucide="download-cloud" width="14" height="14"></i> Tarik dari Firebase (Pull)`;
      }
    });
  }

  if (pushFbBtn) {
    pushFbBtn.addEventListener('click', async () => {
      try {
        pushFbBtn.disabled = true;
        pushFbBtn.textContent = 'Mengunggah ke Firebase...';
        await pushToFirebase();
        alert('Berhasil! Seluruh data portal berhasil diunggah ke Firebase Cloud Firestore.');
      } catch (err) {
        alert(`Gagal mengunggah ke Firebase: ${err.message}`);
      } finally {
        pushFbBtn.disabled = false;
        pushFbBtn.innerHTML = `<i data-lucide="upload-cloud" width="14" height="14"></i> Unggah ke Firebase (Push)`;
      }
    });
  }

  // Bind Cloud Sync
  const saveCloudBtn = document.getElementById('save-cloud-url-btn');
  const cloudInput = document.getElementById('cloud-backend-url-input');
  const pullCloudBtn = document.getElementById('btn-pull-cloud');
  const pushCloudBtn = document.getElementById('btn-push-cloud');

  if (saveCloudBtn && cloudInput) {
    saveCloudBtn.addEventListener('click', () => {
      saveCloudBackendUrl(cloudInput.value);
      alert('URL Cloud Backend berhasil disimpan!');
    });
  }

  if (pullCloudBtn) {
    pullCloudBtn.addEventListener('click', async () => {
      try {
        pullCloudBtn.disabled = true;
        pullCloudBtn.textContent = 'Menarik data...';
        const res = await pullFromCloud();
        alert(`Berhasil! Data terbaru dari Google Cloud berhasil disinkronkan (${res.count} aplikasi).`);
        renderTabRoleSettings(container);
      } catch (err) {
        alert(`Gagal menarik data dari cloud: ${err.message}`);
      } finally {
        pullCloudBtn.disabled = false;
        pullCloudBtn.innerHTML = `<i data-lucide="cloud-download" width="14" height="14"></i> Tarik dari Cloud (Pull)`;
      }
    });
  }

  if (pushCloudBtn) {
    pushCloudBtn.addEventListener('click', async () => {
      try {
        pushCloudBtn.disabled = true;
        pushCloudBtn.textContent = 'Mengunggah data...';
        await pushToCloud();
        alert('Berhasil! Seluruh konfigurasi lokal berhasil diunggah ke Google Cloud backend.');
      } catch (err) {
        alert(`Gagal mengunggah data ke cloud: ${err.message}`);
      } finally {
        pushCloudBtn.disabled = false;
        pushCloudBtn.innerHTML = `<i data-lucide="cloud-upload" width="14" height="14"></i> Unggah ke Cloud (Push)`;
      }
    });
  }

  // Bind Logout
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logoutAdmin();
      closeAdminPanel();
      alert('Anda telah keluar dari mode administrator.');
    });
  }

  // Bind Change PIN
  const pinForm = document.getElementById('change-pin-form');
  if (pinForm) {
    pinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPin = document.getElementById('new-pin-input').value;
      try {
        saveAdminPin(newPin);
        alert('PIN Administrator berhasil diperbarui!');
        document.getElementById('new-pin-input').value = '';
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Bind Export
  const exportBtn = document.getElementById('admin-export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const json = exportRegistryJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yiqul-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Bind Import
  const importInput = document.getElementById('admin-import-file');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = importRegistryJson(event.target?.result);
        alert(res.message);
        renderTabRoleSettings(container);
      };
      reader.readAsText(file);
    });
  }

  // Bind Reset
  const resetBtn = document.getElementById('admin-reset-all-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('PERINGATAN: Seluruh link, branding, dan banner akan direset kembali ke setelan awal pabrik! Lanjutkan?')) {
        resetToDefault();
        alert('Data berhasil direset.');
        renderTabRoleSettings(container);
      }
    });
  }

  // Bind Bersihkan Log Audit Keamanan
  const clearSecBtn = document.getElementById('btn-clear-sec-logs');
  if (clearSecBtn) {
    clearSecBtn.addEventListener('click', () => {
      if (confirm('Bersihkan riwayat log audit pertahanan siber?')) {
        clearSecurityAuditLogs();
        renderTabRoleSettings(container);
      }
    });
  }
}

/**
 * Inisialisasi Admin Panel Controller
 */
export function initAdminPanel() {
  const openBtn = document.getElementById('open-admin-btn');
  const closePanelBtn = document.getElementById('close-admin-panel-btn');
  const panelBackdrop = document.getElementById('admin-panel-backdrop');
  const authBackdrop = document.getElementById('admin-auth-modal');
  const authForm = document.getElementById('admin-auth-form');
  const closeAuthBtn = document.getElementById('close-auth-modal-btn');

  // Buka Panel
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      openAdminPanel('apps');
    });
  }

  // Tutup Panel
  if (closePanelBtn) closePanelBtn.addEventListener('click', closeAdminPanel);
  if (panelBackdrop) {
    panelBackdrop.addEventListener('click', (e) => {
      if (e.target === panelBackdrop) closeAdminPanel();
    });
  }

  // Tutup Auth Modal
  if (closeAuthBtn) closeAuthBtn.addEventListener('click', closeAdminAuthModal);
  if (authBackdrop) {
    authBackdrop.addEventListener('click', (e) => {
      if (e.target === authBackdrop) closeAdminAuthModal();
    });
  }

  // Handle Tab Switching
  document.querySelectorAll('.admin-nav-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      activeTab = tabBtn.getAttribute('data-tab');
      renderActiveTabContent();
    });
  });

  // Handle PIN Auth Submit dengan Anti-Brute Force Protection
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pin = document.getElementById('admin-pin-input').value;
      const rateLimitBefore = checkRateLimit();

      if (rateLimitBefore.isLocked) {
        const errorEl = document.getElementById('admin-auth-error');
        if (errorEl) {
          errorEl.textContent = `🔒 Akses ditangguhkan! Terlalu banyak percobaan salah. Silakan tunggu ${rateLimitBefore.remainingSeconds} detik.`;
          errorEl.style.display = 'block';
        }
        return;
      }

      const isSuccess = verifyAdminPin(pin);

      if (isSuccess) {
        showAdminDashboardModal();
      } else {
        const rateLimitAfter = checkRateLimit();
        const errorEl = document.getElementById('admin-auth-error');
        if (errorEl) {
          if (rateLimitAfter.isLocked) {
            errorEl.textContent = `🚨 Serangan terdeteksi! Akses ditangguhkan selama ${rateLimitAfter.remainingSeconds} detik.`;
          } else {
            errorEl.textContent = `❌ PIN Admin salah! Sisa percobaan: ${rateLimitAfter.attemptsLeft} kali lagi.`;
          }
          errorEl.style.display = 'block';
        }
      }
    });
  }
}
