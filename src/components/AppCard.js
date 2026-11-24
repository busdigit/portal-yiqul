/**
 * COMPONENT: BENTO APP CARD
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Merender kartu aplikasi Bento individual dengan hierarki visual terstandar,
 * status dot, tombol favorit, ikon avatar, dan tautan aksi yang aman.
 */

import { escapeHtml, sanitizeUrl, getSafeLinkAttributes } from '../services/sanitizer.js';
import { convertGoogleDriveToDirectLink } from '../services/uploader.js';
import { isAdminLoggedIn } from '../services/storage.js';

/**
 * Render string HTML kartu aplikasi Bento
 * @param {Object} app - Data aplikasi Yiqul
 * @param {boolean} isFav - Apakah aplikasi ditandai favorit
 * @returns {string} HTML markup
 */
export function renderAppCard(app, isFav = false) {
  const safeUrl = sanitizeUrl(app.targetUrl);
  const safeTitle = escapeHtml(app.title);
  const safeDesc = escapeHtml(app.shortDescription || 'Aplikasi resmi ekosistem Yayasan Islam Qudwatul Ummah.');
  const icon = escapeHtml(app.iconName || 'Globe');
  const isAdmin = isAdminLoggedIn();
  const isLocked = Boolean(app.isLocked);

  // Avatar icon: Gunakan gambar logo kustom (Google Drive / upload) jika ada
  let avatarMarkup = '';
  if (app.customIconUrl) {
    const directLogoUrl = convertGoogleDriveToDirectLink(app.customIconUrl);
    avatarMarkup = `
      <div class="card-avatar custom-logo-avatar" aria-hidden="true" style="overflow: hidden; padding: 2px;">
        <img src="${directLogoUrl}" alt="${safeTitle}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" />
      </div>
    `;
  } else {
    avatarMarkup = `
      <div class="card-avatar" aria-hidden="true">
        <i data-lucide="${icon}" width="24" height="24"></i>
      </div>
    `;
  }

  // Status badge logic
  let statusBadgeHtml = '';
  if (app.status === 'active') {
    statusBadgeHtml = `<span class="status-dot active" title="Aplikasi Beroperasi Normal">🟢 Online</span>`;
  } else if (app.status === 'maintenance') {
    statusBadgeHtml = `<span class="status-dot maintenance" title="Aplikasi Sedang Dalam Pemeliharaan">🟡 Maintenance</span>`;
  } else if (app.status === 'new') {
    statusBadgeHtml = `<span class="status-dot new" title="Aplikasi Baru Dirilis">🔵 Baru</span>`;
  } else {
    statusBadgeHtml = `<span class="status-dot" title="Aplikasi Segera Hadir">⚪ Segera</span>`;
  }

  // Lock status badge
  let lockBadgeHtml = '';
  if (isLocked) {
    lockBadgeHtml = `<span class="status-dot locked" title="Aplikasi Terkunci: Butuh PIN Akses"><i data-lucide="lock" width="12" height="12"></i> Terkunci</span>`;
  }

  // Favorite button
  const favActiveClass = isFav ? 'favorited' : '';
  const favIconFill = isFav ? 'fill: var(--color-accent-amber); color: var(--color-accent-amber);' : '';

  // Mode Buka
  let launchActionHtml = '';
  let modeBadgeText = 'Tab Baru';

  if (isLocked && !isAdmin) {
    // Aplikasi Terkunci & Pengguna Bukan Admin: Wajib Masukkan PIN
    modeBadgeText = 'Perlu PIN';
    launchActionHtml = `
      <button 
        type="button" 
        class="btn-launch btn-launch-locked" 
        data-action="prompt-app-lock" 
        data-app-id="${app.id}"
        aria-label="Buka aplikasi terkunci ${safeTitle}"
        title="Aplikasi Terkunci: Masukkan PIN Akses"
      >
        <span>Buka Terkunci</span>
        <i data-lucide="lock" width="14" height="14"></i>
      </button>
    `;
  } else if (app.targetMode === 'iframe') {
    modeBadgeText = 'Modal Window';
    launchActionHtml = `
      <button 
        type="button" 
        class="btn-launch ${isLocked ? 'btn-launch-admin-unlocked' : ''}" 
        data-action="open-modal" 
        data-app-id="${app.id}"
        aria-label="Buka aplikasi ${safeTitle} di modal"
        ${isLocked ? 'title="Akses Terbuka Khusus Admin"' : ''}
      >
        <span>Buka Aplikasi</span>
        <i data-lucide="${isLocked ? 'unlock' : 'maximize-2'}" width="14" height="14"></i>
      </button>
    `;
  } else if (app.targetMode === '_self') {
    modeBadgeText = 'Jendela Ini';
    launchActionHtml = `
      <a 
        href="${safeUrl}" 
        target="_self" 
        class="btn-launch ${isLocked ? 'btn-launch-admin-unlocked' : ''}"
        aria-label="Buka aplikasi ${safeTitle}"
        ${isLocked ? 'title="Akses Terbuka Khusus Admin"' : ''}
      >
        <span>Buka Aplikasi</span>
        <i data-lucide="${isLocked ? 'unlock' : 'arrow-right'}" width="14" height="14"></i>
      </a>
    `;
  } else {
    // Default: _blank dengan perlindungan keamanan tabnabbing
    modeBadgeText = 'Tab Baru';
    launchActionHtml = `
      <a 
        href="${safeUrl}" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="btn-launch ${isLocked ? 'btn-launch-admin-unlocked' : ''}"
        aria-label="Buka aplikasi ${safeTitle} di tab baru"
        ${isLocked ? 'title="Akses Terbuka Khusus Admin"' : ''}
      >
        <span>Buka Aplikasi</span>
        <i data-lucide="${isLocked ? 'unlock' : 'external-link'}" width="14" height="14"></i>
      </a>
    `;
  }

  return `
    <article class="app-card fade-in ${isLocked ? 'is-locked-card' : ''}" id="card-${app.id}" data-category="${escapeHtml(app.category)}">
      <div>
        <!-- Card Top: Avatar, Status, Lock, Favorite -->
        <div class="card-top">
          ${avatarMarkup}
          <div class="card-badges">
            ${lockBadgeHtml}
            ${statusBadgeHtml}
            <button 
              type="button" 
              class="btn-favorite ${favActiveClass}" 
              data-action="toggle-fav" 
              data-app-id="${app.id}" 
              aria-label="${isFav ? 'Hapus dari favorit' : 'Tandai sebagai favorit'} ${safeTitle}"
              title="${isFav ? 'Hapus dari favorit' : 'Tambah ke favorit'}"
            >
              <i data-lucide="star" style="${favIconFill}" width="18" height="18"></i>
            </button>
            <button 
              type="button" 
              class="btn-favorite" 
              data-action="edit-app" 
              data-app-id="${app.id}" 
              aria-label="Edit konfigurasi link ${safeTitle}"
              title="Edit Link Aplikasi"
            >
              <i data-lucide="pencil" width="14" height="14"></i>
            </button>
          </div>
        </div>

        <!-- Card Body: Title, Category, Description -->
        <div class="card-body">
          <span class="card-category-tag">${escapeHtml(app.category)}</span>
          <h4 class="card-title">${safeTitle}</h4>
          <p class="card-desc">${safeDesc}</p>
        </div>
      </div>

      <!-- Card Footer: Launch Button & Mode Hint -->
      <div class="card-footer">
        ${launchActionHtml}
        <span class="card-mode-badge" title="Mode pembukaan: ${modeBadgeText}">
          <i data-lucide="${isLocked && !isAdmin ? 'shield-alert' : 'layers'}" width="12" height="12"></i> ${modeBadgeText}
        </span>
      </div>
    </article>
  `;
}
