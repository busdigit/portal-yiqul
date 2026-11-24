/**
 * COMPONENT: VISUAL FILE UPLOADER WIDGET (CHOOSE FILE DARI PC)
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Komponen input file modern dengan Drag & Drop, pemilihan berkas langsung
 * dari folder PC/perangkat pengguna, preview gambar instan, upload ke Google Drive,
 * dan konversi direct link lh3.googleusercontent.com.
 */

import { uploadFileToDrive, convertGoogleDriveToDirectLink } from '../services/uploader.js';
import { escapeHtml } from '../services/sanitizer.js';

/**
 * Inisialisasi widget File Uploader pada container tertentu
 * 
 * @param {Object} options
 * @param {HTMLElement|string} options.container - Elemen DOM atau selector container
 * @param {string} [options.accept] - Format file yang diizinkan (default: "image/*")
 * @param {'logos'|'banners'|'app_icons'|'documents'} [options.folderType] - Target folder Drive
 * @param {string} [options.currentUrl] - URL gambar/dokumen yang sedang aktif (jika mode edit)
 * @param {string} [options.label] - Label judul uploader
 * @param {Function} options.onSuccess - Callback saat upload berhasil: fn({ directUrl, fileId, fileName })
 * @param {Function} [options.onRemove] - Callback saat file dihapus: fn()
 * @returns {Object} Uploader instance controller
 */
export function createFileUploader({
  container,
  accept = 'image/*',
  folderType = 'logos',
  currentUrl = '',
  label = 'Pilih Berkas dari PC/Device',
  onSuccess = () => {},
  onRemove = () => {}
}) {
  const targetEl = typeof container === 'string' ? document.querySelector(container) : container;
  if (!targetEl) return null;

  let activeUrl = currentUrl ? convertGoogleDriveToDirectLink(currentUrl) : '';
  const isDoc = folderType === 'documents' || accept.includes('pdf');
  const uniqueId = 'uploader-' + Math.random().toString(36).substring(2, 9);

  function render() {
    targetEl.innerHTML = `
      <div class="file-uploader-box" id="${uniqueId}">
        <label class="form-label">${escapeHtml(label)}</label>
        
        <!-- Input File Tersembunyi (Choose File) -->
        <input 
          type="file" 
          id="${uniqueId}-input" 
          accept="${accept}" 
          style="display: none;" 
        />

        <!-- Kondisi 1: Sudah Ada File / Preview -->
        <div id="${uniqueId}-preview-area" class="uploader-preview-area" style="${activeUrl ? 'display: flex;' : 'display: none;'}">
          ${isDoc ? `
            <div class="doc-preview-icon" aria-hidden="true">
              <i data-lucide="file-text" width="32" height="32" style="color: var(--color-primary-600);"></i>
            </div>
          ` : `
            <div class="image-preview-thumb">
              <img id="${uniqueId}-img-preview" src="${activeUrl || ''}" alt="Preview" />
            </div>
          `}

          <div class="uploader-meta-info">
            <span class="uploader-filename" id="${uniqueId}-filename-label">
              ${activeUrl ? 'Tersimpan di Google Drive' : 'Belum ada berkas'}
            </span>
            <span class="uploader-status-badge">
              <i data-lucide="check-circle-2" width="12" height="12"></i> Direct Link Siap
            </span>
            <div class="uploader-direct-link-hint" title="${activeUrl}">
              ${activeUrl ? activeUrl.slice(0, 45) + '...' : ''}
            </div>
          </div>

          <div class="uploader-actions">
            <button type="button" class="btn-secondary btn-rechoose" id="${uniqueId}-btn-rechoose" title="Ganti File">
              <i data-lucide="upload" width="14" height="14"></i> Ganti
            </button>
            <button type="button" class="btn-secondary btn-remove-file" id="${uniqueId}-btn-remove" title="Hapus File" style="color: #EF4444;">
              <i data-lucide="trash-2" width="14" height="14"></i>
            </button>
          </div>
        </div>

        <!-- Kondisi 2: Dropzone Kosong (Pilih Berkas) -->
        <div id="${uniqueId}-dropzone" class="uploader-dropzone" style="${activeUrl ? 'display: none;' : 'display: flex;'}">
          <div class="dropzone-icon" aria-hidden="true">
            <i data-lucide="folder-up" width="36" height="36"></i>
          </div>
          <div class="dropzone-text">
            <strong>Klik untuk Pilih Berkas</strong> atau tarik file dari folder PC ke sini
          </div>
          <div class="dropzone-hint">
            ${isDoc ? 'Mendukung format PDF, DOCX hingga 15MB' : 'Mendukung PNG, JPG, SVG, WebP hingga 15MB (Google Drive)'}
          </div>
        </div>

        <!-- Kondisi 3: Uploading Progress Indicator -->
        <div id="${uniqueId}-progress" class="uploader-progress-bar" style="display: none;">
          <div class="progress-spinner">
            <i data-lucide="loader-2" class="animate-spin" width="20" height="20"></i>
          </div>
          <span style="font-size: 0.8125rem; font-weight: 600; color: var(--color-primary-600);">
            Mengunggah ke Google Drive (${folderType.toUpperCase()})...
          </span>
        </div>
      </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    bindEvents();
  }

  function bindEvents() {
    const fileInput = document.getElementById(`${uniqueId}-input`);
    const dropzone = document.getElementById(`${uniqueId}-dropzone`);
    const rechooseBtn = document.getElementById(`${uniqueId}-btn-rechoose`);
    const removeBtn = document.getElementById(`${uniqueId}-btn-remove`);

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      // Drag and drop
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
        }
      });
    }

    if (rechooseBtn && fileInput) {
      rechooseBtn.addEventListener('click', () => fileInput.click());
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        activeUrl = '';
        render();
        onRemove();
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
          handleFile(file);
        }
      });
    }
  }

  async function handleFile(file) {
    const dropzone = document.getElementById(`${uniqueId}-dropzone`);
    const previewArea = document.getElementById(`${uniqueId}-preview-area`);
    const progressEl = document.getElementById(`${uniqueId}-progress`);

    if (dropzone) dropzone.style.display = 'none';
    if (previewArea) previewArea.style.display = 'none';
    if (progressEl) progressEl.style.display = 'flex';

    try {
      const uploadResult = await uploadFileToDrive(file, { folderType });
      activeUrl = uploadResult.directUrl;

      if (progressEl) progressEl.style.display = 'none';
      render();

      const filenameLabel = document.getElementById(`${uniqueId}-filename-label`);
      if (filenameLabel) filenameLabel.textContent = file.name;

      onSuccess(uploadResult);
    } catch (err) {
      alert(`Gagal mengunggah berkas: ${err.message}`);
      if (progressEl) progressEl.style.display = 'none';
      render();
    }
  }

  render();

  return {
    getValue: () => activeUrl,
    setValue: (newUrl) => {
      activeUrl = newUrl ? convertGoogleDriveToDirectLink(newUrl) : '';
      render();
    },
    reset: () => {
      activeUrl = '';
      render();
    }
  };
}
