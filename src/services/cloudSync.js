/**
 * SERVICE: CLOUD DATABASE CONNECTOR & SYNC
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Menghubungkan frontend PWA (di Netlify / GitHub Pages) dengan
 * Backend Google Apps Script & Google Sheets Database secara real-time.
 */

import { 
  exportRegistryJson, 
  importRegistryJson, 
  getAllApps, 
  getBanners, 
  getBranding, 
  getDocuments, 
  getAnnouncement 
} from './storage.js';

const STORAGE_KEY_CLOUD_URL = 'yiqul_cloud_backend_url';

export function getCloudBackendUrl() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(STORAGE_KEY_CLOUD_URL) || '';
  }
  return '';
}

export function saveCloudBackendUrl(url) {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY_CLOUD_URL, (url || '').trim());
  }
}

/**
 * Tarik data terbaru dari Cloud Backend Google Apps Script
 */
export async function pullFromCloud() {
  const apiUrl = getCloudBackendUrl();
  if (!apiUrl) {
    throw new Error('URL Cloud Backend belum disetel. Harap masukkan URL Web App Google Apps Script di Pengaturan Admin.');
  }

  const endpoint = apiUrl.includes('?') ? `${apiUrl}&action=getConfig` : `${apiUrl}?action=getConfig`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`Koneksi cloud gagal dengan status: ${response.status}`);
  }

  const resJson = await response.json();
  if (!resJson || !resJson.success || !resJson.config) {
    throw new Error(resJson?.error || 'Data cloud kosong atau belum diinisialisasi.');
  }

  // Terapkan ke storage lokal
  const result = importRegistryJson(JSON.stringify(resJson.config));
  return result;
}

/**
 * Kirim data lokal saat ini ke Cloud Backend Google Apps Script
 */
export async function pushToCloud() {
  const apiUrl = getCloudBackendUrl();
  if (!apiUrl) {
    throw new Error('URL Cloud Backend belum disetel. Harap masukkan URL Web App Google Apps Script di Pengaturan Admin.');
  }

  const payload = {
    action: 'saveConfig',
    config: {
      apps: getAllApps(),
      banners: getBanners(),
      branding: getBranding(),
      documents: getDocuments(),
      announcement: getAnnouncement(),
      exportedAt: new Date().toISOString()
    }
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' } // text/plain menghindari preflight CORS di Google Apps Script
  });

  if (!response.ok) {
    throw new Error(`Gagal mengirim data ke cloud. Status: ${response.status}`);
  }

  const resJson = await response.json();
  if (!resJson || !resJson.success) {
    throw new Error(resJson?.error || 'Gagal menyimpan konfigurasi ke cloud.');
  }

  return resJson;
}
