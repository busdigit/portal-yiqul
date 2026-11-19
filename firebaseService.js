/**
 * SERVICE: FIREBASE CLOUD DATABASE CONNECTOR
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengintegrasikan Firebase Cloud Firestore & Realtime Database (Spark Plan - Gratis 100%)
 * Menggunakan arsitektur zero-bloat REST API asli Google Firebase tanpa ketergantungan library berat.
 * 
 * Kuota Gratis Firebase Spark Plan:
 * - 1 GB Penyimpanan Database
 * - 50.000 Dokumen Read per hari
 * - 20.000 Dokumen Write per hari
 * - 10 GB Egress Jaringan per bulan
 */

import { 
  getAllApps, 
  getBanners, 
  getBranding, 
  getDocuments, 
  getAnnouncement, 
  importRegistryJson 
} from './storage.js';

const STORAGE_KEY_FIREBASE_CONFIG = 'yiqul_firebase_config';

/**
 * Struktur Default Konfigurasi Firebase
 */
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: '',
  projectId: '',
  databaseType: 'firestore', // 'firestore' atau 'rtdb'
  rtdbUrl: ''
};

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
  return null;
}

/**
 * Mengambil konfigurasi Firebase dari localStorage
 */
export function getFirebaseConfig() {
  const storage = getStorage();
  if (!storage) return { ...DEFAULT_FIREBASE_CONFIG };

  try {
    const raw = storage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (!raw) return { ...DEFAULT_FIREBASE_CONFIG };
    return { ...DEFAULT_FIREBASE_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_FIREBASE_CONFIG };
  }
}

/**
 * Menyimpan konfigurasi Firebase ke localStorage
 */
export function saveFirebaseConfig(config) {
  const storage = getStorage();
  if (storage) {
    const current = getFirebaseConfig();
    const updated = { ...current, ...config };
    storage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(updated));
    return updated;
  }
  return config;
}

/**
 * Cek apakah Firebase sudah dikonfigurasi dengan Project ID & API Key valid
 */
export function isFirebaseConfigured() {
  const cfg = getFirebaseConfig();
  return Boolean(cfg.apiKey && cfg.projectId);
}

/**
 * Mendorong (Push) seluruh data lokal Portal Yiqul ke Firebase Cloud Database
 */
export async function pushToFirebase() {
  const cfg = getFirebaseConfig();
  if (!cfg.apiKey || !cfg.projectId) {
    throw new Error('Konfigurasi Firebase belum lengkap. Masukkan API Key dan Project ID di Pengaturan Admin.');
  }

  const payload = {
    apps: getAllApps(),
    banners: getBanners(),
    branding: getBranding(),
    documents: getDocuments(),
    announcement: getAnnouncement(),
    updatedAt: new Date().toISOString()
  };

  const jsonString = JSON.stringify(payload);

  if (cfg.databaseType === 'rtdb') {
    // Mode Firebase Realtime Database
    const dbUrl = cfg.rtdbUrl || `https://${cfg.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;
    const endpoint = `${dbUrl.replace(/\/$/, '')}/portal_yiqul.json?auth=${cfg.apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: jsonString
    });

    if (!response.ok) {
      throw new Error(`Gagal menyimpan ke Realtime Database. Status: ${response.status} (${response.statusText})`);
    }

    return { success: true, database: 'rtdb', savedAt: new Date().toISOString() };
  } else {
    // Mode Firebase Cloud Firestore (Default & Rekomendasi)
    // Menggunakan Firestore REST API v1 (Zero-Bloat, Native JSON)
    const endpoint = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/portal_yiqul/registry?key=${cfg.apiKey}`;
    
    const firestoreBody = {
      fields: {
        payload: { stringValue: jsonString },
        updatedAt: { stringValue: new Date().toISOString() },
        portalTitle: { stringValue: payload.branding?.portalTitle || 'PORTAL YIQUL' }
      }
    };

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firestoreBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      let msg = `Gagal menyimpan ke Firestore. Status: ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error && errJson.error.message) {
          msg += ` - ${errJson.error.message}`;
        }
      } catch (e) {}
      throw new Error(msg);
    }

    return { success: true, database: 'firestore', savedAt: new Date().toISOString() };
  }
}

/**
 * Menarik (Pull) data terbaru dari Firebase Cloud Database ke Portal Lokal
 */
export async function pullFromFirebase() {
  const cfg = getFirebaseConfig();
  if (!cfg.apiKey || !cfg.projectId) {
    throw new Error('Konfigurasi Firebase belum lengkap. Masukkan API Key dan Project ID di Pengaturan Admin.');
  }

  if (cfg.databaseType === 'rtdb') {
    // Mode Firebase Realtime Database
    const dbUrl = cfg.rtdbUrl || `https://${cfg.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;
    const endpoint = `${dbUrl.replace(/\/$/, '')}/portal_yiqul.json?auth=${cfg.apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil data dari Realtime Database. Status: ${response.status}`);
    }

    const data = await response.json();
    if (!data) throw new Error('Data di Firebase Realtime Database masih kosong.');

    importRegistryJson(typeof data === 'string' ? data : JSON.stringify(data));
    return { success: true, database: 'rtdb' };
  } else {
    // Mode Firebase Cloud Firestore
    const endpoint = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/portal_yiqul/registry?key=${cfg.apiKey}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.status === 404) {
      throw new Error('Database Firestore belum diinisialisasi. Silakan klik tombol "Unggah ke Firebase (Push)" terlebih dahulu!');
    }

    if (!response.ok) {
      const errText = await response.text();
      let msg = `Gagal mengambil data dari Firestore. Status: ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error && errJson.error.message) {
          msg += ` - ${errJson.error.message}`;
        }
      } catch (e) {}
      throw new Error(msg);
    }

    const doc = await response.json();
    if (!doc.fields || !doc.fields.payload || !doc.fields.payload.stringValue) {
      throw new Error('Format dokumen Firestore tidak valid atau kosong.');
    }

    const payloadString = doc.fields.payload.stringValue;
    importRegistryJson(payloadString);
    return { success: true, database: 'firestore' };
  }
}

/**
 * Uji koneksi ke Firebase
 */
export async function testFirebaseConnection() {
  const cfg = getFirebaseConfig();
  if (!cfg.apiKey || !cfg.projectId) {
    return { success: false, message: 'Harap isi API Key dan Project ID terlebih dahulu.' };
  }

  try {
    const endpoint = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents?key=${cfg.apiKey}&pageSize=1`;
    const res = await fetch(endpoint);
    if (res.ok || res.status === 404) {
      return { success: true, message: 'Koneksi ke Firebase Cloud Firestore Berhasil! (Status 200 OK)' };
    }
    const err = await res.json();
    return { 
      success: false, 
      message: `Koneksi ditolak oleh Firebase: ${err?.error?.message || res.statusText}` 
    };
  } catch (error) {
    return { success: false, message: `Gagal menghubungi Firebase: ${error.message}` };
  }
}
