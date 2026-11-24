/**
 * STORAGE SERVICE & REGISTRY ENGINE
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengelola penyimpanan persisten katalog aplikasi di localStorage
 * dengan fallback otomatis ke memory storage dan Default Seed Data.
 */

import { 
  DEFAULT_APPS, 
  DEFAULT_ANNOUNCEMENT, 
  DEFAULT_BRANDING, 
  DEFAULT_BANNERS, 
  DEFAULT_DOCUMENTS,
  DEFAULT_SCHEDULES
} from '../data/defaultApps.js';
import { sanitizeUrl, isValidUrl } from './sanitizer.js';
import {
  hashPin,
  getStoredPinHash,
  storeNewPin,
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  logSecurityEvent,
  getSecurityAuditLogs,
  clearSecurityAuditLogs,
  sanitizeObject,
  bindPinModalHelpers,
  resetPinInputState
} from './security.js';

const STORAGE_KEY_APPS = 'yiqul_apps_registry';
const STORAGE_KEY_FAVORITES = 'yiqul_apps_favorites';
const STORAGE_KEY_ANNOUNCEMENT = 'yiqul_announcement';
const STORAGE_KEY_THEME = 'yiqul_theme_mode';
const STORAGE_KEY_BRANDING = 'yiqul_portal_branding';
const STORAGE_KEY_BANNERS = 'yiqul_portal_banners';
const STORAGE_KEY_DOCUMENTS = 'yiqul_portal_documents';
const STORAGE_KEY_SCHEDULES = 'yiqul_portal_schedules';
const STORAGE_KEY_ROLE = 'yiqul_user_role';
const STORAGE_KEY_ADMIN_PIN = 'yiqul_admin_pin';

const DEFAULT_ADMIN_PIN = '1234';

// Memory storage fallback untuk lingkungan Node.js / test
const memoryStore = new Map();

function getStorageItem(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memoryStore.get(key) || null;
  } catch (e) {
    return memoryStore.get(key) || null;
  }
}

function setStorageItem(key, value) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
    memoryStore.set(key, value);
  } catch (e) {
    memoryStore.set(key, value);
  }
}

function dispatchRegistryEvent(eventName, detail = {}) {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    } catch (e) {
      // Abaikan jika tidak didukung
    }
  }
}

/**
 * Mengambil semua aplikasi terdaftar.
 * Jika belum ada di storage, otomatis inisialisasi dari DEFAULT_APPS.
 * @returns {Array} Daftar aplikasi Yiqul
 */
export function getAllApps() {
  const raw = getStorageItem(STORAGE_KEY_APPS);
  if (!raw) {
    // Cold start initialization
    saveAllApps(DEFAULT_APPS, false);
    return [...DEFAULT_APPS];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [...DEFAULT_APPS];
  } catch (e) {
    console.error('[Storage] Gagal mem-parse registry apps, memulihkan ke default:', e);
    return [...DEFAULT_APPS];
  }
}

/**
 * Menyimpan seluruh daftar aplikasi ke penyimpanan
 * @param {Array} apps
 * @param {boolean} emitEvent
 */
export function saveAllApps(apps, emitEvent = true) {
  setStorageItem(STORAGE_KEY_APPS, JSON.stringify(apps));
  if (emitEvent) {
    dispatchRegistryEvent('yiqul:registry-changed', { count: apps.length });
  }
}

/**
 * Mengambil satu aplikasi berdasarkan ID
 * @param {string} id
 * @returns {Object|null}
 */
export function getAppById(id) {
  const apps = getAllApps();
  return apps.find(app => app.id === id) || null;
}

/**
 * Menambahkan aplikasi baru ke registry
 * @param {Object} appData
 * @returns {Object} Aplikasi yang berhasil disimpan
 */
