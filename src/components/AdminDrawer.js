/**
 * COMPONENT: ADMIN DYNAMIC LINK ENGINE DRAWER
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Antarmuka administrasi visual untuk Super Admin dalam menambah, mengedit,
 * menghapus tautan aplikasi, serta mengekspor/mengimpor snapshot konfigurasi JSON.
 */

import {
  addApp,
  updateApp,
  deleteApp,
  getAppById,
  exportRegistryJson,
  importRegistryJson,
  resetToDefault
} from '../services/storage.js';
import { sanitizeUrl, isValidUrl } from '../services/sanitizer.js';

let isDrawerOpen = false;

/**
 * Buka drawer dalam mode Tambah Aplikasi Baru
 */
export function openAddAppDrawer() {
  const form = document.getElementById('app-form');
  const titleEl = document.getElementById('drawer-form-title');
  const submitBtn = document.getElementById('submit-app-btn');
  const idInput = document.getElementById('form-app-id');

  if (form) form.reset();
  if (idInput) idInput.value = '';
  if (titleEl) titleEl.textContent = 'Pasang Link Aplikasi';
  if (submitBtn) {
    submitBtn.innerHTML = `<i data-lucide="check" width="16" height="16"></i> Simpan Link`;
  }

  // Hapus tombol hapus lama jika ada
  removeDeleteButton();

  openDrawer();
}

/**
 * Buka drawer dalam mode Edit Aplikasi
 * @param {Object} app
 */
export function openEditAppDrawer(app) {
  if (!app) return;

  const idInput = document.getElementById('form-app-id');
  const titleInput = document.getElementById('form-app-title');
  const urlInput = document.getElementById('form-app-url');
  const categorySelect = document.getElementById('form-app-category');
  const iconSelect = document.getElementById('form-app-icon');
  const descInput = document.getElementById('form-app-desc');
  const targetSelect = document.getElementById('form-app-target');
  const statusSelect = document.getElementById('form-app-status');
  const drawerTitle = document.getElementById('drawer-form-title');
  const submitBtn = document.getElementById('submit-app-btn');

  if (idInput) idInput.value = app.id;
  if (titleInput) titleInput.value = app.title || '';
  if (urlInput) urlInput.value = app.targetUrl || '';
  if (categorySelect) categorySelect.value = app.category || 'umum';
  if (iconSelect) iconSelect.value = app.iconName || 'Globe';
  if (descInput) descInput.value = app.shortDescription || '';
  if (targetSelect) targetSelect.value = app.targetMode || '_blank';
  if (statusSelect) statusSelect.value = app.status || 'active';

  if (drawerTitle) drawerTitle.textContent = `Edit Link: ${app.title}`;
  if (submitBtn) {
    submitBtn.innerHTML = `<i data-lucide="save" width="16" height="16"></i> Perbarui Link`;
  }

  // Tambahkan tombol Hapus jika belum ada
  appendDeleteButton(app);

  openDrawer();
}

function openDrawer() {
  const backdrop = document.getElementById('admin-drawer-backdrop');
  if (backdrop) {
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    isDrawerOpen = true;
  }
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

export function closeDrawer() {
  const backdrop = document.getElementById('admin-drawer-backdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    isDrawerOpen = false;
  }
}

function appendDeleteButton(app) {
  removeDeleteButton();
  const footer = document.querySelector('.drawer-footer');
  if (!footer) return;

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.id = 'delete-app-btn';
  deleteBtn.className = 'btn-secondary';
  deleteBtn.style.color = '#EF4444';
  deleteBtn.style.marginRight = 'auto';
  deleteBtn.innerHTML = `<i data-lucide="trash-2" width="16" height="16"></i> Hapus Link`;

  deleteBtn.addEventListener('click', () => {
    if (confirm(`Apakah Anda yakin ingin menghapus aplikasi "${app.title}" dari registry portal?`)) {
      deleteApp(app.id);
      closeDrawer();
    }
  });

  footer.insertBefore(deleteBtn, footer.firstChild);
}

function removeDeleteButton() {
  const existing = document.getElementById('delete-app-btn');
  if (existing) existing.remove();
}

/**
 * Inisialisasi form handling dan kontrol admin drawer
 */
export function initAdminDrawer() {
  const openBtn = document.getElementById('open-admin-btn');
  const closeBtn = document.getElementById('close-admin-drawer-btn');
  const cancelBtn = document.getElementById('cancel-drawer-btn');
  const backdrop = document.getElementById('admin-drawer-backdrop');
  const form = document.getElementById('app-form');
  const exportBtn = document.getElementById('export-json-btn');
  const importInput = document.getElementById('import-json-input');
  const resetBtn = document.getElementById('reset-default-btn');

  // Buka drawer
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      openAddAppDrawer();
    });
  }

  // Tutup drawer
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (cancelBtn) cancelBtn.addEventListener('click', closeDrawer);

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeDrawer();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDrawerOpen) {
      closeDrawer();
    }
  });

  // Handle Form Submit (Tambah / Edit)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const appId = document.getElementById('form-app-id').value;
      const title = document.getElementById('form-app-title').value.trim();
      const targetUrl = document.getElementById('form-app-url').value.trim();
      const category = document.getElementById('form-app-category').value;
      const iconName = document.getElementById('form-app-icon').value;
      const shortDescription = document.getElementById('form-app-desc').value.trim();
      const targetMode = document.getElementById('form-app-target').value;
      const status = document.getElementById('form-app-status').value;

      if (!isValidUrl(targetUrl)) {
        alert('URL tujuan tidak valid! Harap masukkan URL lengkap dengan awalan https:// atau http://');
        return;
      }

      try {
        if (appId) {
          // Edit existing app
          updateApp(appId, {
            title,
            targetUrl,
            category,
            iconName,
            shortDescription,
            targetMode,
            status
          });
        } else {
          // Add new app
          addApp({
            title,
            targetUrl,
            category,
            iconName,
            shortDescription,
            targetMode,
            status
          });
        }

        closeDrawer();
      } catch (err) {
        alert(`Gagal menyimpan data aplikasi: ${err.message}`);
      }
    });
  }

  // Handle Ekspor JSON
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const jsonContent = exportRegistryJson();
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `yiqul-portal-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Handle Impor JSON
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          const result = importRegistryJson(content);
          if (result.success) {
            alert(result.message);
            closeDrawer();
          } else {
            alert(`Gagal mengimpor file: ${result.message}`);
          }
        }
      };
      reader.readAsText(file);
      // Reset input agar bisa memilih file yang sama lagi
      importInput.value = '';
    });
  }

  // Handle Reset ke Default
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin mereset seluruh katalog aplikasi kembali ke pengaturan awal bawaan yayasan?')) {
        resetToDefault();
        closeDrawer();
        alert('Katalog aplikasi berhasil direset ke pengaturan awal.');
      }
    });
  }
}
