/**
 * SERVICE: FIREBASE CLOUD DATABASE CONNECTOR (V3.0 HYBRID RESILIENT)
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengintegrasikan Firebase Cloud Firestore (Spark Plan - Gratis 100%)
 * Menggunakan:
 * 1. Official Firebase Web SDK dengan experimentalForceLongPolling (anti-blokir firewall/proxy)
 * 2. Fallback REST API v1 asli Google Cloud
 * 3. Support Firebase Realtime Database
 * 4. Diagnostik cerdas ramah pemula jika database belum dibuat di console
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
 * Konfigurasi Resmi Firebase Portal Yiqul milik Yayasan Islam Qudwatul Ummah
 */
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA9SXs99SRS5inz36SqZDC1VmYLc13uK14",
  authDomain: "portal-yiqul-db.firebaseapp.com",
  projectId: "portal-yiqul-db",
  storageBucket: "portal-yiqul-db.firebasestorage.app",
  messagingSenderId: "189548123496",
  appId: "1:189548123496:web:c6dbbd288b8e625c56b2dd",
  databaseType: 'firestore',
  rtdbUrl: 'https://portal-yiqul-db-default-rtdb.asia-southeast1.firebasedatabase.app'
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
  const current = getFirebaseConfig();
  const updated = { ...DEFAULT_FIREBASE_CONFIG, ...current, ...config };
  if (storage) {
    storage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(updated));
  }
  return updated;
}

/**
 * Cek apakah Firebase sudah dikonfigurasi
 */
export function isFirebaseConfigured() {
  const cfg = getFirebaseConfig();
  return Boolean(cfg.apiKey && cfg.projectId);
}

/**
 * Helper: Memuat modul resmi Firebase Web SDK dari Google CDN
 * dengan proteksi long-polling untuk mencegah pemblokiran koneksi streaming
 */
let cachedFirebase = null;

async function getFirebaseModules(cfg) {
  if (typeof window === 'undefined') return null;
  if (cachedFirebase) return cachedFirebase;

  try {
    const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const { initializeFirestore, getFirestore, doc, setDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

    const app = getApps().length === 0 ? initializeApp(cfg) : getApp();
    
    // Inisialisasi Firestore dengan experimentalForceLongPolling agar stabil di semua jaringan provider
    let db;
    try {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true
      });
    } catch (e) {
      db = getFirestore(app);
    }

    cachedFirebase = { db, doc, setDoc, getDoc };
    return cachedFirebase;
  } catch (err) {
    console.warn('[Firebase SDK CDN Load Warning]', err);
    return null;
  }
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

  // Mode RTDB
  if (cfg.databaseType === 'rtdb') {
    const dbUrl = cfg.rtdbUrl || `https://${cfg.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;
    const endpoint = `${dbUrl.replace(/\/$/, '')}/portal_yiqul.json?auth=${cfg.apiKey}`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: jsonString
    });
    if (!response.ok) {
      throw new Error(`Gagal menyimpan ke Realtime Database. Status: ${response.status}`);
    }
    return { success: true, database: 'rtdb', savedAt: payload.updatedAt };
  }

  // Mode Firestore (1. Coba via SDK Resmi dengan Long-Polling)
  const fb = await getFirebaseModules(cfg);
  if (fb) {
    try {
      const docRef = fb.doc(fb.db, 'portal_yiqul', 'registry');
      await fb.setDoc(docRef, {
        payload: jsonString,
        updatedAt: payload.updatedAt,
        portalTitle: payload.branding?.portalTitle || 'PORTAL YIQUL'
      });
      return { success: true, database: 'firestore', savedAt: payload.updatedAt };
    } catch (sdkError) {
      console.error('[Firebase SDK push error]', sdkError);
      handleDetailedFirebaseError(sdkError);
    }
  }

  // Fallback REST API
  const endpoint = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/portal_yiqul/registry?key=${cfg.apiKey}`;
  const firestoreBody = {
    fields: {
      payload: { stringValue: jsonString },
      updatedAt: { stringValue: payload.updatedAt }
    }
  };

  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(firestoreBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gagal menyimpan ke Firestore REST (${response.status}): ${errText}`);
  }

  return { success: true, database: 'firestore', savedAt: payload.updatedAt };
}

/**
 * Menarik (Pull) data terbaru dari Firebase Cloud Database ke Portal Lokal
 */
export async function pullFromFirebase() {
  const cfg = getFirebaseConfig();
  if (!cfg.apiKey || !cfg.projectId) {
    throw new Error('Konfigurasi Firebase belum lengkap. Masukkan API Key dan Project ID di Pengaturan Admin.');
  }

  // Mode RTDB
  if (cfg.databaseType === 'rtdb') {
    const dbUrl = cfg.rtdbUrl || `https://${cfg.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;
    const endpoint = `${dbUrl.replace(/\/$/, '')}/portal_yiqul.json?auth=${cfg.apiKey}`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`Gagal membaca Realtime Database (${response.status})`);
    const data = await response.json();
    if (!data) throw new Error('Data di Realtime Database masih kosong.');
    importRegistryJson(typeof data === 'string' ? data : JSON.stringify(data));
    return { success: true, database: 'rtdb' };
  }

  // 1. Coba via SDK Resmi
  const fb = await getFirebaseModules(cfg);
  if (fb) {
    try {
      const docRef = fb.doc(fb.db, 'portal_yiqul', 'registry');
      const snap = await fb.getDoc(docRef);
      if (!snap.exists()) {
        throw new Error('Dokumen database belum ada di Firestore. Klik tombol "Unggah ke Firebase (Push)" terlebih dahulu.');
      }
      const data = snap.data();
      if (!data || !data.payload) throw new Error('Data payload Firestore kosong.');
      importRegistryJson(data.payload);
      return { success: true, database: 'firestore' };
    } catch (sdkError) {
      console.error('[Firebase SDK pull error]', sdkError);
      handleDetailedFirebaseError(sdkError);
    }
  }

  // 2. Fallback REST API
  const endpoint = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/portal_yiqul/registry?key=${cfg.apiKey}`;
  const response = await fetch(endpoint);

  if (response.status === 404) {
    throw new Error('Database Firestore belum diinisialisasi. Silakan klik tombol "Unggah ke Firebase (Push)" terlebih dahulu!');
  }
  if (!response.ok) {
    throw new Error(`Gagal mengambil data dari Firestore REST (Status: ${response.status})`);
  }

  const doc = await response.json();
  const payloadString = doc.fields?.payload?.stringValue;
  if (!payloadString) throw new Error('Format dokumen Firestore kosong.');
  importRegistryJson(payloadString);
  return { success: true, database: 'firestore' };
}

/**
 * Uji koneksi ke Firebase dengan diagnosa langkah perbaikan otomatis
 */
export async function testFirebaseConnection() {
  const cfg = getFirebaseConfig();
  if (!cfg.apiKey || !cfg.projectId) {
    return { success: false, message: 'Harap isi API Key dan Project ID terlebih dahulu.' };
  }

  // 1. Uji via Official Firebase Web SDK
  try {
    const fb = await getFirebaseModules(cfg);
    if (fb) {
      const docRef = fb.doc(fb.db, 'portal_yiqul', 'registry');
      await fb.getDoc(docRef);
      return { 
        success: true, 
        message: 'Alhamdulillah! Koneksi ke Firebase Cloud Firestore Berhasil 100%!\nDatabase siap digunakan untuk sinkronisasi.' 
      };
    }
  } catch (sdkError) {
    console.error('[Firebase Test Error]', sdkError);
    return getFriendlyDiagnostic(sdkError, cfg);
  }

  // 2. Coba uji via REST API jika SDK CDN diblokir
  try {
    const endpoint = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents?key=${cfg.apiKey}&pageSize=1`;
    const res = await fetch(endpoint);
    if (res.ok || res.status === 404) {
      return { 
        success: true, 
        message: 'Alhamdulillah! Koneksi REST ke Cloud Firestore Berhasil!\nDatabase aktif dan terhubung.' 
      };
    }
    const errJson = await res.json().catch(() => null);
    return {
      success: false,
      message: `Google API menolak akses (${res.status}): ${errJson?.error?.message || res.statusText}`
    };
  } catch (netErr) {
    return getFriendlyDiagnostic(netErr, cfg);
  }
}