export function addApp(appData) {
  if (!appData.title || !appData.targetUrl || !appData.category) {
    throw new Error('Field judul (title), URL tujuan (targetUrl), dan kategori (category) wajib diisi.');
  }

  const safeUrl = sanitizeUrl(appData.targetUrl);
  if (safeUrl === '#') {
    throw new Error('URL tujuan tidak valid atau menggunakan protokol yang dilarang.');
  }

  const apps = getAllApps();
  const id = appData.id ? appData.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-') : `app-${Date.now()}`;

  // Pastikan ID unik
  if (apps.some(a => a.id === id)) {
    throw new Error(`Aplikasi dengan ID "${id}" sudah terdaftar.`);
  }

  const newApp = {
    id,
    title: String(appData.title).trim(),
    shortDescription: String(appData.shortDescription || '').trim().slice(0, 150),
    targetUrl: safeUrl,
    category: String(appData.category).trim().toLowerCase(),
    iconName: String(appData.iconName || 'Globe').trim(),
    customIconUrl: appData.customIconUrl ? String(appData.customIconUrl).trim() : '',
    targetMode: ['_blank', '_self', 'iframe'].includes(appData.targetMode) ? appData.targetMode : '_blank',
    status: ['active', 'maintenance', 'new', 'coming_soon'].includes(appData.status) ? appData.status : 'active',
    rolesAllowed: Array.isArray(appData.rolesAllowed) ? appData.rolesAllowed : ['public'],
    displayOrder: Number(appData.displayOrder) || (apps.length + 1),
    isFeatured: Boolean(appData.isFeatured),
    isLocked: Boolean(appData.isLocked),
    updatedAt: new Date().toISOString()
  };

  apps.push(newApp);
  saveAllApps(apps);
  return newApp;
}

/**
 * Memperbarui data aplikasi yang ada
 * @param {string} id
 * @param {Object} updatedFields
 * @returns {Object} Aplikasi setelah diperbarui
 */
export function updateApp(id, updatedFields) {
  const apps = getAllApps();
  const index = apps.findIndex(a => a.id === id);
  if (index === -1) {
    throw new Error(`Aplikasi dengan ID "${id}" tidak ditemukan.`);
  }

  if (updatedFields.targetUrl) {
    const safeUrl = sanitizeUrl(updatedFields.targetUrl);
    if (safeUrl === '#') {
      throw new Error('URL tujuan baru tidak valid.');
    }
    updatedFields.targetUrl = safeUrl;
  }

  apps[index] = {
    ...apps[index],
    ...updatedFields,
    updatedAt: new Date().toISOString()
  };

  saveAllApps(apps);
  return apps[index];
}

/**
 * Menghapus aplikasi dari registry
 * @param {string} id
 * @returns {boolean}
 */
export function deleteApp(id) {
  let apps = getAllApps();
  const initialLength = apps.length;
  apps = apps.filter(a => a.id !== id);

  if (apps.length === initialLength) {
    return false;
  }

  saveAllApps(apps);

  // Hapus juga dari daftar favorit jika ada
  const favorites = getFavorites();
  if (favorites.includes(id)) {
    const updatedFavs = favorites.filter(favId => favId !== id);
    setStorageItem(STORAGE_KEY_FAVORITES, JSON.stringify(updatedFavs));
  }

  return true;
}

/**
 * Memindahkan urutan aplikasi ke atas atau ke bawah
 * @param {string} id - ID aplikasi
 * @param {'up'|'down'} direction - Arah perpindahan
 * @returns {Array} Daftar aplikasi terbaru setelah dipindah
 */
export function reorderApp(id, direction) {
  const apps = getAllApps();
  const index = apps.findIndex(a => a.id === id);
  if (index === -1) return apps;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= apps.length) {
    return apps; // Sudah di paling atas atau paling bawah
  }

  // Tukar posisi elemen dalam array
  const temp = apps[index];
  apps[index] = apps[targetIndex];
  apps[targetIndex] = temp;

  // Sinkronkan nilai displayOrder
  apps.forEach((app, idx) => {
    app.displayOrder = idx + 1;
  });

  saveAllApps(apps);
  return apps;
}

/**
 * Toggle status kunci (lock / unlock) sebuah aplikasi
 * @param {string} id - ID aplikasi
 * @returns {Object|null} Aplikasi yang diperbarui
 */
export function toggleAppLock(id) {
  const apps = getAllApps();
  const index = apps.findIndex(a => a.id === id);
  if (index === -1) return null;
  apps[index].isLocked = !apps[index].isLocked;
  apps[index].updatedAt = new Date().toISOString();
  saveAllApps(apps);
  return apps[index];
}

/**
 * Verifikasi PIN untuk membuka akses aplikasi terkunci (dengan Proteksi Anti-Brute Force & SHA-256)
 * @param {string} inputPin
 * @returns {boolean}
 */
export function verifyAppAccessPin(inputPin) {
  const rateLimit = checkRateLimit();
  if (rateLimit.isLocked) {
    return false;
  }
  const currentPinHash = getStoredPinHash();
  const inputHash = hashPin(inputPin);

  if (inputHash === currentPinHash) {
    recordSuccessfulAttempt('APP_ACCESS');
    return true;
  }
  recordFailedAttempt('APP_ACCESS');
  return false;
}

/**
 * Mengambil daftar ID aplikasi favorit
 * @returns {Array<string>}
 */
export function getFavorites() {
  const raw = getStorageItem(STORAGE_KEY_FAVORITES);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Memeriksa apakah aplikasi ditandai favorit
 * @param {string} id
 * @returns {boolean}
 */
export function isFavorite(id) {
  const favorites = getFavorites();
  return favorites.includes(id);
}

/**
 * Toggle status favorit sebuah aplikasi
 * @param {string} id
 * @returns {boolean} status favorit baru
 */
export function toggleFavorite(id) {
  const favorites = getFavorites();
  const exists = favorites.includes(id);
  let updated;
  if (exists) {
    updated = favorites.filter(favId => favId !== id);
  } else {
    updated = [...favorites, id];
  }
  setStorageItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
  dispatchRegistryEvent('yiqul:favorites-changed', { id, isFavorite: !exists });
  return !exists;
}

/**
 * Ekspor seluruh konfigurasi portal ke format JSON
 * @returns {string} String JSON
 */
export function exportRegistryJson() {
  const payload = {
    appName: "Portal Yiqul Launcher",
    version: "1.1.0",
    exportedAt: new Date().toISOString(),
    apps: getAllApps(),
    favorites: getFavorites(),
    announcement: getAnnouncement(),
    branding: getBranding(),
    banners: getBanners(),
    documents: getDocuments(),
    schedules: getSchedules()
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Impor konfigurasi portal dari string JSON
 * @param {string} jsonString
 * @returns {{success: boolean, count: number, message: string}}
 */
export function importRegistryJson(jsonString) {
  try {
    const rawParsed = JSON.parse(jsonString);
    const data = sanitizeObject(rawParsed);
    if (!data || !Array.isArray(data.apps)) {
      throw new Error('Format JSON tidak valid: Properti "apps" harus berupa array.');
    }

    // Validasi setiap item aplikasi
    const validApps = data.apps.filter(app => {
      return app && app.id && app.title && app.targetUrl && isValidUrl(app.targetUrl);
    });

    if (validApps.length === 0) {
      throw new Error('Tidak ada data aplikasi valid yang ditemukan dalam file JSON.');
    }

    saveAllApps(validApps);

    if (Array.isArray(data.favorites)) {
      setStorageItem(STORAGE_KEY_FAVORITES, JSON.stringify(data.favorites));
    }

    if (data.announcement && typeof data.announcement === 'object') {
      saveAnnouncement(data.announcement);
    }

    if (data.branding && typeof data.branding === 'object') {
      saveBranding(data.branding);
    }

    if (Array.isArray(data.banners)) {
      saveBanners(data.banners);
    }

    if (Array.isArray(data.documents)) {
      saveDocuments(data.documents);
    }

    if (Array.isArray(data.schedules)) {
      saveSchedules(data.schedules);
    }

    return {
      success: true,
      count: validApps.length,
      message: `Berhasil mengimpor ${validApps.length} aplikasi, branding, banner, dan jadwal ke Portal Yiqul.`
    };
  } catch (e) {
    return {
      success: false,
      count: 0,
      message: e.message || 'Gagal mengimpor file JSON.'
    };
  }
}

/**
 * Reset seluruh konfigurasi kembali ke bawaan pabrik
 */
export function resetToDefault() {
  saveAllApps(DEFAULT_APPS);
  setStorageItem(STORAGE_KEY_FAVORITES, JSON.stringify([]));
  saveAnnouncement(DEFAULT_ANNOUNCEMENT);
  saveBranding(DEFAULT_BRANDING);
  saveBanners(DEFAULT_BANNERS);
  saveDocuments(DEFAULT_DOCUMENTS);
  saveSchedules(DEFAULT_SCHEDULES);
  dispatchRegistryEvent('yiqul:registry-changed', { count: DEFAULT_APPS.length });
  dispatchRegistryEvent('yiqul:branding-changed', DEFAULT_BRANDING);
  dispatchRegistryEvent('yiqul:banners-changed', DEFAULT_BANNERS);
  dispatchRegistryEvent('yiqul:schedules-changed', DEFAULT_SCHEDULES);
}

/**
 * Mengambil data pengumuman aktif
 * @returns {Object}
 */
export function getAnnouncement() {
  const raw = getStorageItem(STORAGE_KEY_ANNOUNCEMENT);
  if (!raw) return DEFAULT_ANNOUNCEMENT;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_ANNOUNCEMENT;
  }
}

/**
 * Menyimpan data pengumuman aktif
 * @param {Object} announcement
 */
export function saveAnnouncement(announcement) {
  setStorageItem(STORAGE_KEY_ANNOUNCEMENT, JSON.stringify(announcement));
  dispatchRegistryEvent('yiqul:announcement-changed', announcement);
}

/**
 * Mengambil preferensi tema ('dark' | 'light')
 * @returns {string}
 */
export function getSavedTheme() {
  return getStorageItem(STORAGE_KEY_THEME) || 'light';
}

/**
 * Menyimpan preferensi tema
 * @param {string} theme
 */
export function saveTheme(theme) {
  setStorageItem(STORAGE_KEY_THEME, theme);
}


/* ==========================================================================
   BRANDING MANAGEMENT (Logo Yayasan, Judul Portal, Tagline)
   ========================================================================== */

export function getBranding() {
  const raw = getStorageItem(STORAGE_KEY_BRANDING);
  if (!raw) return DEFAULT_BRANDING;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_BRANDING, ...parsed };
  } catch (e) {
    return DEFAULT_BRANDING;
  }
}