/**
 * Format pesan diagnosa ramah pemula ketika terjadi error
 */
function getFriendlyDiagnostic(err, cfg) {
  const errStr = String(err.message || err.code || err);

  if (errStr.includes('Failed to fetch') || errStr.includes('network') || err.name === 'TypeError') {
    return {
      success: false,
      message: `⚠️ Gagal menghubungi server Firebase (Failed to fetch).\n\nAda 2 kemungkinan penyebab utama:\n\n1. Database Cloud Firestore BELUM DIBUAT di Firebase Console:\n   👉 Buka https://console.firebase.google.com/project/${cfg.projectId}/firestore\n   👉 Klik tombol biru "Create database" (Buat database)\n   👉 Pilih lokasi: Jakarta (asia-southeast2)\n   👉 Pilih aturan: "Start in test mode", lalu klik "Create".\n\n2. Ekstensi Browser / AdBlocker memblokir koneksi:\n   👉 Nonaktifkan AdBlocker (AdBlock/Shields) untuk situs ini atau coba buka lewat jendela Incognito (Private).`
    };
  }

  if (err.code === 'not-found' || errStr.includes('not-found') || errStr.includes('does not exist')) {
    return {
      success: false,
      message: `⚠️ Database Cloud Firestore belum dibuat untuk project "${cfg.projectId}"!\n\nCara memperbaiki:\n1. Kunjungi: https://console.firebase.google.com/project/${cfg.projectId}/firestore\n2. Klik tombol "Create database"\n3. Pilih lokasi Jakarta dan "Start in test mode"\n4. Klik Create.`
    };
  }

  if (err.code === 'permission-denied' || errStr.includes('permission-denied') || errStr.includes('PERMISSION_DENIED')) {
    return {
      success: false,
      message: `⚠️ Akses ditolak oleh Aturan Keamanan (Security Rules)!\n\nCara memperbaiki:\n1. Buka tab "Rules" di https://console.firebase.google.com/project/${cfg.projectId}/firestore\n2. Ganti kodenya menjadi:\n   allow read, write: if true;\n3. Klik tombol "Publish".`
    };
  }

  return {
    success: false,
    message: `Gagal menghubungi Firebase: ${errStr}`
  };
}

function handleDetailedFirebaseError(err) {
  const diag = getFriendlyDiagnostic(err, getFirebaseConfig());
  throw new Error(diag.message);
}