export function saveBranding(branding) {
  const current = getBranding();
  const updated = { ...current, ...branding };
  setStorageItem(STORAGE_KEY_BRANDING, JSON.stringify(updated));
  dispatchRegistryEvent('yiqul:branding-changed', updated);
  return updated;
}

/* ==========================================================================
   BANNER MANAGEMENT (Banner Gambar Promo / Pengumuman di Beranda)
   ========================================================================== */

export function getBanners() {
  const raw = getStorageItem(STORAGE_KEY_BANNERS);
  if (!raw) {
    saveBanners(DEFAULT_BANNERS, false);
    return [...DEFAULT_BANNERS];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_BANNERS];
  } catch (e) {
    return [...DEFAULT_BANNERS];
  }
}

export function saveBanners(banners, emitEvent = true) {
  setStorageItem(STORAGE_KEY_BANNERS, JSON.stringify(banners));
  if (emitEvent) {
    dispatchRegistryEvent('yiqul:banners-changed', { count: banners.length });
  }
}

export function addBanner(bannerData) {
  const banners = getBanners();
  const newBanner = {
    id: bannerData.id || `banner-${Date.now()}`,
    title: String(bannerData.title || '').trim(),
    subtitle: String(bannerData.subtitle || '').trim(),
    imageUrl: String(bannerData.imageUrl || '').trim(),
    actionUrl: String(bannerData.actionUrl || '').trim(),
    actionText: String(bannerData.actionText || 'Buka Link').trim(),
    isActive: bannerData.isActive !== false,
    displayOrder: Number(bannerData.displayOrder) || (banners.length + 1),
    updatedAt: new Date().toISOString()
  };
  banners.push(newBanner);
  saveBanners(banners);
  return newBanner;
}

export function updateBanner(id, updatedFields) {
  const banners = getBanners();
  const index = banners.findIndex(b => b.id === id);
  if (index === -1) {
    throw new Error(`Banner dengan ID "${id}" tidak ditemukan.`);
  }
  banners[index] = {
    ...banners[index],
    ...updatedFields,
    updatedAt: new Date().toISOString()
  };
  saveBanners(banners);
  return banners[index];
}

export function deleteBanner(id) {
  let banners = getBanners();
  const initialLength = banners.length;
  banners = banners.filter(b => b.id !== id);
  if (banners.length === initialLength) return false;
  saveBanners(banners);
  return true;
}

/**
 * Memindahkan urutan banner ke atas atau ke bawah
 * @param {string} id - ID banner
 * @param {'up'|'down'} direction - Arah perpindahan
 * @returns {Array} Daftar banner terbaru
 */
export function reorderBanner(id, direction) {
  const banners = getBanners();
  const index = banners.findIndex(b => b.id === id);
  if (index === -1) return banners;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= banners.length) {
    return banners;
  }

  const temp = banners[index];
  banners[index] = banners[targetIndex];
  banners[targetIndex] = temp;

  saveBanners(banners);
  return banners;
}

/* ==========================================================================
   DOCUMENTS MANAGEMENT (Buku Panduan, SK, Kalender PDF)
   ========================================================================== */

export function getDocuments() {
  const raw = getStorageItem(STORAGE_KEY_DOCUMENTS);
  if (!raw) {
    saveDocuments(DEFAULT_DOCUMENTS, false);
    return [...DEFAULT_DOCUMENTS];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_DOCUMENTS];
  } catch (e) {
    return [...DEFAULT_DOCUMENTS];
  }
}

export function saveDocuments(docs, emitEvent = true) {
  setStorageItem(STORAGE_KEY_DOCUMENTS, JSON.stringify(docs));
  if (emitEvent) {
    dispatchRegistryEvent('yiqul:documents-changed', { count: docs.length });
  }
}

export function addDocument(docData) {
  const docs = getDocuments();
  const newDoc = {
    id: docData.id || `doc-${Date.now()}`,
    title: String(docData.title || '').trim(),
    category: String(docData.category || 'Umum').trim(),
    fileUrl: String(docData.fileUrl || '').trim(),
    fileType: String(docData.fileType || 'application/pdf').trim(),
    fileSize: String(docData.fileSize || '1 MB').trim(),
    updatedAt: new Date().toISOString()
  };
  docs.push(newDoc);
  saveDocuments(docs);
  return newDoc;
}

export function deleteDocument(id) {
  let docs = getDocuments();
  const initialLength = docs.length;
  docs = docs.filter(d => d.id !== id);
  if (docs.length === initialLength) return false;
  saveDocuments(docs);
  return true;
}

/* ==========================================================================
   SCHEDULES / JADWAL & AGENDA KEGIATAN MANAGEMENT
   ========================================================================== */

export function getSchedules() {
  const raw = getStorageItem(STORAGE_KEY_SCHEDULES);
  if (!raw) {
    saveSchedules(DEFAULT_SCHEDULES, false);
    return [...DEFAULT_SCHEDULES];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_SCHEDULES];
  } catch (e) {
    return [...DEFAULT_SCHEDULES];
  }
}

export function saveSchedules(schedules, emitEvent = true) {
  setStorageItem(STORAGE_KEY_SCHEDULES, JSON.stringify(schedules));
  if (emitEvent) {
    dispatchRegistryEvent('yiqul:schedules-changed', { count: schedules.length });
  }
}

export function addSchedule(data) {
  const list = getSchedules();
  const item = {
    id: data.id || `sched-${Date.now()}`,
    title: String(data.title || '').trim(),
    category: String(data.category || 'Tahfidz').trim(),
    date: String(data.date || '').trim(),
    time: String(data.time || '').trim(),
    location: String(data.location || '').trim(),
    description: String(data.description || '').trim(),
    speakerOrHost: String(data.speakerOrHost || '').trim(),
    status: data.status || 'upcoming'
  };
  list.unshift(item);
  saveSchedules(list);
  logSecurityEvent('SCHEDULE_CREATED', 'INFO', `Jadwal baru ditambahkan: ${item.title}`);
  return item;
}

export function updateSchedule(id, updatedData) {
  const list = getSchedules();
  const index = list.findIndex(s => s.id === id);
  if (index === -1) return null;

  list[index] = {
    ...list[index],
    title: updatedData.title !== undefined ? String(updatedData.title).trim() : list[index].title,
    category: updatedData.category !== undefined ? String(updatedData.category).trim() : list[index].category,
    date: updatedData.date !== undefined ? String(updatedData.date).trim() : list[index].date,
    time: updatedData.time !== undefined ? String(updatedData.time).trim() : list[index].time,
    location: updatedData.location !== undefined ? String(updatedData.location).trim() : list[index].location,
    description: updatedData.description !== undefined ? String(updatedData.description).trim() : list[index].description,
    speakerOrHost: updatedData.speakerOrHost !== undefined ? String(updatedData.speakerOrHost).trim() : list[index].speakerOrHost,
    status: updatedData.status !== undefined ? updatedData.status : list[index].status
  };

  saveSchedules(list);
  logSecurityEvent('SCHEDULE_UPDATED', 'INFO', `Jadwal diperbarui: ${list[index].title}`);
  return list[index];
}

export function deleteSchedule(id) {
  const list = getSchedules();
  const target = list.find(s => s.id === id);
  const filtered = list.filter(s => s.id !== id);
  saveSchedules(filtered);
  if (target) {
    logSecurityEvent('SCHEDULE_DELETED', 'WARN', `Jadwal dihapus: ${target.title}`);
  }
  return true;
}

export function resetSchedules() {
  saveSchedules([...DEFAULT_SCHEDULES]);
  return [...DEFAULT_SCHEDULES];
}

/* ==========================================================================
   ROLE & AUTHENTICATION MANAGEMENT
   ========================================================================== */

export function getCurrentRole() {
  return getStorageItem(STORAGE_KEY_ROLE) || 'guest';
}

export function setCurrentRole(role) {
  const validRoles = ['guest', 'asatidz', 'admin', 'superadmin'];
  const safeRole = validRoles.includes(role) ? role : 'guest';
  setStorageItem(STORAGE_KEY_ROLE, safeRole);
  dispatchRegistryEvent('yiqul:role-changed', { role: safeRole });
  return safeRole;
}

export function getAdminPin() {
  return getStoredPinHash();
}

export function saveAdminPin(newPin) {
  return storeNewPin(newPin);
}

export function verifyAdminPin(inputPin) {
  const rateLimit = checkRateLimit();
  if (rateLimit.isLocked) {
    return false;
  }

  const currentPinHash = getStoredPinHash();
  const inputHash = hashPin(inputPin);

  if (inputHash === currentPinHash) {
    recordSuccessfulAttempt('LOGIN_ADMIN');
    setCurrentRole('superadmin');
    return true;
  }

  recordFailedAttempt('LOGIN_ADMIN');
  return false;
}

export function isAdminLoggedIn() {
  const role = getCurrentRole();
  return role === 'admin' || role === 'superadmin';
}

export function logoutAdmin() {
  setCurrentRole('guest');
  logSecurityEvent('LOGOUT_ADMIN', 'INFO', 'Sesi Administrator berhasil ditutup.');
  return true;
}

// Re-export fungsi keamanan terintegrasi
export {
  checkRateLimit,
  getSecurityAuditLogs,
  clearSecurityAuditLogs,
  logSecurityEvent,
  bindPinModalHelpers,
  resetPinInputState
};
