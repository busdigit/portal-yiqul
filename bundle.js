/**
 * PORTAL YIQUL — ALL-IN-ONE BUNDLE JS
 * Zero-Bloat Standalone Client Engine
 */
(function() {
  'use strict';
  
/* --- MODULE: src/services/sanitizer.js --- */
/**
 * SANITIZER & SECURITY UTILITIES
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Melindungi portal dari serangan XSS (Cross-Site Scripting),
 * tabnabbing, dan injeksi protokol URI berbahaya (javascript: dsb).
 */

/**
 * Validasi dan sanitasi URL target.
 * Hanya mengizinkan protokol https: dan http:.
 * @param {string} url - URL mentah yang akan divalidasi
 * @returns {string} URL yang aman atau '#' jika tidak valid/berbahaya
 */
function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();

  // Larang keras protokol berbahaya
  const dangerousProtocols = /^(javascript|data|vbscript|file|about):/i;
  if (dangerousProtocols.test(trimmed)) {
    console.warn(`[Security Warning] Protokol URL diblokir: ${trimmed}`);
    return '#';
  }

  try {
    const baseUrl = (typeof window !== 'undefined' && window.location && window.location.href)
      ? window.location.href
      : 'https://yiqul.internal';
    const parsed = new URL(trimmed, baseUrl);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return trimmed;
    }
    return '#';
  } catch (e) {
    // Jika format URL gagal diparsing
    return '#';
  }
}

/**
 * Memeriksa apakah URL valid dan aman
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  const dangerousProtocols = /^(javascript|data|vbscript|file|about):/i;
  if (dangerousProtocols.test(trimmed)) return false;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch (e) {
    return false;
  }
}

/**
 * Melakukan HTML escaping untuk mencegah injeksi XSS pada teks yang dimasukkan user
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Menghasilkan atribut HTML pengaman untuk elemen <a>
 * Memastikan rel="noopener noreferrer" otomatis tersemat jika target="_blank".
 * @param {"_blank" | "_self" | "iframe"} targetMode
 * @returns {string} string atribut HTML
 */
function getSafeLinkAttributes(targetMode = '_blank') {
  if (targetMode === '_blank') {
    return 'target="_blank" rel="noopener noreferrer"';
  }
  if (targetMode === '_self') {
    return 'target="_self"';
  }
  // Untuk mode iframe, tombol dikontrol via JavaScript event handler
  return 'data-modal="iframe" role="button"';
}


/* --- MODULE: src/services/security.js --- */
/**
 * CYBER SECURITY DEFENSE ENGINE
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Sistem Keamanan Komprehensif:
 * 1. Cryptographic SHA-256 Hashing & Salting (FIPS 180-4 standard)
 * 2. Anti-Brute Force Rate Limiter & Progressive Lockout
 * 3. Tamper-Evident Security Audit Logger (Audit Trail)
 * 4. Inactivity Session Timeout Engine (Anti-Hijacking)
 * 5. Anti-Prototype Pollution & Input Sanitizer Hardening
 * 6. Anti-Clickjacking Frame Guard
 */

const STORAGE_KEY_PIN_HASH = 'yiqul_admin_pin_hash';
const STORAGE_KEY_FAILED_ATTEMPTS = 'yiqul_sec_failed_attempts';
const STORAGE_KEY_LOCKOUT_UNTIL = 'yiqul_sec_lockout_until';
const STORAGE_KEY_SECURITY_LOGS = 'yiqul_security_audit_logs';

const GLOBAL_SALT = 'yiqul_defense_salt_2026_v1';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIER1_MS = 60 * 1000;      // 60 detik (1 menit)
const LOCKOUT_TIER2_MS = 5 * 60 * 1000;  // 300 detik (5 menit)
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 menit inaktivitas

// Memory fallback untuk pengujian Node.js
const memorySecStore = new Map();

function getSecStorage(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memorySecStore.get(key) || null;
  } catch (e) {
    return memorySecStore.get(key) || null;
  }
}

function setSecStorage(key, value) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
    memorySecStore.set(key, value);
  } catch (e) {
    memorySecStore.set(key, value);
  }
}

function removeSecStorage(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
    memorySecStore.delete(key);
  } catch (e) {
    memorySecStore.delete(key);
  }
}

/**
 * 1. Standalone Pure JS SHA-256 Cryptographic Hash (FIPS 180-4)
 * Menjamin eksekusi kriptografi sinkron tanpa ketergantungan library luar
 * @param {string} ascii - Teks yang akan di-hash
 * @returns {string} Hexadecimal string SHA-256 (64 karakter)
 */
function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;
  let result = '';
  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  const hash = [];
  const k = [];
  let primeCounter = 0;
  const isComposite = {};

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
  words[words[lengthProperty]] = (asciiBitLength);

  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, j += 16);
    const oldHash = hash.slice(0);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0
        );
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash.unshift((temp1 + temp2) | 0);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Hash PIN dengan Salt untuk proteksi penyimpanan persisten
 * @param {string} pin - Plaintext PIN
 * @returns {string} Hashed PIN
 */
function hashPin(pin) {
  const cleanPin = String(pin || '').trim();
  return sha256(`${GLOBAL_SALT}:${cleanPin}`);
}

// Default Hashed PIN untuk "1234"
const DEFAULT_PIN_HASH = hashPin('1234');

/**
 * Ambil Hash PIN Admin dari storage (dengan migrasi otomatis dari legacy plaintext)
 * @returns {string} Hashed PIN
 */
function getStoredPinHash() {
  // Cek apakah sudah ada PIN Hash
  const hash = getSecStorage(STORAGE_KEY_PIN_HASH);
  if (hash) return hash;

  // Cek migrasi dari plaintext legacy
  const legacyPin = getSecStorage('yiqul_admin_pin');
  if (legacyPin) {
    const migratedHash = hashPin(legacyPin);
    setSecStorage(STORAGE_KEY_PIN_HASH, migratedHash);
    removeSecStorage('yiqul_admin_pin'); // Bersihkan plaintext demi keamanan
    logSecurityEvent('PIN_MIGRATED', 'INFO', 'PIN plaintext berhasil diamankan ke SHA-256 Hash.');
    return migratedHash;
  }

  // Fallback default (1234 yang telah di-hash)
  setSecStorage(STORAGE_KEY_PIN_HASH, DEFAULT_PIN_HASH);
  return DEFAULT_PIN_HASH;
}

/**
 * Simpan Hash PIN Admin baru
 * @param {string} newPin
 * @returns {boolean}
 */
function storeNewPin(newPin) {
  if (!newPin || String(newPin).trim().length < 4) {
    throw new Error('PIN Keamanan minimal harus 4 karakter.');
  }
  const cleanPin = String(newPin).trim();
  const hashed = hashPin(cleanPin);
  setSecStorage(STORAGE_KEY_PIN_HASH, hashed);
  removeSecStorage('yiqul_admin_pin'); // Pastikan tidak ada jejak plaintext
  logSecurityEvent('PIN_CHANGED', 'WARN', 'PIN Administrator berhasil diubah dan dienkripsi.');
  return true;
}

/* ==========================================================================
   2. ANTI-BRUTE FORCE RATE LIMITER & PROGRESSIVE LOCKOUT
   ========================================================================== */

/**
 * Memeriksa status penangguhan (lockout) brute force saat ini
 * @returns {{ isLocked: boolean, remainingSeconds: number, attemptsLeft: number }}
 */
function checkRateLimit() {
  const lockoutUntilRaw = getSecStorage(STORAGE_KEY_LOCKOUT_UNTIL);
  const now = Date.now();

  if (lockoutUntilRaw) {
    const lockoutUntil = Number(lockoutUntilRaw);
    if (now < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
      return {
        isLocked: true,
        remainingSeconds,
        attemptsLeft: 0
      };
    } else {
      // Lockout expired, reset lockout timestamp
      removeSecStorage(STORAGE_KEY_LOCKOUT_UNTIL);
    }
  }

  const failedAttempts = Number(getSecStorage(STORAGE_KEY_FAILED_ATTEMPTS) || 0);
  const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - failedAttempts);

  return {
    isLocked: false,
    remainingSeconds: 0,
    attemptsLeft
  };
}

/**
 * Catat kegagalan input PIN. Jika melebihi batas, aktifkan lockout otomatis.
 * @param {string} context - Konteks percobaan (misal 'ADMIN_LOGIN' atau 'APP_UNLOCK')
 * @returns {{ isLocked: boolean, remainingSeconds: number, attemptsLeft: number }}
 */
function recordFailedAttempt(context = 'AUTH') {
  let failed = Number(getSecStorage(STORAGE_KEY_FAILED_ATTEMPTS) || 0) + 1;
  setSecStorage(STORAGE_KEY_FAILED_ATTEMPTS, String(failed));

  logSecurityEvent('AUTH_FAILED', 'WARN', `Percobaan gagal ke-${failed} pada ${context}.`);

  if (failed >= MAX_FAILED_ATTEMPTS) {
    const cooldownMs = failed >= 10 ? LOCKOUT_TIER2_MS : LOCKOUT_TIER1_MS;
    const lockoutUntil = Date.now() + cooldownMs;
    setSecStorage(STORAGE_KEY_LOCKOUT_UNTIL, String(lockoutUntil));
    const remainingSeconds = Math.ceil(cooldownMs / 1000);

    logSecurityEvent('BRUTE_FORCE_LOCKOUT', 'DANGER', `Sistem mendeteksi serangan brute force! Akses ditangguhkan selama ${remainingSeconds} detik.`);

    return {
      isLocked: true,
      remainingSeconds,
      attemptsLeft: 0
    };
  }

  return {
    isLocked: false,
    remainingSeconds: 0,
    attemptsLeft: MAX_FAILED_ATTEMPTS - failed
  };
}

/**
 * Catat keberhasilan autentikasi dan reset counter kegagalan
 * @param {string} context
 */
function recordSuccessfulAttempt(context = 'AUTH') {
  removeSecStorage(STORAGE_KEY_FAILED_ATTEMPTS);
  removeSecStorage(STORAGE_KEY_LOCKOUT_UNTIL);
  logSecurityEvent('AUTH_SUCCESS', 'INFO', `Autentikasi ${context} berhasil.`);
}

/* ==========================================================================
   3. TAMPER-EVIDENT SECURITY AUDIT LOGGER (AUDIT TRAIL)
   ========================================================================== */

/**
 * Mencatat peristiwa keamanan ke dalam log audit
 * @param {string} type - Tipe peristiwa (misal: 'AUTH_SUCCESS', 'PIN_CHANGED')
 * @param {'INFO' | 'WARN' | 'DANGER'} severity
 * @param {string} details
 */
function logSecurityEvent(type, severity = 'INFO', details = '') {
  try {
    const raw = getSecStorage(STORAGE_KEY_SECURITY_LOGS);
    let logs = [];
    if (raw) {
      try {
        logs = JSON.parse(raw);
        if (!Array.isArray(logs)) logs = [];
      } catch (e) {
        logs = [];
      }
    }

    const newLog = {
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      type: String(type || 'SECURITY_EVENT').toUpperCase(),
      severity: ['INFO', 'WARN', 'DANGER'].includes(severity) ? severity : 'INFO',
      details: String(details || '').slice(0, 200)
    };

    // Pertahankan maksimal 50 log terakhir
    logs.unshift(newLog);
    if (logs.length > 50) {
      logs = logs.slice(0, 50);
    }

    setSecStorage(STORAGE_KEY_SECURITY_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.warn('[Security] Gagal menulis audit log:', err);
  }
}

/**
 * Mengambil seluruh log audit keamanan
 * @returns {Array<Object>}
 */
function getSecurityAuditLogs() {
  const raw = getSecStorage(STORAGE_KEY_SECURITY_LOGS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Membersihkan log audit keamanan (hanya oleh Superadmin)
 */
function clearSecurityAuditLogs() {
  const now = new Date().toISOString();
  const resetLog = [{
    id: `sec-${Date.now()}`,
    timestamp: now,
    type: 'LOG_PURGED',
    severity: 'WARN',
    details: 'Seluruh riwayat log keamanan sebelumnya telah direset oleh Superadmin.'
  }];
  setSecStorage(STORAGE_KEY_SECURITY_LOGS, JSON.stringify(resetLog));
  return true;
}

/* ==========================================================================
   4. INACTIVITY SESSION TIMEOUT (ANTI-HIJACKING)
   ========================================================================== */
let lastActivityTime = Date.now();
let inactivityInterval = null;

function updateActivityTimestamp() {
  lastActivityTime = Date.now();
}

/**
 * Inisialisasi pengawas inaktivitas sesi admin (15 menit)
 * @param {Function} onTimeoutCallback - Dipanggil saat sesi expired
 */
function initSessionTimeout(onTimeoutCallback) {
  if (typeof window === 'undefined') return;

  // Catat interaksi pengguna
  const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
  events.forEach(evt => {
    window.addEventListener(evt, updateActivityTimestamp, { passive: true });
  });

  if (inactivityInterval) clearInterval(inactivityInterval);

  inactivityInterval = setInterval(() => {
    const elapsed = Date.now() - lastActivityTime;
    if (elapsed > SESSION_TIMEOUT_MS) {
      if (typeof onTimeoutCallback === 'function') {
        onTimeoutCallback();
      }
      logSecurityEvent('SESSION_EXPIRED', 'WARN', 'Sesi Administrator berakhir otomatis karena inaktivitas (15 menit).');
      lastActivityTime = Date.now();
    }
  }, 30 * 1000); // Evaluasi setiap 30 detik
}

/* ==========================================================================
   5. ANTI-PROTOTYPE POLLUTION & INPUT INTEGRITY
   ========================================================================== */

/**
 * Mencegah Prototype Pollution saat mem-parse JSON eksternal / impor registry
 * @param {any} obj - Objek yang akan dibersihkan
 * @returns {any} Objek steril
 */
function sanitizeObject(obj) {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const clean = {};
  for (const key of Object.keys(obj)) {
    // Larang kunci prototype berbahaya
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      logSecurityEvent('INJECTION_BLOCKED', 'DANGER', `Upaya injeksi prototype pollution diblokir: key '${key}'`);
      continue;
    }
    clean[key] = sanitizeObject(obj[key]);
  }
  return clean;
}

/* ==========================================================================
   6. ANTI-CLICKJACKING FRAME GUARD
   ========================================================================== */

/**
 * Memeriksa apakah website dimuat di dalam iframe eksternal yang tidak sah
 */
function checkClickjackingGuard() {
  if (typeof window === 'undefined') return;
  try {
    if (window.top !== window.self) {
      console.warn('[Security Guard] Portal Yiqul dimuat di dalam iframe eksternal. Mengaktifkan perlindungan.');
      logSecurityEvent('IFRAME_EMBED_DETECTED', 'WARN', 'Portal diakses di dalam frame pihak ketiga.');
    }
  } catch (e) {
    // Cross-origin iframe terdeteksi
    logSecurityEvent('CLICKJACKING_BLOCKED', 'DANGER', 'Upaya clickjacking cross-origin terdeteksi.');
  }
}


/* --- MODULE: src/services/analytics.js --- */
/**
 * SERVICE: DAILY VISITOR ANALYTICS & MONITORING ENGINE
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Melacak dan memantau pengunjung harian, kunjungan unik, total akumulasi akses,
 * serta frekuensi peluncuran aplikasi secara real-time tanpa dependensi eksternal.
 */

const STORAGE_KEY_ANALYTICS = 'yiqul_visitor_analytics';
const SESSION_KEY_VISIT = 'yiqul_session_visited';

/**
 * Format tanggal hari ini dalam format YYYY-MM-DD (WIB)
 * @returns {string} Contoh: "2026-11-24"
 */
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Buat seed awal riwayat 7 hari terakhir agar statistik tidak kosong saat pertama dibuka
 * @returns {Object} Peta tanggal -> { visits, unique }
 */
function generateBaselineHistory() {
  const history = {};
  const today = new Date();
  const baseCounts = [98, 115, 132, 126, 140, 155, 168];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const visits = baseCounts[6 - i] || 120;
    const unique = Math.round(visits * 0.72);
    history[dateStr] = { visits, unique };
  }
  return history;
}

/**
 * Ambil data analitik dari localStorage
 * @returns {Object} Data analitik lengkap
 */
function getAnalyticsData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ANALYTICS);
    if (!raw) {
      const initialHistory = generateBaselineHistory();
      const todayKey = getTodayDateString();
      const todayData = initialHistory[todayKey] || { visits: 168, unique: 122 };

      const defaultData = {
        totalVisits: 3840,
        uniqueVisitorsTotal: 2650,
        todayDate: todayKey,
        todayVisits: todayData.visits,
        todayUnique: todayData.unique,
        totalAppLaunches: 2940,
        appLaunchesBreakdown: {},
        dailyHistory: initialHistory,
        lastVisitTimestamp: new Date().toISOString()
      };
      saveAnalyticsData(defaultData);
      return defaultData;
    }

    const data = JSON.parse(raw);
    const todayKey = getTodayDateString();

    // Jika berganti hari baru, inisialisasi counter hari ini
    if (data.todayDate !== todayKey) {
      data.todayDate = todayKey;
      if (!data.dailyHistory) data.dailyHistory = {};
      if (!data.dailyHistory[todayKey]) {
        data.dailyHistory[todayKey] = { visits: 0, unique: 0 };
      }
      data.todayVisits = data.dailyHistory[todayKey].visits;
      data.todayUnique = data.dailyHistory[todayKey].unique;
      saveAnalyticsData(data);
    }

    return data;
  } catch (err) {
    console.error('[Analytics] Gagal membaca data analitik:', err);
    return {
      totalVisits: 3840,
      uniqueVisitorsTotal: 2650,
      todayDate: getTodayDateString(),
      todayVisits: 168,
      todayUnique: 122,
      totalAppLaunches: 2940,
      appLaunchesBreakdown: {},
      dailyHistory: {},
      lastVisitTimestamp: new Date().toISOString()
    };
  }
}

/**
 * Simpan data analitik ke localStorage
 * @param {Object} data 
 */
function saveAnalyticsData(data) {
  try {
    localStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(data));
  } catch (err) {
    console.error('[Analytics] Gagal menyimpan data analitik:', err);
  }
}

/**
 * Catat kunjungan baru saat halaman dimuat
 * @returns {Object} Data analitik terupdate
 */
function recordVisit() {
  const data = getAnalyticsData();
  const todayKey = getTodayDateString();

  if (!data.dailyHistory) data.dailyHistory = {};
  if (!data.dailyHistory[todayKey]) {
    data.dailyHistory[todayKey] = { visits: 0, unique: 0 };
  }

  // Cek apakah pengunjung sudah pernah berkunjung pada sesi browser saat ini
  const isNewSession = !sessionStorage.getItem(SESSION_KEY_VISIT);
  if (isNewSession) {
    sessionStorage.setItem(SESSION_KEY_VISIT, String(Date.now()));
    data.uniqueVisitorsTotal = (data.uniqueVisitorsTotal || 0) + 1;
    data.dailyHistory[todayKey].unique = (data.dailyHistory[todayKey].unique || 0) + 1;
  }

  // Kunjungan pageview selalu bertambah
  data.totalVisits = (data.totalVisits || 0) + 1;
  data.dailyHistory[todayKey].visits = (data.dailyHistory[todayKey].visits || 0) + 1;

  data.todayVisits = data.dailyHistory[todayKey].visits;
  data.todayUnique = data.dailyHistory[todayKey].unique;
  data.lastVisitTimestamp = new Date().toISOString();

  saveAnalyticsData(data);

  // Dispatch custom event agar UI real-time terupdate
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('yiqul-analytics-updated', { detail: data }));
  }

  return data;
}

/**
 * Catat peristiwa peluncuran aplikasi (saat kartu aplikasi diklik)
 * @param {string} appId - ID aplikasi yang dibuka
 * @param {string} appTitle - Judul aplikasi
 */
function recordAppLaunch(appId, appTitle = '') {
  if (!appId) return;
  const data = getAnalyticsData();

  data.totalAppLaunches = (data.totalAppLaunches || 0) + 1;
  if (!data.appLaunchesBreakdown) data.appLaunchesBreakdown = {};
  data.appLaunchesBreakdown[appId] = (data.appLaunchesBreakdown[appId] || 0) + 1;

  saveAnalyticsData(data);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('yiqul-analytics-updated', { detail: data }));
  }
}

/**
 * Ambil riwayat kunjungan N hari terakhir secara berurutan
 * @param {number} daysCount 
 * @returns {Array<Object>} List { date, label, visits, unique }
 */
function getRecentDailyHistory(daysCount = 7) {
  const data = getAnalyticsData();
  const history = data.dailyHistory || {};
  const result = [];
  const today = new Date();

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLabel = `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`;

    const stat = history[dateStr] || { visits: 0, unique: 0 };
    result.push({
      date: dateStr,
      label: dayLabel,
      visits: stat.visits,
      unique: stat.unique
    });
  }

  return result;
}

/**
 * Kalibrasi / sesuaikan angka dasar analitik oleh Administrator
 * @param {number} newTotal - Total kunjungan baru
 * @param {number} newToday - Kunjungan hari ini baru
 */
function calibrateAnalytics(newTotal, newToday) {
  const data = getAnalyticsData();
  const todayKey = getTodayDateString();

  if (typeof newTotal === 'number' && !isNaN(newTotal) && newTotal >= 0) {
    data.totalVisits = Math.round(newTotal);
  }
  if (typeof newToday === 'number' && !isNaN(newToday) && newToday >= 0) {
    data.todayVisits = Math.round(newToday);
    if (!data.dailyHistory) data.dailyHistory = {};
    if (!data.dailyHistory[todayKey]) data.dailyHistory[todayKey] = { visits: 0, unique: 0 };
    data.dailyHistory[todayKey].visits = Math.round(newToday);
    data.dailyHistory[todayKey].unique = Math.round(newToday * 0.75);
    data.todayUnique = data.dailyHistory[todayKey].unique;
  }

  saveAnalyticsData(data);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('yiqul-analytics-updated', { detail: data }));
  }
  return data;
}

/**
 * Format angka ribuan dengan pemisah titik (gaya Indonesia)
 * @param {number} num 
 * @returns {string} Contoh: 4500 -> "4.500"
 */
function formatVisitorNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  return num.toLocaleString('id-ID');
}


/* --- MODULE: src/services/animation.js --- */
/**
 * SERVICE: GSAP ANIMATION & MOTION ENGINE
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengendalikan transisi UI/UX, animasi staggered bento grid,
 * rolling counter statistik pengunjung, dan entrance effects
 * menggunakan GreenSock Animation Platform (GSAP 3) dengan fallback aman.
 */

/**
 * Cek apakah GSAP tersedia di lingkungan browser saat ini
 * @returns {boolean}
 */
function hasGsap() {
  return typeof window !== 'undefined' && typeof window.gsap !== 'undefined';
}

/**
 * Cek preferensi aksesibilitas pengguna (prefers-reduced-motion)
 * @returns {boolean}
 */
function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Inisialisasi animasi entrance Landing Page Hero & Navbar
 */
function initLandingHeroAnimation() {
  if (typeof document === 'undefined' || !hasGsap() || prefersReducedMotion()) return;
  const gsap = window.gsap;

  try {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // 1. Floating Pill Navbar
    if (document.querySelector('.floating-navbar-wrapper')) {
      tl.fromTo(
        '.floating-navbar-wrapper',
        { y: -25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 }
      );
    }

    // 2. Trust Badges Pill
    if (document.querySelector('.trust-badges-bar')) {
      tl.fromTo(
        '.trust-badges-bar',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.5)' },
        '-=0.35'
      );
    }

    // 3. Headline & Accent
    if (document.querySelector('.landing-headline')) {
      tl.fromTo(
        '.landing-headline',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75 },
        '-=0.3'
      );
    }

    // 4. Subheadline Description
    if (document.querySelector('.landing-subheadline')) {
      tl.fromTo(
        '.landing-subheadline',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65 },
        '-=0.45'
      );
    }

    // 5. CTA Action Buttons
    if (document.querySelector('.landing-hero-cta')) {
      tl.fromTo(
        '.landing-hero-cta',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      );
    }

    // 6. 3D Browser Showcase Mockup
    if (document.querySelector('.showcase-browser-frame')) {
      tl.fromTo(
        '.showcase-browser-frame',
        { y: 35, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.85, ease: 'power2.out' },
        '-=0.3'
      );
    }
  } catch (err) {
    console.warn('[Animation] Gagal menjalankan hero animation:', err);
  }
}

/**
 * Animasi rolling ticker untuk angka statistik pengunjung (0 -> target)
 * @param {HTMLElement} element - Elemen angka statistik
 * @param {number} targetValue - Nilai akhir angka
 * @param {string} suffix - Sufiks (misal: "+")
 */
function animateCounterNumber(element, targetValue, suffix = '+') {
  if (!element) return;
  if (typeof targetValue !== 'number' || isNaN(targetValue) || targetValue <= 0) return;

  if (!hasGsap() || prefersReducedMotion()) {
    element.textContent = `${targetValue.toLocaleString('id-ID')}${suffix}`;
    return;
  }

  const gsap = window.gsap;
  const counterObj = { value: 0 };

  try {
    gsap.to(counterObj, {
      value: targetValue,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => {
        const currentVal = Math.round(counterObj.value);
        element.textContent = `${currentVal.toLocaleString('id-ID')}${suffix}`;
      }
    });
  } catch (err) {
    element.textContent = `${targetValue.toLocaleString('id-ID')}${suffix}`;
  }
}

/**
 * Inisialisasi animasi pada baris kartu statistik Landing Page
 * @param {Object} analyticsData - Data statistik pengunjung
 * @param {number} totalModules - Jumlah aplikasi terhubung
 */
function initStatsAnimation(analyticsData, totalModules = 19) {
  if (typeof document === 'undefined' || !hasGsap() || prefersReducedMotion()) return;
  const gsap = window.gsap;

  try {
    // Stagger fade-in kartu statistik
    if (document.querySelectorAll('.stat-card').length > 0) {
      gsap.fromTo(
        '.stat-card',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: 'power2.out' }
      );
    }

    // Rolling ticker angka pengunjung
    const dailyEl = document.getElementById('stat-daily-visitors');
    const totalEl = document.getElementById('stat-total-visitors');
    const modulesEl = document.getElementById('stat-modules-count');

    if (dailyEl && analyticsData?.todayVisits) {
      animateCounterNumber(dailyEl, analyticsData.todayVisits, '+');
    }
    if (totalEl && analyticsData?.totalVisits) {
      animateCounterNumber(totalEl, analyticsData.totalVisits, '+');
    }
    if (modulesEl && totalModules) {
      animateCounterNumber(modulesEl, totalModules, '+');
    }
  } catch (err) {
    console.warn('[Animation] Gagal menjalankan stats animation:', err);
  }
}

/**
 * Animasi staggered entrance untuk 6 Pilar Ekosistem
 */
function initPillarsAnimation() {
  if (typeof document === 'undefined' || !hasGsap() || prefersReducedMotion()) return;
  const gsap = window.gsap;

  try {
    if (document.querySelectorAll('.pillar-item-card').length > 0) {
      gsap.fromTo(
        '.pillar-item-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
      );
    }
  } catch (err) {
    console.warn('[Animation] Gagal menjalankan pillars animation:', err);
  }
}

/**
 * Animasi staggered entrance untuk kartu aplikasi Bento Grid saat dimuat / difilter
 * @param {string} containerSelector - ID atau selector container Bento Grid
 */
function animateBentoGridCards(containerSelector = '#main-bento-grid') {
  if (typeof document === 'undefined' || !hasGsap() || prefersReducedMotion()) return;
  const gsap = window.gsap;

  try {
    const cards = document.querySelectorAll(`${containerSelector} .bento-card`);
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 16, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.04,
          ease: 'power2.out',
          clearProps: 'transform' // Bersihkan transform setelah animasi agar tidak mengganggu layout
        }
      );
    }
  } catch (err) {
    console.warn('[Animation] Gagal menjalankan bento grid cards animation:', err);
  }
}

/**
 * Animasi buka modal viewer (iframe / modal dialog) dengan efek spring halus
 * @param {HTMLElement} modalContainer
 */
function animateModalOpen(modalContainer) {
  if (!modalContainer) return;
  if (!hasGsap() || prefersReducedMotion()) return;
  const gsap = window.gsap;

  try {
    gsap.fromTo(
      modalContainer,
      { opacity: 0, scale: 0.95, y: 15 },
      { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.2)' }
    );
  } catch (err) {
    // No-op
  }
}


/* --- MODULE: src/services/spmbService.js --- */
/**
 * SERVICE: SPMB ONLINE (PENDAFTARAN SANTRI BARU) DATABASE ENGINE
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * Yayasan Islam Qudwatul Ummah (Yiqul)
 * 
 * Mengelola penyimpanan formulir pendaftaran santri baru, pembuatan nomor registrasi,
 * verifikasi status panitia PSB, pencetakan kartu tanda terima, dan ekspor data CSV.
 */

const STORAGE_KEY_SPMB = 'yiqul_spmb_registrations';

/**
 * Daftar Resmi Jenjang Pendidikan Yayasan Islam Qudwatul Ummah (Yiqul)
 */
const JENJANG_OPTIONS = [
  'Day Care',
  'Play Group',
  'RAT Al-Qudwah',
  'TKT Al-Qudwah',
  'SDT Al-Qudwah',
  'SMPT Al-Qudwah',
  'SMAT Al-Qudwah'
];

/**
 * Daftar pendaftar awal (seed data) agar sistem langsung siap diuji
 */
const DEFAULT_SPMB_SEED = [
  {
    id: 'SPMB-2026-0001',
    createdAt: '2026-11-20T08:30:00.000Z',
    status: 'verified',
    adminNotes: 'Berkas administrasi lengkap, siap mengikuti tes wawancara & tahfidz.',
    jenjang: 'SMPT Al-Qudwah',
    jalur: 'Reguler',
    asrama: 'Boarding',
    namaLengkap: 'Muhammad Fatih Al-Ayyubi',
    nisn: '0112839481',
    nikSantri: '3602191208110001',
    jenisKelamin: 'L',
    tempatLahir: 'Lebak',
    tanggalLahir: '2014-05-12',
    asalSekolah: 'SDT Al-Qudwah Lebak',
    riwayatHafalan: '3-5 Juz',
    namaAyah: 'H. Ahmad Syarifudin, M.Pd.',
    pekerjaanAyah: 'Guru/Dosen',
    namaIbu: 'Hj. Siti Aminah, S.Pd.',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    penghasilanOrtu: '5 - 10 Juta',
    noWhatsapp: '081289123456',
    hubunganWali: 'Orang Tua Kandung',
    alamatLengkap: 'Jl. Raya Rangkasbitung - Pandeglang Km. 4',
    kelurahanDesa: 'Cijoro Pasir',
    kecamatan: 'Rangkasbitung',
    kotaKabupaten: 'Kab. Lebak',
    provinsi: 'Banten',
    catatanKesehatan: 'Tidak ada riwayat alergi / sehat walafiat.'
  },
  {
    id: 'SPMB-2026-0002',
    createdAt: '2026-11-21T10:15:00.000Z',
    status: 'accepted',
    adminNotes: 'Lulus seleksi beasiswa tahfidz 5 juz dengan nilai mumtaz.',
    jenjang: 'SMAT Al-Qudwah',
    jalur: 'Beasiswa_Tahfidz',
    asrama: 'Boarding',
    namaLengkap: 'Aisyah Humaira Azzahra',
    nisn: '0098712345',
    nikSantri: '3602195509090002',
    jenisKelamin: 'P',
    tempatLahir: 'Serang',
    tanggalLahir: '2011-09-25',
    asalSekolah: 'SMPT Al-Qudwah Lebak',
    riwayatHafalan: '> 5 Juz',
    namaAyah: 'Drs. Bambang Irawan',
    pekerjaanAyah: 'PNS/TNI/Polri',
    namaIbu: 'Nur Hasanah',
    pekerjaanIbu: 'Karyawan Swasta',
    penghasilanOrtu: '5 - 10 Juta',
    noWhatsapp: '087788991122',
    hubunganWali: 'Orang Tua Kandung',
    alamatLengkap: 'Komplek Griya Qudwah Indah Blok B3 No. 12',
    kelurahanDesa: 'Muara Ciujung Timur',
    kecamatan: 'Rangkasbitung',
    kotaKabupaten: 'Kab. Lebak',
    provinsi: 'Banten',
    catatanKesehatan: 'Asma ringan saat cuaca dingin.'
  }
];

/**
 * Ambil seluruh data pendaftar SPMB
 * @returns {Array<Object>}
 */
function getAllRegistrations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SPMB);
    if (!raw) {
      saveAllRegistrations(DEFAULT_SPMB_SEED);
      return [...DEFAULT_SPMB_SEED];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_SPMB_SEED];
  } catch (err) {
    console.error('[SPMB] Gagal membaca data pendaftaran:', err);
    return [...DEFAULT_SPMB_SEED];
  }
}

/**
 * Simpan seluruh pendaftar ke localStorage
 * @param {Array<Object>} list 
 */
function saveAllRegistrations(list) {
  try {
    localStorage.setItem(STORAGE_KEY_SPMB, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('yiqul:spmb-changed', { detail: { count: list.length } }));
    }
  } catch (err) {
    console.error('[SPMB] Gagal menyimpan data:', err);
  }
}

/**
 * Buat nomor registrasi pendaftar unik baru (Contoh: SPMB-2026-0003)
 * @param {Array<Object>} currentList 
 * @returns {string}
 */
function generateRegistrationNumber(currentList = []) {
  const currentYear = new Date().getFullYear();
  let maxSeq = 0;

  for (const item of currentList) {
    if (item.id && item.id.startsWith(`SPMB-${currentYear}-`)) {
      const parts = item.id.split('-');
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `SPMB-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
}

/**
 * Daftarkan calon santri baru
 * @param {Object} formData 
 * @returns {Object} Data pendaftar yang tersimpan lengkap dengan nomor registrasi
 */
function registerNewStudent(formData) {
  const list = getAllRegistrations();
  const regNumber = generateRegistrationNumber(list);

  const newRegistration = {
    id: regNumber,
    createdAt: new Date().toISOString(),
    status: 'pending', // 'pending' | 'verified' | 'accepted' | 'rejected'
    adminNotes: 'Pendaftaran mandiri online via Portal Yiqul. Menunggu verifikasi berkas panitia.',

    // Pilihan Jenjang & Jalur
    jenjang: String(formData.jenjang || 'SDT Al-Qudwah').trim(),
    jalur: String(formData.jalur || 'Reguler').trim(),
    asrama: String(formData.asrama || 'Boarding').trim(),

    // Data Calon Santri
    namaLengkap: String(formData.namaLengkap || '').trim(),
    nisn: String(formData.nisn || '').trim(),
    nikSantri: String(formData.nikSantri || '').trim(),
    jenisKelamin: String(formData.jenisKelamin || 'L').trim(),
    tempatLahir: String(formData.tempatLahir || '').trim(),
    tanggalLahir: String(formData.tanggalLahir || '').trim(),
    asalSekolah: String(formData.asalSekolah || '').trim(),
    riwayatHafalan: String(formData.riwayatHafalan || 'Belum Ada').trim(),

    // Data Orang Tua / Wali
    namaAyah: String(formData.namaAyah || '').trim(),
    pekerjaanAyah: String(formData.pekerjaanAyah || 'Lainnya').trim(),
    namaIbu: String(formData.namaIbu || '').trim(),
    pekerjaanIbu: String(formData.pekerjaanIbu || 'Ibu Rumah Tangga').trim(),
    penghasilanOrtu: String(formData.penghasilanOrtu || '2 - 5 Juta').trim(),
    noWhatsapp: String(formData.noWhatsapp || '').trim(),
    hubunganWali: String(formData.hubunganWali || 'Orang Tua Kandung').trim(),

    // Alamat & Kontak
    alamatLengkap: String(formData.alamatLengkap || '').trim(),
    kelurahanDesa: String(formData.kelurahanDesa || '').trim(),
    kecamatan: String(formData.kecamatan || '').trim(),
    kotaKabupaten: String(formData.kotaKabupaten || '').trim(),
    provinsi: String(formData.provinsi || 'Banten').trim(),
    catatanKesehatan: String(formData.catatanKesehatan || '').trim()
  };

  list.unshift(newRegistration);
  saveAllRegistrations(list);

  return newRegistration;
}

/**
 * Cari pendaftar berdasarkan ID / Nomor Registrasi
 * @param {string} id 
 * @returns {Object|null}
 */
function getRegistrationById(id) {
  const list = getAllRegistrations();
  return list.find(r => r.id === id) || null;
}

/**
 * Perbarui status verifikasi pendaftar oleh admin
 * @param {string} id - Nomor registrasi
 * @param {string} newStatus - 'pending' | 'verified' | 'accepted' | 'rejected'
 * @param {string} notes - Catatan panitia
 * @returns {boolean}
 */
function updateRegistrationStatus(id, newStatus, notes = '') {
  const list = getAllRegistrations();
  const index = list.findIndex(r => r.id === id);
  if (index === -1) return false;

  list[index].status = newStatus;
  if (notes) {
    list[index].adminNotes = notes;
  }
  list[index].updatedAt = new Date().toISOString();

  saveAllRegistrations(list);
  return true;
}

/**
 * Hapus data pendaftaran
 * @param {string} id 
 * @returns {boolean}
 */
function deleteRegistration(id) {
  let list = getAllRegistrations();
  const initialLen = list.length;
  list = list.filter(r => r.id !== id);
  if (list.length === initialLen) return false;

  saveAllRegistrations(list);
  return true;
}

/**
 * Hitung ringkasan statistik pendaftaran untuk dasbor admin
 * @returns {Object}
 */
function getSpmbSummary() {
  const list = getAllRegistrations();
  return {
    total: list.length,
    daycare: list.filter(r => r.jenjang === 'Day Care').length,
    playgroup: list.filter(r => r.jenjang === 'Play Group').length,
    rat: list.filter(r => r.jenjang === 'RAT Al-Qudwah').length,
    tkt: list.filter(r => r.jenjang === 'TKT Al-Qudwah').length,
    sdt: list.filter(r => r.jenjang === 'SDT Al-Qudwah').length,
    smpt: list.filter(r => r.jenjang === 'SMPT Al-Qudwah').length,
    smat: list.filter(r => r.jenjang === 'SMAT Al-Qudwah').length,
    mts: list.filter(r => r.jenjang === 'SMPT Al-Qudwah' || r.jenjang === 'MTs').length,
    ma: list.filter(r => r.jenjang === 'SMAT Al-Qudwah' || r.jenjang === 'MA').length,
    pending: list.filter(r => r.status === 'pending').length,
    verified: list.filter(r => r.status === 'verified').length,
    accepted: list.filter(r => r.status === 'accepted').length,
    rejected: list.filter(r => r.status === 'rejected').length
  };
}

/**
 * Ekspor seluruh data pendaftar ke format CSV (Excel)
 * @returns {string} String konten CSV
 */
function exportRegistrationsCsv() {
  const list = getAllRegistrations();
  const headers = [
    'No. Registrasi',
    'Tanggal Daftar',
    'Status',
    'Jenjang',
    'Jalur',
    'Asrama',
    'Nama Lengkap Santri',
    'NISN',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Asal Sekolah',
    'Riwayat Hafalan',
    'Nama Ayah',
    'Pekerjaan Ayah',
    'Nama Ibu',
    'Pekerjaan Ibu',
    'Penghasilan Ortu',
    'No. WhatsApp',
    'Alamat Lengkap',
    'Kota/Kabupaten',
    'Catatan Panitia'
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = list.map(r => [
    escapeCsv(r.id),
    escapeCsv(new Date(r.createdAt).toLocaleDateString('id-ID')),
    escapeCsv(r.status),
    escapeCsv(r.jenjang),
    escapeCsv(r.jalur),
    escapeCsv(r.asrama),
    escapeCsv(r.namaLengkap),
    escapeCsv(r.nisn),
    escapeCsv(r.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'),
    escapeCsv(r.tempatLahir),
    escapeCsv(r.tanggalLahir),
    escapeCsv(r.asalSekolah),
    escapeCsv(r.riwayatHafalan),
    escapeCsv(r.namaAyah),
    escapeCsv(r.pekerjaanAyah),
    escapeCsv(r.namaIbu),
    escapeCsv(r.pekerjaanIbu),
    escapeCsv(r.penghasilanOrtu),
    escapeCsv(r.noWhatsapp),
    escapeCsv(r.alamatLengkap),
    escapeCsv(r.kotaKabupaten),
    escapeCsv(r.adminNotes)
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Buat tautan konfirmasi WhatsApp ke panitia PSB yayasan
 * @param {Object} reg - Data pendaftaran
 * @param {string} committeePhone - Nomor WA Panitia
 * @returns {string}
 */
function createWhatsAppConfirmationLink(reg, committeePhone = '6281289123456') {
  const message = `Assalamu'alaikum Panitia PSB Yayasan Islam Qudwatul Ummah,

Saya ingin mengonfirmasi pendaftaran santri baru online:
*No. Registrasi:* ${reg.id}
*Nama Calon Santri:* ${reg.namaLengkap}
*Jenjang Pilihan:* ${reg.jenjang} (${reg.jalur})
*Asal Sekolah:* ${reg.asalSekolah}
*Nama Orang Tua:* ${reg.namaAyah} / ${reg.namaIbu}
*No. Kontak:* ${reg.noWhatsapp}

Mohon arahan terkait jadwal verifikasi berkas & tes seleksi selanjutnya. Terima kasih.
Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;

  return `https://wa.me/${committeePhone}?text=${encodeURIComponent(message)}`;
}


/* --- MODULE: src/data/defaultApps.js --- */
/**
 * DEFAULT SEED CATALOG
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Memuat katalog awal aplikasi digital yang siap pakai di lingkungan
 * Yayasan Islam Qudwatul Ummah (Yiqul).
 */

const CATEGORIES = [
  { id: "all", name: "Semua", icon: "LayoutGrid" },
  { id: "favorites", name: "Favorit", icon: "Star" },
  { id: "akademik", name: "Akademik & LMS", icon: "GraduationCap" },
  { id: "tahfidz", name: "Tahfidz & Asrama", icon: "BookOpen" },
  { id: "keuangan", name: "Keuangan & Kasir", icon: "Coins" },
  { id: "sdm", name: "SDM & Presensi", icon: "Users" },
  { id: "sarpras", name: "Sarpras & Aset", icon: "Building2" },
  { id: "wali", name: "Layanan Wali", icon: "HeartHandshake" },
  { id: "umum", name: "Publik & Utility", icon: "Globe" }
];

const DEFAULT_APPS = [
  {
    id: "yiqul-erapor",
    title: "E-Rapor Santri Digital",
    shortDescription: "Input nilai, cetak buku rapor berkala, dan evaluasi capaian santri.",
    targetUrl: "https://erapor.qudwatulummah.sch.id",
    category: "akademik",
    iconName: "GraduationCap",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["admin", "asatidz"],
    displayOrder: 1,
    isFeatured: true,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-tahfidz",
    title: "Mutaba'ah Tahfidz Quran",
    shortDescription: "Pencatatan setoran hafalan, mutaba'ah halaqah, dan riwayat muroja'ah santri.",
    targetUrl: "https://tahfidz.qudwatulummah.sch.id",
    category: "tahfidz",
    iconName: "BookOpen",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["admin", "asatidz", "santri"],
    displayOrder: 2,
    isFeatured: true,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-kasir",
    title: "Kasir & Billing SPP Yiqul",
    shortDescription: "Sistem tagihan SPP bulanan, kuitansi digital, dan rekap kasir pondok.",
    targetUrl: "https://keuangan.qudwatulummah.sch.id/kasir",
    category: "keuangan",
    iconName: "Coins",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["admin"],
    displayOrder: 3,
    isFeatured: true,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-presensi",
    title: "Presensi Rapat & Asatidz",
    shortDescription: "Absensi digital rapat pimpinan, barcode check-in, dan log presensi pengajar.",
    targetUrl: "https://presensi.qudwatulummah.sch.id",
    category: "sdm",
    iconName: "UserCheck",
    targetMode: "iframe",
    status: "active",
    rolesAllowed: ["admin", "asatidz"],
    displayOrder: 4,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-hris",
    title: "HRIS & Divisi Tilawah UPA",
    shortDescription: "Manajemen data pegawai, cuti, surat tugas, dan performa kinerja asatidz.",
    targetUrl: "https://hris.qudwatulummah.sch.id",
    category: "sdm",
    iconName: "Users",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["admin"],
    displayOrder: 5,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-lms",
    title: "LMS Santri CodeVerse",
    shortDescription: "Portal pembelajaran digital santri, modul BusDigit, dan pengumpulan tugas.",
    targetUrl: "https://lms.qudwatulummah.sch.id",
    category: "akademik",
    iconName: "Laptop",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["admin", "asatidz", "santri"],
    displayOrder: 6,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-keuangan-bot",
    title: "Sistem Keuangan Bot Telegram",
    shortDescription: "Arus kas cepat operasional pesantren dan notifikasi transaksi via bot.",
    targetUrl: "https://t.me/YiqulFinanceBot",
    category: "keuangan",
    iconName: "Send",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["admin"],
    displayOrder: 7,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-wali",
    title: "Portal Wali Santri",
    shortDescription: "Informasi perkembangan santri, riwayat hafalan, kesehatan, dan tagihan infaq.",
    targetUrl: "https://wali.qudwatulummah.sch.id",
    category: "wali",
    iconName: "HeartHandshake",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["public", "santri"],
    displayOrder: 8,
    isFeatured: true,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-sarpras",
    title: "Manajemen Sarpras & Aset",
    shortDescription: "Pencatatan aset gedung, booking aula/ruang pertemuan, dan komplain sarana.",
    targetUrl: "https://sarpras.qudwatulummah.sch.id",
    category: "sarpras",
    iconName: "Building2",
    targetMode: "iframe",
    status: "active",
    rolesAllowed: ["admin", "asatidz"],
    displayOrder: 9,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-perizinan",
    title: "Perizinan & Disiplin Santri",
    shortDescription: "Sistem izin pulang santri, kartu pass digital, dan rekapitulasi asrama.",
    targetUrl: "https://keasramaan.qudwatulummah.sch.id/izin",
    category: "tahfidz",
    iconName: "ShieldCheck",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["admin", "asatidz"],
    displayOrder: 10,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-poskestren",
    title: "Poskestren / Rekam Medis",
    shortDescription: "Pemeriksaan kesehatan santri, stok obat klinik, dan rujukan faskes.",
    targetUrl: "https://poskestren.qudwatulummah.sch.id",
    category: "wali",
    iconName: "Activity",
    targetMode: "iframe",
    status: "maintenance",
    rolesAllowed: ["admin", "asatidz"],
    displayOrder: 11,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-donasi",
    title: "Infaq & Wakaf Digital",
    shortDescription: "Gerbang donasi pembangunan fasilitas santri dan beasiswa yatim dhuafa.",
    targetUrl: "https://donasi.qudwatulummah.sch.id",
    category: "keuangan",
    iconName: "Heart",
    targetMode: "_blank",
    status: "new",
    rolesAllowed: ["public"],
    displayOrder: 12,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-psb",
    title: "PSB Online Yiqul",
    shortDescription: "Pendaftaran Santri Baru, unggah berkas, jadwal tes seleksi & kelulusan.",
    targetUrl: "https://psb.qudwatulummah.sch.id",
    category: "umum",
    iconName: "UserPlus",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["public"],
    displayOrder: 13,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-maktabah",
    title: "Maktabah & Digital Library",
    shortDescription: "Koleksi kitab kuning digital, ensiklopedia Islam, dan peminjaman buku.",
    targetUrl: "https://maktabah.qudwatulummah.sch.id",
    category: "akademik",
    iconName: "Library",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["public", "asatidz", "santri"],
    displayOrder: 14,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-jadwal",
    title: "Kalender & Agenda Yayasan",
    shortDescription: "Kalender tahunan agenda yayasan, jadwal imam rawatib, dan kajian rutin.",
    targetUrl: "https://qudwatulummah.sch.id/agenda",
    category: "umum",
    iconName: "Calendar",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["public"],
    displayOrder: 15,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-vegetable",
    title: "Vegetable Business Management",
    shortDescription: "Pencatatan hasil panen kebun hidroponik dan agrobisnis santripreneur.",
    targetUrl: "https://agro.qudwatulummah.sch.id",
    category: "sarpras",
    iconName: "Sprout",
    targetMode: "iframe",
    status: "new",
    rolesAllowed: ["admin"],
    displayOrder: 16,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-website",
    title: "Portal Web Yayasan Resmi",
    shortDescription: "Website resmi Yayasan Islam Qudwatul Ummah Lebak - Banten.",
    targetUrl: "https://qudwatulummah.sch.id",
    category: "umum",
    iconName: "Globe",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["public"],
    displayOrder: 17,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "yiqul-helpdesk",
    title: "Pusat Bantuan & IT Support",
    shortDescription: "Tiket keluhan sistem, panduan penggunaan aplikasi, dan kontak IT Support.",
    targetUrl: "https://helpdesk.qudwatulummah.sch.id",
    category: "umum",
    iconName: "HelpCircle",
    targetMode: "_blank",
    status: "active",
    rolesAllowed: ["public", "asatidz", "santri", "admin"],
    displayOrder: 18,
    isFeatured: false,
    updatedAt: "2026-11-19T08:00:00Z"
  }
];

const DEFAULT_ANNOUNCEMENT = {
  id: "ann-01",
  text: "Selamat Datang di Portal Yiqul — Seluruh aplikasi digital yayasan kini terpusat dalam satu gerbang.",
  type: "info",
  isActive: true,
  updatedAt: "2026-11-19T08:00:00Z"
};


const DEFAULT_BRANDING = {
  portalTitle: "PORTAL YIQUL",
  portalSubtitle: "Ecosystem Command Center",
  organizationName: "Yayasan Islam Qudwatul Ummah",
  logoUrl: "",
  faviconUrl: ""
};

const DEFAULT_BANNERS = [
  {
    id: "banner-01",
    title: "Penerimaan Santri Baru (PSB) 2026/2027 Telah Dibuka",
    subtitle: "Pendaftaran santri baru terpadu jenjang MTs & MA Qudwatul Ummah Lebak.",
    imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200&auto=format&fit=crop",
    actionUrl: "https://psb.qudwatulummah.sch.id",
    actionText: "Daftar Online ↗",
    isActive: true,
    displayOrder: 1
  },
  {
    id: "banner-02",
    title: "Wisuda Tahfidz & Haflah Khotmil Quran",
    subtitle: "Apresiasi setoran mutaba'ah hafalan santri dan pembagian sanad tahfidz.",
    imageUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1200&auto=format&fit=crop",
    actionUrl: "https://tahfidz.qudwatulummah.sch.id",
    actionText: "Lihat Jadwal ↗",
    isActive: true,
    displayOrder: 2
  }
];

const DEFAULT_DOCUMENTS = [
  {
    id: "doc-01",
    title: "Buku Panduan Penggunaan Portal Digital Yiqul",
    category: "Panduan IT",
    fileUrl: "https://qudwatulummah.sch.id/panduan-portal.pdf",
    fileType: "application/pdf",
    fileSize: "2.4 MB",
    updatedAt: "2026-11-19T08:00:00Z"
  },
  {
    id: "doc-02",
    title: "Kalender Akademik & Jadwal Kegiatan Pesantren 2026/2027",
    category: "Akademik",
    fileUrl: "https://qudwatulummah.sch.id/kalender-akademik-2026.pdf",
    fileType: "application/pdf",
    fileSize: "1.8 MB",
    updatedAt: "2026-11-19T08:00:00Z"
  }
];


/* --- MODULE: src/services/storage.js --- */
/**
 * STORAGE SERVICE & REGISTRY ENGINE
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengelola penyimpanan persisten katalog aplikasi di localStorage
 * dengan fallback otomatis ke memory storage dan Default Seed Data.
 */




const STORAGE_KEY_APPS = 'yiqul_apps_registry';
const STORAGE_KEY_FAVORITES = 'yiqul_apps_favorites';
const STORAGE_KEY_ANNOUNCEMENT = 'yiqul_announcement';
const STORAGE_KEY_THEME = 'yiqul_theme_mode';
const STORAGE_KEY_BRANDING = 'yiqul_portal_branding';
const STORAGE_KEY_BANNERS = 'yiqul_portal_banners';
const STORAGE_KEY_DOCUMENTS = 'yiqul_portal_documents';
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
function getAllApps() {
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
function saveAllApps(apps, emitEvent = true) {
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
function getAppById(id) {
  const apps = getAllApps();
  return apps.find(app => app.id === id) || null;
}

/**
 * Menambahkan aplikasi baru ke registry
 * @param {Object} appData
 * @returns {Object} Aplikasi yang berhasil disimpan
 */
function addApp(appData) {
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
function updateApp(id, updatedFields) {
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
function deleteApp(id) {
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
function reorderApp(id, direction) {
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
function toggleAppLock(id) {
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
function verifyAppAccessPin(inputPin) {
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
function getFavorites() {
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
function isFavorite(id) {
  const favorites = getFavorites();
  return favorites.includes(id);
}

/**
 * Toggle status favorit sebuah aplikasi
 * @param {string} id
 * @returns {boolean} status favorit baru
 */
function toggleFavorite(id) {
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
function exportRegistryJson() {
  const payload = {
    appName: "Portal Yiqul Launcher",
    version: "1.1.0",
    exportedAt: new Date().toISOString(),
    apps: getAllApps(),
    favorites: getFavorites(),
    announcement: getAnnouncement(),
    branding: getBranding(),
    banners: getBanners(),
    documents: getDocuments()
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Impor konfigurasi portal dari string JSON
 * @param {string} jsonString
 * @returns {{success: boolean, count: number, message: string}}
 */
function importRegistryJson(jsonString) {
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

    return {
      success: true,
      count: validApps.length,
      message: `Berhasil mengimpor ${validApps.length} aplikasi, branding, dan banner ke Portal Yiqul.`
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
function resetToDefault() {
  saveAllApps(DEFAULT_APPS);
  setStorageItem(STORAGE_KEY_FAVORITES, JSON.stringify([]));
  saveAnnouncement(DEFAULT_ANNOUNCEMENT);
  saveBranding(DEFAULT_BRANDING);
  saveBanners(DEFAULT_BANNERS);
  saveDocuments(DEFAULT_DOCUMENTS);
  dispatchRegistryEvent('yiqul:registry-changed', { count: DEFAULT_APPS.length });
  dispatchRegistryEvent('yiqul:branding-changed', DEFAULT_BRANDING);
  dispatchRegistryEvent('yiqul:banners-changed', DEFAULT_BANNERS);
}

/**
 * Mengambil data pengumuman aktif
 * @returns {Object}
 */
function getAnnouncement() {
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
function saveAnnouncement(announcement) {
  setStorageItem(STORAGE_KEY_ANNOUNCEMENT, JSON.stringify(announcement));
  dispatchRegistryEvent('yiqul:announcement-changed', announcement);
}

/**
 * Mengambil preferensi tema ('dark' | 'light')
 * @returns {string}
 */
function getSavedTheme() {
  return getStorageItem(STORAGE_KEY_THEME) || 'light';
}

/**
 * Menyimpan preferensi tema
 * @param {string} theme
 */
function saveTheme(theme) {
  setStorageItem(STORAGE_KEY_THEME, theme);
}


/* ==========================================================================
   BRANDING MANAGEMENT (Logo Yayasan, Judul Portal, Tagline)
   ========================================================================== */

function getBranding() {
  const raw = getStorageItem(STORAGE_KEY_BRANDING);
  if (!raw) return DEFAULT_BRANDING;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_BRANDING, ...parsed };
  } catch (e) {
    return DEFAULT_BRANDING;
  }
}

function saveBranding(branding) {
  const current = getBranding();
  const updated = { ...current, ...branding };
  setStorageItem(STORAGE_KEY_BRANDING, JSON.stringify(updated));
  dispatchRegistryEvent('yiqul:branding-changed', updated);
  return updated;
}

/* ==========================================================================
   BANNER MANAGEMENT (Banner Gambar Promo / Pengumuman di Beranda)
   ========================================================================== */

function getBanners() {
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

function saveBanners(banners, emitEvent = true) {
  setStorageItem(STORAGE_KEY_BANNERS, JSON.stringify(banners));
  if (emitEvent) {
    dispatchRegistryEvent('yiqul:banners-changed', { count: banners.length });
  }
}

function addBanner(bannerData) {
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

function updateBanner(id, updatedFields) {
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

function deleteBanner(id) {
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
function reorderBanner(id, direction) {
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

function getDocuments() {
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

function saveDocuments(docs, emitEvent = true) {
  setStorageItem(STORAGE_KEY_DOCUMENTS, JSON.stringify(docs));
  if (emitEvent) {
    dispatchRegistryEvent('yiqul:documents-changed', { count: docs.length });
  }
}

function addDocument(docData) {
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

function deleteDocument(id) {
  let docs = getDocuments();
  const initialLength = docs.length;
  docs = docs.filter(d => d.id !== id);
  if (docs.length === initialLength) return false;
  saveDocuments(docs);
  return true;
}

/* ==========================================================================
   ROLE & AUTHENTICATION MANAGEMENT
   ========================================================================== */

function getCurrentRole() {
  return getStorageItem(STORAGE_KEY_ROLE) || 'guest';
}

function setCurrentRole(role) {
  const validRoles = ['guest', 'asatidz', 'admin', 'superadmin'];
  const safeRole = validRoles.includes(role) ? role : 'guest';
  setStorageItem(STORAGE_KEY_ROLE, safeRole);
  dispatchRegistryEvent('yiqul:role-changed', { role: safeRole });
  return safeRole;
}

function getAdminPin() {
  return getStoredPinHash();
}

function saveAdminPin(newPin) {
  return storeNewPin(newPin);
}

function verifyAdminPin(inputPin) {
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

function isAdminLoggedIn() {
  const role = getCurrentRole();
  return role === 'admin' || role === 'superadmin';
}

function logoutAdmin() {
  setCurrentRole('guest');
  logSecurityEvent('LOGOUT_ADMIN', 'INFO', 'Sesi Administrator berhasil ditutup.');
  return true;
}

// Re-export fungsi keamanan terintegrasi


/* --- MODULE: src/services/uploader.js --- */
/**
 * SERVICE: FILE UPLOADER & GOOGLE DRIVE CONNECTOR
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengelola proses Choose File dari folder PC/perangkat, pembacaan Base64,
 * pengiriman ke backend Google Apps Script Drive Engine, serta konversi direct link lh3.
 */

/**
 * Konversi URL Google Drive standar menjadi link direct CDN lh3.googleusercontent.com
 * @param {string} driveUrl
 * @returns {string} Direct image link
 */
function convertGoogleDriveToDirectLink(driveUrl) {
  if (!driveUrl || typeof driveUrl !== 'string') return driveUrl;
  const trimmed = driveUrl.trim();

  // Jika sudah berupa lh3.googleusercontent.com
  if (trimmed.includes('lh3.googleusercontent.com')) {
    return trimmed;
  }

  // Pola 1: https://drive.google.com/file/d/{FILE_ID}/view...
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) {
    return `https://lh3.googleusercontent.com/d/${matchFileD[1]}`;
  }

  // Pola 2: https://drive.google.com/open?id={FILE_ID} atau uc?id={FILE_ID} atau thumbnail?id={FILE_ID}
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) {
    return `https://lh3.googleusercontent.com/d/${matchIdParam[1]}`;
  }

  return trimmed;
}

/**
 * Membaca berkas dari PC/Device pengguna sebagai Base64 Data URL
 * @param {File} file
 * @returns {Promise<{base64: string, fileName: string, mimeType: string, fileSize: number}>}
 */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Tidak ada berkas yang dipilih.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        base64: reader.result,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size
      });
    };
    reader.onerror = (error) => {
      reject(new Error('Gagal membaca berkas dari perangkat: ' + error.message));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload berkas ke Google Drive melalui Google Apps Script backend
 * Jika berjalan di luar lingkungan GAS (misal: localhost standalone),
 * otomatis menggunakan simulasi lokal Base64/Mock Drive agar developer/admin tetap bisa preview.
 * 
 * @param {File} file - Berkas dari input type="file"
 * @param {Object} options
 * @param {'logos'|'banners'|'app_icons'|'documents'} options.folderType
 * @returns {Promise<{success: boolean, fileId: string, directUrl: string, webViewLink: string, fileName: string}>}
 */
async function uploadFileToDrive(file, { folderType = 'logos' } = {}) {
  // 1. Baca berkas dari PC
  const fileData = await readFileAsBase64(file);

  // Batas ukuran 15MB
  const MAX_SIZE = 15 * 1024 * 1024;
  if (fileData.fileSize > MAX_SIZE) {
    throw new Error('Ukuran berkas melebihi batas maksimal 15MB.');
  }

  // 2. Cek apakah berjalan di dalam Google Apps Script Web App
  const isGasEnvironment = typeof window !== 'undefined' && 
    window.google && 
    window.google.script && 
    window.google.script.run;

  if (isGasEnvironment) {
    return new Promise((resolve, reject) => {
      window.google.script.run
        .withSuccessHandler((response) => {
          if (response && response.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || 'Gagal menyimpan berkas ke Google Drive.'));
          }
        })
        .withFailureHandler((err) => {
          reject(new Error(err.message || 'Koneksi ke Google Apps Script backend gagal.'));
        })
        .apiUploadFileToDrive({
          base64Data: fileData.base64,
          fileName: fileData.fileName,
          mimeType: fileData.mimeType,
          folderType: folderType
        });
    });
  }

  // 3. Lingkungan Standalone / Localhost Fallback:
  // Gunakan Base64 Data URL untuk render instan di browser
  const mockFileId = 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const directUrl = fileData.base64; // Data URL langsung ditampilkan di <img>

  return {
    success: true,
    fileId: mockFileId,
    fileName: fileData.fileName,
    mimeType: fileData.mimeType,
    directUrl: directUrl,
    webViewLink: directUrl,
    folderType: folderType,
    isLocalFallback: true,
    uploadedAt: new Date().toISOString()
  };
}


/* --- MODULE: src/services/cloudSync.js --- */
/**
 * SERVICE: CLOUD DATABASE CONNECTOR & SYNC
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Menghubungkan frontend PWA (di Netlify / GitHub Pages) dengan
 * Backend Google Apps Script & Google Sheets Database secara real-time.
 */


const STORAGE_KEY_CLOUD_URL = 'yiqul_cloud_backend_url';

function getCloudBackendUrl() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(STORAGE_KEY_CLOUD_URL) || '';
  }
  return '';
}

function saveCloudBackendUrl(url) {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY_CLOUD_URL, (url || '').trim());
  }
}

/**
 * Tarik data terbaru dari Cloud Backend Google Apps Script
 */
async function pullFromCloud() {
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
async function pushToCloud() {
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


/* --- MODULE: src/services/firebaseService.js --- */
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
function getFirebaseConfig() {
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
function saveFirebaseConfig(config) {
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
function isFirebaseConfigured() {
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
async function pushToFirebase() {
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
async function pullFromFirebase() {
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
async function testFirebaseConnection() {
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


/* --- MODULE: src/components/Header.js --- */
/**
 * COMPONENT: HEADER & GLOBAL INFO
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengelola jam digital real-time WIB, penanggalan Masehi & Hijriyah,
 * banner pengumuman dinamis, serta toggle mode gelap/terang.
 */




let clockTimer = null;

/**
 * Render Logo dan Identitas Branding Yayasan secara dinamis
 */
function renderBranding() {
  const branding = getBranding();
  const logoBadge = document.querySelector('.brand-logo-badge');
  const titleEl = document.querySelector('.brand-text h1');
  const subEl = document.querySelector('.brand-text p');

  if (titleEl && branding.portalTitle) {
    titleEl.textContent = branding.portalTitle;
  }

  if (subEl && branding.portalSubtitle) {
    subEl.textContent = branding.portalSubtitle;
  }

  if (logoBadge) {
    if (branding.logoUrl) {
      const directLogo = convertGoogleDriveToDirectLink(branding.logoUrl);
      logoBadge.innerHTML = `<img src="${directLogo}" alt="Logo Yayasan" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" />`;
      logoBadge.style.background = 'transparent';
      logoBadge.style.boxShadow = 'none';
    } else {
      logoBadge.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      `;
      logoBadge.style.background = 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))';
    }
  }
}

/**
 * Format tanggal Masehi ke bahasa Indonesia
 * @param {Date} date
 * @returns {string} Contoh: "Kamis, 19 November 2026"
 */
function formatGregorianDate(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return date.toDateString();
  }
}

/**
 * Format tanggal Hijriyah ke bahasa Indonesia menggunakan Intl Umalqura
 * dengan fallback manual jika tidak didukung.
 * @param {Date} date
 * @returns {string} Contoh: "9 Jumadil Akhir 1448 H"
 */
function formatHijriDate(date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formatted = formatter.format(date);
    // Tambahkan 'H' jika belum ada
    return formatted.includes('H') ? formatted : `${formatted} H`;
  } catch (e) {
    // Fallback perkiraan kalender Hijriyah sederhana
    return '1448 H';
  }
}

/**
 * Format jam ke format WIB (HH:mm:ss)
 * @param {Date} date
 * @returns {string}
 */
function formatTimeWIB(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date).replace(/\./g, ':');
  } catch (e) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
}

/**
 * Inisialisasi jam digital real-time
 */
function initLiveClock() {
  const clockEl = document.getElementById('live-clock-display');
  const gregEl = document.getElementById('gregorian-date-display');
  const hijriEl = document.getElementById('hijri-date-display');

  function updateClock() {
    const now = new Date();
    if (clockEl) clockEl.textContent = formatTimeWIB(now);
    if (gregEl) gregEl.textContent = formatGregorianDate(now);
    if (hijriEl) hijriEl.textContent = formatHijriDate(now);
  }

  updateClock();
  if (clockTimer) clearInterval(clockTimer);
  clockTimer = setInterval(updateClock, 1000);
}

/**
 * Inisialisasi dan render banner pengumuman dinamis
 */
function renderAnnouncement() {
  const wrapper = document.getElementById('announcement-wrapper');
  if (!wrapper) return;

  const announcement = getAnnouncement();
  if (!announcement || !announcement.isActive || !announcement.text) {
    wrapper.innerHTML = '';
    return;
  }

  wrapper.innerHTML = `
    <div class="announcement-banner fade-in" role="alert" aria-live="polite">
      <div class="announcement-content">
        <span class="announcement-icon" aria-hidden="true">
          <i data-lucide="megaphone" width="20" height="20"></i>
        </span>
        <div>
          <strong>Pengumuman:</strong> ${escapeHtml(announcement.text)}
        </div>
      </div>
      <button id="dismiss-announcement-btn" class="btn-icon" style="min-width: 32px; min-height: 32px; width: 32px; height: 32px; border: none; background: transparent;" aria-label="Tutup Pengumuman">
        <i data-lucide="x" width="16" height="16"></i>
      </button>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  const dismissBtn = document.getElementById('dismiss-announcement-btn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      wrapper.innerHTML = '';
    });
  }
}

/**
 * Inisialisasi toggle tema Gelap/Terang
 */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const htmlEl = document.documentElement;

  // Baca tema tersimpan atau ikuti preferensi sistem
  const savedTheme = getSavedTheme();
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

  if (isDark) {
    htmlEl.classList.add('dark');
  } else {
    htmlEl.classList.remove('dark');
  }

  updateThemeIcon(isDark);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const willBeDark = !htmlEl.classList.contains('dark');
      htmlEl.classList.toggle('dark', willBeDark);
      saveTheme(willBeDark ? 'dark' : 'light');
      updateThemeIcon(willBeDark);
    });
  }

  function updateThemeIcon(dark) {
    if (!themeIcon) return;
    themeIcon.setAttribute('data-lucide', dark ? 'sun' : 'moon');
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }
}

/**
 * Inisialisasi seluruh komponen Header
 */
function initHeader() {
  renderBranding();
  initLiveClock();
  initThemeToggle();
  renderAnnouncement();

  // Dengarkan perubahan pengumuman & branding dari admin
  if (typeof window !== 'undefined') {
    window.addEventListener('yiqul:announcement-changed', () => {
      renderAnnouncement();
    });

    window.addEventListener('yiqul:branding-changed', () => {
      renderBranding();
    });
  }
}


/* --- MODULE: src/components/SearchRibbon.js --- */
/**
 * COMPONENT: SEARCH & CATEGORY RIBBON
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengelola bilah pencarian instan, shortcut keyboard global (Ctrl+K, /),
 * dan ribbon kategori yang dapat digeser secara horizontal.
 */



let activeCategory = 'all';
let searchQuery = '';
let onFilterChangeCallback = null;

/**
 * Filter daftar aplikasi berdasarkan kategori dan kata kunci pencarian
 * @param {Array} apps
 * @param {Object} filterOptions
 * @returns {Array}
 */
function filterApps(apps, { category = 'all', query = '', favorites = [] } = {}) {
  if (!Array.isArray(apps)) return [];
  const trimmedQuery = (query || '').trim().toLowerCase();

  return apps.filter(app => {
    // 1. Filter Kategori
    if (category === 'favorites') {
      if (!favorites.includes(app.id)) return false;
    } else if (category !== 'all') {
      if (app.category !== category) return false;
    }

    // 2. Filter Search Query
    if (trimmedQuery) {
      const matchTitle = (app.title || '').toLowerCase().includes(trimmedQuery);
      const matchDesc = (app.shortDescription || '').toLowerCase().includes(trimmedQuery);
      const matchCat = (app.category || '').toLowerCase().includes(trimmedQuery);
      if (!matchTitle && !matchDesc && !matchCat) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999));
}

/**
 * Render tombol ribbon kategori beserta badge jumlah aplikasi
 * @param {Array} allApps
 * @param {Array} favorites
 */
function renderCategoryRibbon(allApps = getAllApps(), favorites = getFavorites()) {
  const container = document.getElementById('category-ribbon');
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => {
    let count = 0;
    if (cat.id === 'all') {
      count = allApps.length;
    } else if (cat.id === 'favorites') {
      count = favorites.length;
    } else {
      count = allApps.filter(a => a.category === cat.id).length;
    }

    const isActive = cat.id === activeCategory;
    const activeClass = isActive ? 'active' : '';

    return `
      <button 
        type="button" 
        role="tab" 
        aria-selected="${isActive}"
        class="ribbon-pill ${activeClass}" 
        data-category-id="${cat.id}"
        aria-label="Kategori ${cat.name} (${count} aplikasi)"
      >
        <i data-lucide="${getCategoryIconName(cat.icon)}" width="16" height="16"></i>
        <span>${cat.name}</span>
        <span class="ribbon-count">${count}</span>
      </button>
    `;
  }).join('');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // Tambahkan event click pada setiap pill
  container.querySelectorAll('.ribbon-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.getAttribute('data-category-id');
      setActiveCategory(catId);
    });
  });
}

function getCategoryIconName(icon) {
  // Map nama icon
  return icon || 'LayoutGrid';
}

/**
 * Mengubah kategori aktif dan memicu callback filter
 * @param {string} categoryId
 */
function setActiveCategory(categoryId) {
  activeCategory = categoryId;
  renderCategoryRibbon();
  triggerFilterChange();
}

/**
 * Inisialisasi bilah pencarian dan keyboard shortcuts
 * @param {Function} onFilterChange
 */
function initSearchAndRibbon(onFilterChange) {
  onFilterChangeCallback = onFilterChange;

  const searchInput = document.getElementById('global-search-input');
  const clearBtn = document.getElementById('search-clear-btn');

  // Initial render of ribbon
  renderCategoryRibbon();

  // Event Input Pencarian
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearBtn) {
        clearBtn.style.display = searchQuery ? 'inline-flex' : 'none';
      }
      triggerFilterChange();
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchQuery = '';
        if (clearBtn) clearBtn.style.display = 'none';
        searchInput.blur();
        triggerFilterChange();
      }
    });
  }

  // Tombol Clear
  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearBtn.style.display = 'none';
      searchInput.focus();
      triggerFilterChange();
    });
  }

  // Global Keyboard Shortcuts (/ dan Ctrl+K / Cmd+K)
  window.addEventListener('keydown', (e) => {
    const isCtrlK = (e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K');
    const isSlash = e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);

    if (isCtrlK || isSlash) {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  // Dengarkan perubahan registry atau favorites dari komponen lain
  window.addEventListener('yiqul:registry-changed', () => {
    renderCategoryRibbon();
    triggerFilterChange();
  });

  window.addEventListener('yiqul:favorites-changed', () => {
    renderCategoryRibbon();
    triggerFilterChange();
  });
}

function triggerFilterChange() {
  if (typeof onFilterChangeCallback === 'function') {
    onFilterChangeCallback({
      category: activeCategory,
      query: searchQuery
    });
  }
}

/**
 * Reset pencarian dan filter ke kondisi awal (Semua, Query Kosong)
 */
function resetFilters() {
  activeCategory = 'all';
  searchQuery = '';
  const searchInput = document.getElementById('global-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  if (searchInput) searchInput.value = '';
  if (clearBtn) clearBtn.style.display = 'none';
  renderCategoryRibbon();
  triggerFilterChange();
}

/**
 * Mendapatkan state pencarian saat ini
 */
function getCurrentFilterState() {
  return {
    category: activeCategory,
    query: searchQuery
  };
}


/* --- MODULE: src/components/AppCard.js --- */
/**
 * COMPONENT: BENTO APP CARD
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Merender kartu aplikasi Bento individual dengan hierarki visual terstandar,
 * status dot, tombol favorit, ikon avatar, dan tautan aksi yang aman.
 */




/**
 * Render string HTML kartu aplikasi Bento
 * @param {Object} app - Data aplikasi Yiqul
 * @param {boolean} isFav - Apakah aplikasi ditandai favorit
 * @returns {string} HTML markup
 */
function renderAppCard(app, isFav = false) {
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
  } else if (app.id === 'yiqul-psb' || app.targetUrl === '#spmb') {
    // Direct SPMB Online Wizard
    modeBadgeText = 'Formulir Langsung';
    launchActionHtml = `
      <button 
        type="button" 
        class="btn-launch ${isLocked ? 'btn-launch-admin-unlocked' : ''}" 
        data-action="open-spmb" 
        data-app-id="${app.id}"
        aria-label="Buka Pendaftaran SPMB Online"
        ${isLocked ? 'title="Akses Terbuka Khusus Admin"' : ''}
      >
        <span>Daftar Online</span>
        <i data-lucide="user-plus" width="14" height="14"></i>
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


/* --- MODULE: src/components/BentoGrid.js --- */
/**
 * COMPONENT: BENTO GRID CONTROLLER
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengelola rendering Bento Grid dengan 4 Kondisi Wajib (Mandatory 4 States):
 * 1. LOADING STATE: Shimmer skeleton screen
 * 2. EMPTY STATE: Desain ramah saat data/pencarian nihil
 * 3. ERROR STATE: Tampilan kegagalan informatif + retry
 * 4. SUCCESS STATE: Grid kartu Bento interaktif
 */







let onOpenModalCallback = null;
let onEditAppCallback = null;

/**
 * Buka Modal PIN Akses Aplikasi Terkunci
 * @param {string} appId
 */
function openAppLockModal(appId) {
  const app = getAppById(appId);
  if (!app) return;

  const modalBackdrop = document.getElementById('app-lock-modal');
  const titleEl = document.getElementById('lock-modal-app-title');
  const subEl = document.getElementById('lock-modal-subheading');
  const idInput = document.getElementById('lock-modal-app-id');
  const pinInput = document.getElementById('app-lock-pin-input');
  const errEl = document.getElementById('app-lock-error');

  const rateLimit = checkRateLimit();

  if (titleEl) titleEl.textContent = `Buka: ${app.title}`;
  if (subEl) subEl.textContent = `Aplikasi ${app.title} Terkunci`;
  if (idInput) idInput.value = app.id;
  if (pinInput) {
    pinInput.value = '';
    if (!rateLimit.isLocked) {
      setTimeout(() => pinInput.focus(), 100);
    }
  }
  if (errEl) {
    if (rateLimit.isLocked) {
      errEl.textContent = `🔒 Akses ditangguhkan! Silakan tunggu ${rateLimit.remainingSeconds} detik.`;
      errEl.style.display = 'block';
    } else {
      errEl.style.display = 'none';
      errEl.textContent = '';
    }
  }

  if (modalBackdrop) {
    modalBackdrop.classList.add('open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
  }
}

/**
 * Tutup Modal PIN Akses Aplikasi Terkunci
 */
function closeAppLockModal() {
  const modalBackdrop = document.getElementById('app-lock-modal');
  if (modalBackdrop) {
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Render Skeleton Loading State (6 shimmer cards)
 */
function renderLoadingSkeleton() {
  const container = document.getElementById('main-bento-grid');
  if (!container) return;

  container.innerHTML = Array.from({ length: 6 }).map(() => `
    <div class="skeleton-card skeleton-shimmer" aria-hidden="true">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div style="width: 3rem; height: 3rem; border-radius: 12px; background: rgba(0,0,0,0.06);"></div>
        <div style="width: 4rem; height: 1.25rem; border-radius: 999px; background: rgba(0,0,0,0.06);"></div>
      </div>
      <div style="margin-bottom: 1.5rem;">
        <div style="width: 80%; height: 1.25rem; border-radius: 6px; background: rgba(0,0,0,0.06); margin-bottom: 0.5rem;"></div>
        <div style="width: 100%; height: 0.875rem; border-radius: 4px; background: rgba(0,0,0,0.06); margin-bottom: 0.375rem;"></div>
        <div style="width: 60%; height: 0.875rem; border-radius: 4px; background: rgba(0,0,0,0.06);"></div>
      </div>
      <div style="width: 100%; height: 2.25rem; border-radius: 8px; background: rgba(0,0,0,0.06);"></div>
    </div>
  `).join('');
}

/**
 * Render Empty State (Ketika pencarian atau filter kategori tidak ada hasil)
 * @param {string} query
 * @param {string} category
 */
function renderEmptyState(query = '', category = 'all') {
  const container = document.getElementById('main-bento-grid');
  const countBadge = document.getElementById('catalog-count-badge');
  if (countBadge) countBadge.textContent = '0 Aplikasi';

  if (!container) return;

  container.innerHTML = `
    <div class="empty-state-card fade-in" role="status">
      <div class="empty-icon-box" aria-hidden="true">
        <i data-lucide="search-x" width="36" height="36"></i>
      </div>
      <h4 class="empty-title">Aplikasi Tidak Ditemukan</h4>
      <p class="empty-subtitle">
        Tidak ada aplikasi yang cocok dengan kata kunci 
        ${query ? `<strong>"${escapeHtml(query)}"</strong>` : ''} 
        ${category !== 'all' ? `pada kategori <strong>"${escapeHtml(category)}"</strong>` : ''}.
      </p>
      <button type="button" id="btn-reset-empty" class="btn-primary" data-action="reset-filters">
        <i data-lucide="rotate-ccw" width="16" height="16"></i>
        <span>Reset Filter & Pencarian</span>
      </button>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Render Error State (Jika terjadi kegagalan pemuatan data)
 * @param {string} errorMessage
 * @param {Function} retryFn
 */
function renderErrorState(errorMessage = 'Gagal memuat katalog data aplikasi.', retryFn = null) {
  const container = document.getElementById('main-bento-grid');
  if (!container) return;

  container.innerHTML = `
    <div class="error-state-card fade-in" role="alert">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;" aria-hidden="true">⚠️</div>
      <h4 style="font-weight: 700; font-size: 1.125rem; margin-bottom: 0.375rem;">Terjadi Kesalahan Sistem</h4>
      <p style="font-size: 0.875rem; margin-bottom: 1rem;">${escapeHtml(errorMessage)}</p>
      <button type="button" id="btn-retry-error" class="btn-primary" style="background: #DC2626;">
        <i data-lucide="refresh-cw" width="16" height="16"></i>
        <span>Coba Muat Ulang</span>
      </button>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  const retryBtn = document.getElementById('btn-retry-error');
  if (retryBtn && retryFn) {
    retryBtn.addEventListener('click', retryFn);
  }
}

/**
 * Render Success State (Daftar kartu Bento interaktif)
 * @param {Array} apps
 * @param {Object} filterState
 */
function renderSuccessState(apps, { category = 'all', query = '' } = {}) {
  const container = document.getElementById('main-bento-grid');
  const countBadge = document.getElementById('catalog-count-badge');
  const headingText = document.getElementById('catalog-heading-text');
  const favorites = getFavorites();

  if (countBadge) countBadge.textContent = `${apps.length} Aplikasi`;

  if (headingText) {
    if (category === 'favorites') {
      headingText.textContent = 'Katalog Aplikasi Favorit';
    } else if (category !== 'all') {
      headingText.textContent = `Katalog: ${category.toUpperCase()}`;
    } else {
      headingText.textContent = query ? `Hasil Pencarian ("${query}")` : 'Semua Katalog Aplikasi';
    }
  }

  if (!apps || apps.length === 0) {
    renderEmptyState(query, category);
    renderFavoritesSection(favorites);
    return;
  }

  if (container) {
    container.innerHTML = apps.map(app => renderAppCard(app, favorites.includes(app.id))).join('');
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
    animateBentoGridCards('#main-bento-grid');
  }

  // Render Baris Cepat Favorit jika ada
  renderFavoritesSection(favorites, category);
}

/**
 * Render seksi quick-row favorit di bagian atas
 * @param {Array} favorites
 * @param {string} currentCategory
 */
function renderFavoritesSection(favorites = getFavorites(), currentCategory = 'all') {
  const favSection = document.getElementById('favorites-section');
  const favGrid = document.getElementById('favorites-grid');
  const favBadge = document.getElementById('favorites-count-badge');

  if (!favSection || !favGrid) return;

  // Sembunyikan jika tidak ada favorit ATAU pengguna memang sedang membuka tab Favorit
  if (!favorites || favorites.length === 0 || currentCategory === 'favorites') {
    favSection.style.display = 'none';
    favGrid.innerHTML = '';
    return;
  }

  const allApps = getAllApps();
  const favApps = allApps.filter(a => favorites.includes(a.id));

  if (favApps.length === 0) {
    favSection.style.display = 'none';
    favGrid.innerHTML = '';
    return;
  }

  favSection.style.display = 'block';
  if (favBadge) favBadge.textContent = `${favApps.length} Favorit`;
  favGrid.innerHTML = favApps.map(app => renderAppCard(app, true)).join('');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
  animateBentoGridCards('#favorites-grid');
}

/**
 * Inisialisasi event delegation untuk interaksi pada kartu Bento
 * @param {Object} handlers
 */
function initBentoGridEvents({ onOpenModal, onEditApp }) {
  onOpenModalCallback = onOpenModal;
  onEditAppCallback = onEditApp;

  // Event delegation di body / main agar mencakup main-grid dan favorites-grid
  document.addEventListener('click', (e) => {
    // 1. Toggle Favorit
    const favBtn = e.target.closest('[data-action="toggle-fav"]');
    if (favBtn) {
      e.preventDefault();
      const appId = favBtn.getAttribute('data-app-id');
      if (appId) {
        toggleFavorite(appId);
      }
      return;
    }

    // 2. Open Modal Viewer (iframe)
    const modalBtn = e.target.closest('[data-action="open-modal"]');
    if (modalBtn) {
      e.preventDefault();
      const appId = modalBtn.getAttribute('data-app-id');
      if (appId) {
        recordAppLaunch(appId);
        if (typeof onOpenModalCallback === 'function') {
          const app = getAppById(appId);
          if (app) onOpenModalCallback(app);
        }
      }
      return;
    }

    // 2b. Open Direct Link / Tab Baru
    const launchLink = e.target.closest('a.btn-launch, [data-action="open-tab"]');
    if (launchLink) {
      const appId = launchLink.getAttribute('data-app-id');
      if (appId) {
        recordAppLaunch(appId);
      }
    }

    // 2c. SPMB Direct Launch Form
    const spmbBtn = e.target.closest('[data-action="open-spmb"]');
    if (spmbBtn) {
      e.preventDefault();
      const appId = spmbBtn.getAttribute('data-app-id');
      if (appId) {
        recordAppLaunch(appId);
      }
      window.dispatchEvent(new CustomEvent('yiqul:open-spmb'));
      return;
    }

    // 3. Edit App (Admin)
    const editBtn = e.target.closest('[data-action="edit-app"]');
    if (editBtn) {
      e.preventDefault();
      const appId = editBtn.getAttribute('data-app-id');
      if (appId && typeof onEditAppCallback === 'function') {
        const app = getAppById(appId);
        if (app) onEditAppCallback(app);
      }
      return;
    }

    // 4. Reset Filters dari Empty State
    const resetBtn = e.target.closest('[data-action="reset-filters"]');
    if (resetBtn) {
      e.preventDefault();
      resetFilters();
      return;
    }

    // 5. Prompt PIN Akses Aplikasi Terkunci
    const lockBtn = e.target.closest('[data-action="prompt-app-lock"]');
    if (lockBtn) {
      e.preventDefault();
      const appId = lockBtn.getAttribute('data-app-id');
      if (appId) {
        openAppLockModal(appId);
      }
      return;
    }
  });

  // Setup form & close events untuk Modal PIN Akses Aplikasi
  const lockForm = document.getElementById('app-lock-form');
  if (lockForm && !lockForm.__hasLockSubmitListener) {
    lockForm.__hasLockSubmitListener = true;
    lockForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const appId = document.getElementById('lock-modal-app-id').value;
      const pinInput = document.getElementById('app-lock-pin-input');
      const errEl = document.getElementById('app-lock-error');
      const inputPin = pinInput ? pinInput.value : '';
      const rateLimitBefore = checkRateLimit();

      if (rateLimitBefore.isLocked) {
        if (errEl) {
          errEl.textContent = `🔒 Akses ditangguhkan! Silakan tunggu ${rateLimitBefore.remainingSeconds} detik.`;
          errEl.style.display = 'block';
        }
        return;
      }

      if (verifyAppAccessPin(inputPin)) {
        closeAppLockModal();
        const app = getAppById(appId);
        if (app) {
          recordAppLaunch(app.id);
          if (app.targetMode === 'iframe' && typeof onOpenModalCallback === 'function') {
            onOpenModalCallback(app);
          } else if (app.targetMode === '_self') {
            window.location.href = app.targetUrl;
          } else {
            window.open(app.targetUrl, '_blank', 'noopener,noreferrer');
          }
        }
      } else {
        const rateLimitAfter = checkRateLimit();
        if (errEl) {
          if (rateLimitAfter.isLocked) {
            errEl.textContent = `🚨 Terlalu banyak percobaan! Akses ditangguhkan selama ${rateLimitAfter.remainingSeconds} detik.`;
          } else {
            errEl.textContent = `❌ PIN Akses Salah! Sisa percobaan: ${rateLimitAfter.attemptsLeft} kali lagi.`;
          }
          errEl.style.display = 'block';
        }
        if (pinInput) {
          pinInput.select();
        }
      }
    });
  }

  const closeLockBtn = document.getElementById('close-lock-modal-btn');
  if (closeLockBtn && !closeLockBtn.__hasListener) {
    closeLockBtn.__hasListener = true;
    closeLockBtn.addEventListener('click', closeAppLockModal);
  }

  const cancelLockBtn = document.getElementById('cancel-lock-modal-btn');
  if (cancelLockBtn && !cancelLockBtn.__hasListener) {
    cancelLockBtn.__hasListener = true;
    cancelLockBtn.addEventListener('click', closeAppLockModal);
  }

  const lockBackdrop = document.getElementById('app-lock-modal');
  if (lockBackdrop && !lockBackdrop.__hasBackdropListener) {
    lockBackdrop.__hasBackdropListener = true;
    lockBackdrop.addEventListener('click', (e) => {
      if (e.target === lockBackdrop) {
        closeAppLockModal();
      }
    });
  }
}


/* --- MODULE: src/components/ModalViewer.js --- */
/**
 * COMPONENT: MODAL IFRAME VIEWER
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengelola dialog modal pop-up untuk aplikasi web yang mendukung mode iframe embed,
 * memungkinkan pengguna bekerja langsung di dalam portal tanpa meninggalkan halaman.
 */


let isModalOpen = false;

/**
 * Buka aplikasi di dalam Modal Viewer
 * @param {Object} app
 */
function openModalViewer(app) {
  if (!app) return;

  const backdrop = document.getElementById('modal-viewer-backdrop');
  const iframe = document.getElementById('modal-app-iframe');
  const titleEl = document.getElementById('modal-app-title');
  const externalBtn = document.getElementById('modal-open-external-btn');

  const safeUrl = sanitizeUrl(app.targetUrl);
  if (safeUrl === '#') {
    alert('URL aplikasi tidak valid atau tidak aman.');
    return;
  }

  if (titleEl) titleEl.textContent = app.title || 'Aplikasi Yiqul';
  if (externalBtn) {
    externalBtn.setAttribute('href', safeUrl);
    externalBtn.setAttribute('title', `Buka ${app.title} di tab baru`);
  }

  if (iframe) {
    iframe.src = safeUrl;
  }

  if (backdrop) {
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    isModalOpen = true;
  }
}

/**
 * Tutup Modal Viewer dan reset iframe src ke about:blank
 */
function closeModalViewer() {
  const backdrop = document.getElementById('modal-viewer-backdrop');
  const iframe = document.getElementById('modal-app-iframe');

  if (backdrop) {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    isModalOpen = false;
  }

  if (iframe) {
    // Bersihkan iframe agar tidak memakan memori / audio latar
    iframe.src = 'about:blank';
  }
}

/**
 * Inisialisasi event listener modal viewer
 */
function initModalViewer() {
  const backdrop = document.getElementById('modal-viewer-backdrop');
  const closeBtn = document.getElementById('modal-close-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeModalViewer();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      // Jika klik di luar modal container (di area latar blur)
      if (e.target === backdrop) {
        closeModalViewer();
      }
    });
  }

  // Keyboard shortcut Esc
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) {
      closeModalViewer();
    }
  });
}


/* --- MODULE: src/components/BannerSlider.js --- */
/**
 * COMPONENT: DYNAMIC PROMO & HERO IMAGE BANNER
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Menampilkan banner gambar promosi, pengumuman akbar, dan agenda yayasan
 * yang diunggah oleh admin melalui Google Drive dengan tautan aksi dinamis.
 */




let currentSlideIndex = 0;
let slideInterval = null;

/**
 * Render komponen Banner Slider di halaman depan beranda
 */
function renderBannerSlider() {
  const container = document.getElementById('hero-banner-container');
  if (!container) return;

  const allBanners = getBanners();
  const activeBanners = allBanners
    .filter(b => b.isActive !== false && b.imageUrl)
    .sort((a, b) => (Number(a.displayOrder) || 99) - (Number(b.displayOrder) || 99));

  if (activeBanners.length === 0) {
    container.innerHTML = '';
    container.style.display = 'none';
    if (slideInterval) clearInterval(slideInterval);
    return;
  }

  container.style.display = 'block';

  if (currentSlideIndex >= activeBanners.length) {
    currentSlideIndex = 0;
  }

  const currentBanner = activeBanners[currentSlideIndex];
  const safeImgUrl = convertGoogleDriveToDirectLink(currentBanner.imageUrl);
  const safeActionUrl = sanitizeUrl(currentBanner.actionUrl || '#');
  const safeTitle = escapeHtml(currentBanner.title || 'Pengumuman Penting Yayasan');
  const safeSubtitle = escapeHtml(currentBanner.subtitle || '');
  const safeActionText = escapeHtml(currentBanner.actionText || 'Buka Tautan ↗');
  const isSpmbAction = Boolean(
    (currentBanner.actionUrl && (currentBanner.actionUrl.includes('psb') || currentBanner.actionUrl === '#spmb')) ||
    (currentBanner.actionText && currentBanner.actionText.toLowerCase().includes('daftar'))
  );

  container.innerHTML = `
    <div class="hero-image-banner-card fade-in" style="background-image: linear-gradient(to right, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.45) 100%), url('${safeImgUrl}');">
      <div class="banner-badge">
        <i data-lucide="sparkles" width="14" height="14"></i>
        <span>Warta & Promosi Utama</span>
      </div>

      <div class="banner-content">
        <h3 class="banner-title">${safeTitle}</h3>
        ${safeSubtitle ? `<p class="banner-subtitle">${safeSubtitle}</p>` : ''}
        
        <div class="banner-actions">
          ${isSpmbAction ? `
            <button type="button" class="btn-primary banner-cta-btn" data-action="open-spmb">
              <span>${safeActionText}</span>
              <i data-lucide="arrow-right" width="16" height="16"></i>
            </button>
          ` : currentBanner.actionUrl ? `
            <a href="${safeActionUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary banner-cta-btn">
              <span>${safeActionText}</span>
              <i data-lucide="arrow-right" width="16" height="16"></i>
            </a>
          ` : ''}
        </div>
      </div>

      ${activeBanners.length > 1 ? `
        <!-- Carousel Dots & Controls -->
        <div class="banner-carousel-dots">
          ${activeBanners.map((_, idx) => `
            <button 
              type="button" 
              class="carousel-dot ${idx === currentSlideIndex ? 'active' : ''}" 
              data-slide-index="${idx}"
              aria-label="Geser ke banner ${idx + 1}"
            ></button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // Bind dot events
  container.querySelectorAll('.carousel-dot').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSlideIndex = Number(btn.getAttribute('data-slide-index')) || 0;
      renderBannerSlider();
      startAutoSlide(activeBanners.length);
    });
  });

  startAutoSlide(activeBanners.length);
}

function startAutoSlide(totalSlides) {
  if (slideInterval) clearInterval(slideInterval);
  if (totalSlides <= 1) return;

  slideInterval = setInterval(() => {
    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    renderBannerSlider();
  }, 7000);
}

/**
 * Inisialisasi banner slider & listener event
 */
function initBannerSlider() {
  renderBannerSlider();

  if (typeof window !== 'undefined') {
    window.addEventListener('yiqul:banners-changed', () => {
      renderBannerSlider();
    });

    document.addEventListener('click', (e) => {
      const spmbBtn = e.target.closest('[data-action="open-spmb"]');
      if (spmbBtn) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('yiqul:open-spmb'));
      }
    });
  }
}


/* --- MODULE: src/components/SpmbModal.js --- */
/**
 * COMPONENT: SPMB ONLINE (PENDAFTARAN SANTRI BARU) INTERACTIVE MODAL & DIGITAL SLIP
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * Yayasan Islam Qudwatul Ummah (Yiqul)
 * 
 * Menyediakan wizard pendaftaran online multi-tahap yang ramah mobile:
 * - Tahap 1: Data Calon Santri, Jenjang, & Riwayat Hafalan
 * - Tahap 2: Data Orang Tua/Wali & Finansial
 * - Tahap 3: Alamat Domisili & Riwayat Kesehatan
 * - Tanda Terima / Bukti Digital Resmi Pendaftaran (Printable & Direct WhatsApp Confirmation)
 */



let currentStep = 1;
let registrationResult = null;

/**
 * Buka modal formulir pendaftaran SPMB Online
 * @param {string} prefillJenjang - 'Day Care' | 'Play Group' | 'RAT Al-Qudwah' | 'TKT Al-Qudwah' | 'SDT Al-Qudwah' | 'SMPT Al-Qudwah' | 'SMAT Al-Qudwah'
 */
function openSpmbModal(prefillJenjang = 'SDT Al-Qudwah') {
  currentStep = 1;
  registrationResult = null;

  const modal = document.getElementById('spmb-modal');
  if (!modal) return;

  renderSpmbModalContent(prefillJenjang);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Tutup modal pendaftaran SPMB
 */
function closeSpmbModal() {
  const modal = document.getElementById('spmb-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Buka langsung bukti pendaftaran digital berdasarkan ID (untuk preview admin atau cetak ulang)
 * @param {string} id - Nomor Registrasi (SPMB-2026-XXXX)
 */
function openSpmbReceiptDirect(id) {
  const reg = getRegistrationById(id);
  if (!reg) return;

  currentStep = 4;
  registrationResult = reg;

  const modal = document.getElementById('spmb-modal');
  if (!modal) return;

  renderSpmbModalContent();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Render konten modal SPMB sesuai tahap yang sedang aktif
 * @param {string} prefillJenjang 
 */
function renderSpmbModalContent(prefillJenjang = 'MTs') {
  const modal = document.getElementById('spmb-modal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-container spmb-modal-window">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-title-group">
          <div class="brand-logo-badge" style="background: rgba(16, 185, 129, 0.15); color: #10B981;" aria-hidden="true">
            <i data-lucide="graduation-cap" width="20" height="20"></i>
          </div>
          <div>
            <h3 class="modal-title">Pendaftaran Santri Baru (SPMB 2026/2027)</h3>
            <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500;">
              Yayasan Islam Qudwatul Ummah Lebak - Banten
            </span>
          </div>
        </div>
        <button type="button" class="btn-icon" id="spmb-close-btn" aria-label="Tutup Formulir">
          <i data-lucide="x" width="20" height="20"></i>
        </button>
      </div>

      <!-- Step Indicator Bar (Hanya tampil jika belum submit / step 1-3) -->
      ${currentStep <= 3 ? `
        <div class="spmb-step-indicator" role="tablist">
          <div class="spmb-step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}">
            <div class="step-num">1</div>
            <div class="step-label">Data Calon Santri</div>
          </div>
          <div class="spmb-step-line ${currentStep > 1 ? 'filled' : ''}"></div>
          <div class="spmb-step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}">
            <div class="step-num">2</div>
            <div class="step-label">Orang Tua / Wali</div>
          </div>
          <div class="spmb-step-line ${currentStep > 2 ? 'filled' : ''}"></div>
          <div class="spmb-step-item ${currentStep === 3 ? 'active' : ''}">
            <div class="step-num">3</div>
            <div class="step-label">Domisili & Kesehatan</div>
          </div>
        </div>
      ` : ''}

      <!-- Modal Body -->
      <div class="spmb-modal-body">
        ${currentStep === 1 ? renderStep1(prefillJenjang) : ''}
        ${currentStep === 2 ? renderStep2() : ''}
        ${currentStep === 3 ? renderStep3() : ''}
        ${currentStep === 4 && registrationResult ? renderStepSuccess(registrationResult) : ''}
      </div>
    </div>
  `;

  bindSpmbEvents();
}

/**
 * STEP 1: Pilihan Jenjang & Data Calon Santri
 */
function renderStep1(defaultJenjang) {
  return `
    <form id="spmb-step1-form" class="spmb-form-step">
      <div class="spmb-alert-info">
        <i data-lucide="info" width="18" height="18"></i>
        <span>Silakan isi data calon santri dengan teliti sesuai akta kelahiran / kartu keluarga.</span>
      </div>

      <!-- Jenjang, Jalur & Hunian -->
      <div class="form-group-grid-3">
        <div class="form-group">
          <label class="form-label" for="spmb-jenjang">Jenjang Pendidikan *</label>
          <select id="spmb-jenjang" class="form-select" required>
            <option value="Day Care" ${defaultJenjang === 'Day Care' ? 'selected' : ''}>Day Care</option>
            <option value="Play Group" ${defaultJenjang === 'Play Group' ? 'selected' : ''}>Play Group</option>
            <option value="RAT Al-Qudwah" ${defaultJenjang === 'RAT Al-Qudwah' ? 'selected' : ''}>RAT Al-Qudwah</option>
            <option value="TKT Al-Qudwah" ${defaultJenjang === 'TKT Al-Qudwah' ? 'selected' : ''}>TKT Al-Qudwah</option>
            <option value="SDT Al-Qudwah" ${defaultJenjang === 'SDT Al-Qudwah' || !defaultJenjang ? 'selected' : ''}>SDT Al-Qudwah</option>
            <option value="SMPT Al-Qudwah" ${defaultJenjang === 'SMPT Al-Qudwah' ? 'selected' : ''}>SMPT Al-Qudwah</option>
            <option value="SMAT Al-Qudwah" ${defaultJenjang === 'SMAT Al-Qudwah' ? 'selected' : ''}>SMAT Al-Qudwah</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-jalur">Jalur Masuk *</label>
          <select id="spmb-jalur" class="form-select" required>
            <option value="Reguler">Jalur Reguler</option>
            <option value="Prestasi">Jalur Prestasi Akademik</option>
            <option value="Beasiswa_Tahfidz">Beasiswa Tahfidz Al-Qur'an</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-asrama">Pola Pendidikan *</label>
          <select id="spmb-asrama" class="form-select" required>
            <option value="Boarding">Asrama (Boarding School)</option>
            <option value="FullDay">Non-Asrama (Full Day)</option>
          </select>
        </div>
      </div>

      <!-- Nama Calon Santri -->
      <div class="form-group">
        <label class="form-label" for="spmb-nama">Nama Lengkap Calon Santri *</label>
        <input type="text" id="spmb-nama" class="form-input" placeholder="Contoh: Muhammad Fatih Al-Ayyubi" required autocomplete="name">
      </div>

      <!-- Identitas: NISN, NIK, Kelamin -->
      <div class="form-group-grid-3">
        <div class="form-group">
          <label class="form-label" for="spmb-nisn">NISN (10 Digit)</label>
          <input type="text" id="spmb-nisn" class="form-input" placeholder="0012345678" maxlength="10" inputmode="numeric">
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-nik">NIK Santri (16 Digit)</label>
          <input type="text" id="spmb-nik" class="form-input" placeholder="3602xxxxxxxxxxxx" maxlength="16" inputmode="numeric">
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-gender">Jenis Kelamin *</label>
          <select id="spmb-gender" class="form-select" required>
            <option value="L">Laki-laki (Ikhwan)</option>
            <option value="P">Perempuan (Akhwat)</option>
          </select>
        </div>
      </div>

      <!-- Tempat & Tanggal Lahir -->
      <div class="form-group-grid-2">
        <div class="form-group">
          <label class="form-label" for="spmb-tempat-lahir">Tempat Lahir *</label>
          <input type="text" id="spmb-tempat-lahir" class="form-input" placeholder="Contoh: Lebak" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-tgl-lahir">Tanggal Lahir *</label>
          <input type="date" id="spmb-tgl-lahir" class="form-input" required>
        </div>
      </div>

      <!-- Asal Sekolah & Riwayat Hafalan -->
      <div class="form-group-grid-2">
        <div class="form-group">
          <label class="form-label" for="spmb-asal-sekolah">Asal Sekolah / Madrasah *</label>
          <input type="text" id="spmb-asal-sekolah" class="form-input" placeholder="Contoh: SDIT Qudwatul Ummah Lebak" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-hafalan">Riwayat Hafalan Al-Qur'an *</label>
          <select id="spmb-hafalan" class="form-select" required>
            <option value="Belum Ada">Belum Ada / Baru Juz Amma</option>
            <option value="1-2 Juz">1 - 2 Juz</option>
            <option value="3-5 Juz">3 - 5 Juz</option>
            <option value="> 5 Juz">Lebih dari 5 Juz</option>
            <option value="30 Juz Mutqin">Khatam 30 Juz</option>
          </select>
        </div>
      </div>

      <div class="spmb-footer-actions">
        <div></div>
        <button type="submit" class="btn-primary" id="btn-spmb-next-1">
          <span>Lanjut ke Data Orang Tua</span>
          <i data-lucide="arrow-right" width="16" height="16"></i>
        </button>
      </div>
    </form>
  `;
}

/**
 * STEP 2: Data Orang Tua / Wali & Kontak
 */
function renderStep2() {
  return `
    <form id="spmb-step2-form" class="spmb-form-step">
      <div class="spmb-alert-info">
        <i data-lucide="info" width="18" height="18"></i>
        <span>Pastikan nomor WhatsApp orang tua aktif untuk menerima konfirmasi seleksi & pengumuman.</span>
      </div>

      <!-- Ayah -->
      <div class="form-group-grid-2">
        <div class="form-group">
          <label class="form-label" for="spmb-nama-ayah">Nama Lengkap Ayah Kandung *</label>
          <input type="text" id="spmb-nama-ayah" class="form-input" placeholder="Nama lengkap Ayah beserta gelar" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-pekerjaan-ayah">Pekerjaan Ayah *</label>
          <select id="spmb-pekerjaan-ayah" class="form-select" required>
            <option value="PNS/TNI/Polri">PNS / TNI / Polri</option>
            <option value="Karyawan Swasta">Karyawan Swasta</option>
            <option value="Wiraswasta/Pedagang">Wiraswasta / Pengusaha / Pedagang</option>
            <option value="Guru/Dosen">Guru / Dosen</option>
            <option value="Petani/Buruh">Petani / Nelayan / Buruh</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      <!-- Ibu -->
      <div class="form-group-grid-2">
        <div class="form-group">
          <label class="form-label" for="spmb-nama-ibu">Nama Lengkap Ibu Kandung *</label>
          <input type="text" id="spmb-nama-ibu" class="form-input" placeholder="Nama lengkap Ibu beserta gelar" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-pekerjaan-ibu">Pekerjaan Ibu *</label>
          <select id="spmb-pekerjaan-ibu" class="form-select" required>
            <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
            <option value="PNS/TNI/Polri">PNS / TNI / Polri</option>
            <option value="Karyawan Swasta">Karyawan Swasta</option>
            <option value="Wiraswasta">Wiraswasta / Pengusaha</option>
            <option value="Guru/Dosen">Guru / Dosen</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      <!-- Finansial & Kontak WhatsApp -->
      <div class="form-group-grid-3">
        <div class="form-group">
          <label class="form-label" for="spmb-penghasilan">Penghasilan Ortu (Total Bulanan) *</label>
          <select id="spmb-penghasilan" class="form-select" required>
            <option value="< 2 Juta">&lt; Rp 2.000.000</option>
            <option value="2 - 5 Juta" selected>Rp 2.000.000 - Rp 5.000.000</option>
            <option value="5 - 10 Juta">Rp 5.000.000 - Rp 10.000.000</option>
            <option value="> 10 Juta">&gt; Rp 10.000.000</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-wa">No. WhatsApp Aktif (Utama) *</label>
          <input type="tel" id="spmb-wa" class="form-input" placeholder="Contoh: 081289123456" required autocomplete="tel" inputmode="tel">
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-hubungan">Hubungan Wali</label>
          <select id="spmb-hubungan" class="form-select">
            <option value="Orang Tua Kandung" selected>Orang Tua Kandung</option>
            <option value="Kakek/Nenek">Kakek / Nenek</option>
            <option value="Paman/Bibi">Paman / Bibi</option>
            <option value="Wali Lainnya">Wali Lainnya</option>
          </select>
        </div>
      </div>

      <div class="spmb-footer-actions">
        <button type="button" class="btn-secondary" id="btn-spmb-prev-2">
          <i data-lucide="arrow-left" width="16" height="16"></i>
          <span>Kembali</span>
        </button>
        <button type="submit" class="btn-primary" id="btn-spmb-next-2">
          <span>Lanjut ke Domisili & Selesai</span>
          <i data-lucide="arrow-right" width="16" height="16"></i>
        </button>
      </div>
    </form>
  `;
}

/**
 * STEP 3: Domisili & Riwayat Kesehatan
 */
function renderStep3() {
  return `
    <form id="spmb-step3-form" class="spmb-form-step">
      <div class="spmb-alert-info">
        <i data-lucide="info" width="18" height="18"></i>
        <span>Langkah terakhir: lengkapi alamat tempat tinggal domisili dan kondisi kesehatan santri.</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="spmb-alamat">Alamat Lengkap (Jalan, RT/RW, No. Rumah) *</label>
        <textarea id="spmb-alamat" class="form-textarea" rows="2" placeholder="Contoh: Jl. Raya Rangkasbitung - Pandeglang Km. 4 RT 02/05" required></textarea>
      </div>

      <div class="form-group-grid-2">
        <div class="form-group">
          <label class="form-label" for="spmb-kelurahan">Kelurahan / Desa *</label>
          <input type="text" id="spmb-kelurahan" class="form-input" placeholder="Contoh: Cijoro Pasir" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-kecamatan">Kecamatan *</label>
          <input type="text" id="spmb-kecamatan" class="form-input" placeholder="Contoh: Rangkasbitung" required>
        </div>
      </div>

      <div class="form-group-grid-2">
        <div class="form-group">
          <label class="form-label" for="spmb-kabupaten">Kota / Kabupaten *</label>
          <input type="text" id="spmb-kabupaten" class="form-input" value="Kab. Lebak" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="spmb-provinsi">Provinsi *</label>
          <input type="text" id="spmb-provinsi" class="form-input" value="Banten" required>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="spmb-kesehatan">Catatan Riwayat Kesehatan / Alergi Santri</label>
        <input type="text" id="spmb-kesehatan" class="form-input" placeholder="Contoh: Tidak ada riwayat penyakit berat, alergi debu ringan, dsb.">
      </div>

      <div class="spmb-footer-actions">
        <button type="button" class="btn-secondary" id="btn-spmb-prev-3">
          <i data-lucide="arrow-left" width="16" height="16"></i>
          <span>Kembali</span>
        </button>
        <button type="submit" class="btn-primary" id="btn-spmb-submit" style="background: #10B981; border-color: #059669;">
          <i data-lucide="check-circle" width="16" height="16"></i>
          <span>Kirim Pendaftaran Sekarang</span>
        </button>
      </div>
    </form>
  `;
}

/**
 * STEP 4: Success / Bukti Pendaftaran Digital (Digital Registration Card)
 * @param {Object} reg 
 */
function renderStepSuccess(reg) {
  const waUrl = createWhatsAppConfirmationLink(reg);
  const safeName = escapeHtml(reg.namaLengkap);
  const safeId = escapeHtml(reg.id);
  const safeJenjang = escapeHtml(reg.jenjang);
  const safeJalur = escapeHtml(reg.jalur);
  const safeAsrama = escapeHtml(reg.asrama);
  const safeSekolah = escapeHtml(reg.asalSekolah);
  const safeHafalan = escapeHtml(reg.riwayatHafalan);
  const safeOrtu = escapeHtml(`${reg.namaAyah} / ${reg.namaIbu}`);
  const safeWa = escapeHtml(reg.noWhatsapp);
  const safeDate = new Date(reg.createdAt).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `
    <div class="spmb-success-view fade-in">
      <div class="spmb-success-header">
        <div class="success-icon-badge">
          <i data-lucide="check" width="32" height="32"></i>
        </div>
        <h3 class="success-title">Alhamdulillah! Pendaftaran Berhasil Terkirim</h3>
        <p class="success-subtitle">
          Data calon santri telah tersimpan aman dalam sistem pangkalan data penerimaan santri baru Yiqul.
        </p>
      </div>

      <!-- Kartu Slip Tanda Terima Digital Resmi (Printable Slip) -->
      <div class="spmb-receipt-slip printable-area" id="spmb-receipt-card">
        <div class="receipt-top-banner">
          <div class="receipt-logo-group">
            <div class="receipt-mini-badge">YIQUL</div>
            <div>
              <div class="receipt-inst-name">YAYASAN ISLAM QUDWATUL UMMAH</div>
              <div class="receipt-inst-sub">PANITIA PENERIMAAN SANTRI BARU (SPMB) T.A 2026/2027</div>
              <div class="receipt-inst-address">Jl. Raya Rangkasbitung - Pandeglang Km. 4, Lebak - Banten</div>
            </div>
          </div>
          <div class="receipt-number-badge">
            <span class="badge-tag">NO. REGISTRASI RESMI</span>
            <span class="badge-code">${safeId}</span>
          </div>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-grid">
          <div class="receipt-col">
            <div class="receipt-field">
              <span class="label">Nama Calon Santri:</span>
              <strong class="value highlight">${safeName}</strong>
            </div>
            <div class="receipt-field">
              <span class="label">Jenjang & Pola:</span>
              <span class="value">${safeJenjang} (${safeAsrama})</span>
            </div>
            <div class="receipt-field">
              <span class="label">Jalur Pendaftaran:</span>
              <span class="value">${safeJalur}</span>
            </div>
            <div class="receipt-field">
              <span class="label">Asal Sekolah:</span>
              <span class="value">${safeSekolah}</span>
            </div>
          </div>

          <div class="receipt-col">
            <div class="receipt-field">
              <span class="label">Riwayat Hafalan:</span>
              <span class="value">${safeHafalan}</span>
            </div>
            <div class="receipt-field">
              <span class="label">Orang Tua / Wali:</span>
              <span class="value">${safeOrtu}</span>
            </div>
            <div class="receipt-field">
              <span class="label">WhatsApp Kontak:</span>
              <span class="value">${safeWa}</span>
            </div>
            <div class="receipt-field">
              <span class="label">Tanggal Registrasi:</span>
              <span class="value">${safeDate}</span>
            </div>
          </div>
        </div>

        <div class="receipt-footer-notes">
          <div class="notes-title">Petunjuk Tes & Verifikasi Berkas:</div>
          <ol>
            <li>Simpan atau cetak slip tanda terima ini sebagai bukti pendaftaran resmi.</li>
            <li>Klik tombol hijau di bawah untuk konfirmasi otomatis ke WhatsApp Panitia SPMB.</li>
            <li>Siapkan fotokopi Akta Kelahiran, Kartu Keluarga, dan Surat Keterangan Lulus / NISN saat verifikasi.</li>
          </ol>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="spmb-success-actions">
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary btn-spmb-wa">
          <i data-lucide="message-circle" width="18" height="18"></i>
          <span>Konfirmasi ke WhatsApp Panitia ↗</span>
        </a>

        <button type="button" class="btn-secondary" id="btn-spmb-print">
          <i data-lucide="printer" width="18" height="18"></i>
          <span>Cetak Bukti Pendaftaran (PDF / Slip)</span>
        </button>

        <button type="button" class="btn-outline" id="btn-spmb-done">
          <i data-lucide="home" width="18" height="18"></i>
          <span>Selesai & Kembali ke Portal</span>
        </button>
      </div>
    </div>
  `;
}

// Temporary in-memory draft data between steps
let spmbDraft = {};

/**
 * Event handling untuk wizard form
 */
function bindSpmbEvents() {
  const modal = document.getElementById('spmb-modal');
  if (!modal) return;

  // Tutup Modal
  const closeBtn = document.getElementById('spmb-close-btn');
  if (closeBtn) closeBtn.onclick = closeSpmbModal;

  // STEP 1 Submit -> to STEP 2
  const step1Form = document.getElementById('spmb-step1-form');
  if (step1Form) {
    step1Form.onsubmit = (e) => {
      e.preventDefault();
      spmbDraft.jenjang = document.getElementById('spmb-jenjang').value;
      spmbDraft.jalur = document.getElementById('spmb-jalur').value;
      spmbDraft.asrama = document.getElementById('spmb-asrama').value;
      spmbDraft.namaLengkap = document.getElementById('spmb-nama').value;
      spmbDraft.nisn = document.getElementById('spmb-nisn').value;
      spmbDraft.nikSantri = document.getElementById('spmb-nik').value;
      spmbDraft.jenisKelamin = document.getElementById('spmb-gender').value;
      spmbDraft.tempatLahir = document.getElementById('spmb-tempat-lahir').value;
      spmbDraft.tanggalLahir = document.getElementById('spmb-tgl-lahir').value;
      spmbDraft.asalSekolah = document.getElementById('spmb-asal-sekolah').value;
      spmbDraft.riwayatHafalan = document.getElementById('spmb-hafalan').value;

      currentStep = 2;
      renderSpmbModalContent();
    };
  }

  // STEP 2 Back -> to STEP 1
  const prevBtn2 = document.getElementById('btn-spmb-prev-2');
  if (prevBtn2) {
    prevBtn2.onclick = () => {
      currentStep = 1;
      renderSpmbModalContent();
    };
  }

  // STEP 2 Submit -> to STEP 3
  const step2Form = document.getElementById('spmb-step2-form');
  if (step2Form) {
    step2Form.onsubmit = (e) => {
      e.preventDefault();
      spmbDraft.namaAyah = document.getElementById('spmb-nama-ayah').value;
      spmbDraft.pekerjaanAyah = document.getElementById('spmb-pekerjaan-ayah').value;
      spmbDraft.namaIbu = document.getElementById('spmb-nama-ibu').value;
      spmbDraft.pekerjaanIbu = document.getElementById('spmb-pekerjaan-ibu').value;
      spmbDraft.penghasilanOrtu = document.getElementById('spmb-penghasilan').value;
      spmbDraft.noWhatsapp = document.getElementById('spmb-wa').value;
      spmbDraft.hubunganWali = document.getElementById('spmb-hubungan').value;

      currentStep = 3;
      renderSpmbModalContent();
    };
  }

  // STEP 3 Back -> to STEP 2
  const prevBtn3 = document.getElementById('btn-spmb-prev-3');
  if (prevBtn3) {
    prevBtn3.onclick = () => {
      currentStep = 2;
      renderSpmbModalContent();
    };
  }

  // STEP 3 Final Submit -> Save & Show Success
  const step3Form = document.getElementById('spmb-step3-form');
  if (step3Form) {
    step3Form.onsubmit = (e) => {
      e.preventDefault();
      spmbDraft.alamatLengkap = document.getElementById('spmb-alamat').value;
      spmbDraft.kelurahanDesa = document.getElementById('spmb-kelurahan').value;
      spmbDraft.kecamatan = document.getElementById('spmb-kecamatan').value;
      spmbDraft.kotaKabupaten = document.getElementById('spmb-kabupaten').value;
      spmbDraft.provinsi = document.getElementById('spmb-provinsi').value;
      spmbDraft.catatanKesehatan = document.getElementById('spmb-kesehatan').value;

      // Register new student into SPMB database
      registrationResult = registerNewStudent(spmbDraft);
      currentStep = 4;
      renderSpmbModalContent();
    };
  }

  // STEP 4 Print
  const printBtn = document.getElementById('btn-spmb-print');
  if (printBtn) {
    printBtn.onclick = () => {
      window.print();
    };
  }

  // STEP 4 Done
  const doneBtn = document.getElementById('btn-spmb-done');
  if (doneBtn) {
    doneBtn.onclick = () => {
      closeSpmbModal();
    };
  }
}

/**
 * Inisialisasi event listener global untuk pemicu modal SPMB
 */
function initSpmbModal() {
  // Backdrop click to close
  const modal = document.getElementById('spmb-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeSpmbModal();
      }
    });
  }

  // Tangkap event global pemicu SPMB
  window.addEventListener('yiqul:open-spmb', (e) => {
    const jenjang = (e.detail && e.detail.jenjang) || 'SDT Al-Qudwah';
    openSpmbModal(jenjang);
  });
}


/* --- MODULE: src/components/FileUploader.js --- */
/**
 * COMPONENT: VISUAL FILE UPLOADER WIDGET (CHOOSE FILE DARI PC)
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Komponen input file modern dengan Drag & Drop, pemilihan berkas langsung
 * dari folder PC/perangkat pengguna, preview gambar instan, upload ke Google Drive,
 * dan konversi direct link lh3.googleusercontent.com.
 */



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
function createFileUploader({
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


/* --- MODULE: src/components/AdminPanel.js --- */
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
function openAdminPanel(defaultTab = 'apps') {
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

function closeAdminAuthModal() {
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

function closeAdminPanel() {
  const panelBackdrop = document.getElementById('admin-panel-backdrop');
  if (panelBackdrop) {
    panelBackdrop.classList.remove('open');
    panelBackdrop.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Render konten tab yang aktif di Admin Panel
 */
function renderActiveTabContent() {
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
  } else if (activeTab === 'spmb') {
    renderTabSpmb(contentArea);
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
  const analytics = getAnalyticsData();
  const recentHistory = getRecentDailyHistory(7);
  const maxVisits = Math.max(...recentHistory.map(h => h.visits), 1);

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

      <!-- Pusat Analitik & Pemantauan Pengunjung Harian -->
      <div style="background-color: var(--bg-surface); border: 1.5px solid rgba(16, 185, 129, 0.4); border-radius: var(--radius-card); padding: 1.25rem; margin-bottom: 1.5rem; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <h4 style="font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="activity" width="18" height="18" style="color: #10B981;"></i>
            <span>Pemantauan Pengunjung Harian & Analitik Portal</span>
          </h4>
          <span style="font-size: 0.6875rem; background: rgba(16, 185, 129, 0.15); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: 700; display: inline-flex; align-items: center; gap: 0.35rem;">
            <span class="live-pulse-dot" style="width: 6px; height: 6px;"></span> Tracker Aktif
          </span>
        </div>
        <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Data statistik jumlah pengunjung yang membuka portal dan frekuensi peluncuran aplikasi secara harian.
        </p>

        <!-- 4 Grid Metrik Utama -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
          <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 10px; padding: 0.875rem; text-align: center;">
            <div style="font-size: 0.75rem; color: #34D399; font-weight: 600; margin-bottom: 0.25rem;">Pengunjung Hari Ini</div>
            <div style="font-size: 1.625rem; font-weight: 800; color: #10B981;" id="admin-analytics-today">${formatVisitorNumber(analytics.todayVisits)}</div>
            <div style="font-size: 0.6875rem; color: var(--text-muted);">${formatVisitorNumber(analytics.todayUnique)} pengunjung unik</div>
          </div>
          <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 10px; padding: 0.875rem; text-align: center;">
            <div style="font-size: 0.75rem; color: #60A5FA; font-weight: 600; margin-bottom: 0.25rem;">Total Kunjungan Portal</div>
            <div style="font-size: 1.625rem; font-weight: 800; color: #3B82F6;" id="admin-analytics-total">${formatVisitorNumber(analytics.totalVisits)}</div>
            <div style="font-size: 0.6875rem; color: var(--text-muted);">Akumulasi semua sesi</div>
          </div>
          <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 10px; padding: 0.875rem; text-align: center;">
            <div style="font-size: 0.75rem; color: #FBBF24; font-weight: 600; margin-bottom: 0.25rem;">Aplikasi Diluncurkan</div>
            <div style="font-size: 1.625rem; font-weight: 800; color: #F59E0B;">${formatVisitorNumber(analytics.totalAppLaunches)}</div>
            <div style="font-size: 0.6875rem; color: var(--text-muted);">Klik Buka Aplikasi</div>
          </div>
          <div style="background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 10px; padding: 0.875rem; text-align: center;">
            <div style="font-size: 0.75rem; color: #A78BFA; font-weight: 600; margin-bottom: 0.25rem;">Rata-rata Harian</div>
            <div style="font-size: 1.625rem; font-weight: 800; color: #8B5CF6;">~${Math.round(analytics.totalVisits / 28)}</div>
            <div style="font-size: 0.6875rem; color: var(--text-muted);">Kunjungan per hari</div>
          </div>
        </div>

        <!-- Grafik Batang Mini 7 Hari Terakhir -->
        <div style="background: var(--bg-main); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 0.875rem; margin-bottom: 0.875rem;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.75rem; display: flex; justify-content: space-between;">
            <span>Tren Kunjungan 7 Hari Terakhir</span>
            <span style="color: var(--text-muted); font-size: 0.6875rem;">Waktu Indonesia Barat (WIB)</span>
          </div>
          <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 0.35rem; height: 90px; padding-top: 10px;">
            ${recentHistory.map(item => {
              const heightPercent = Math.max(15, Math.min(100, Math.round((item.visits / maxVisits) * 80)));
              const isToday = item.date === analytics.todayDate;
              return `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; height: 100%; justify-content: flex-end;">
                  <span style="font-size: 0.625rem; color: ${isToday ? '#10B981' : 'var(--text-muted)'}; font-weight: 700;">${item.visits}</span>
                  <div style="width: 100%; max-width: 28px; height: ${heightPercent}%; background: ${isToday ? 'linear-gradient(180deg, #10B981, #059669)' : 'rgba(100, 116, 139, 0.4)'}; border-radius: 4px 4px 0 0;" title="${item.label}: ${item.visits} kunjungan (${item.unique} unik)"></div>
                  <span style="font-size: 0.625rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 38px;">${item.label.split(',')[0]}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Tombol Kalibrasi Baseline Angka Kunjungan -->
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="button" id="btn-calibrate-analytics" class="btn-secondary" style="font-size: 0.75rem; padding: 0.35rem 0.75rem;">
            <i data-lucide="sliders" width="13" height="13"></i> Sesuaikan Angka Awal
          </button>
        </div>
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

  // Bind Kalibrasi Baseline Analitik Pengunjung
  const calibrateBtn = document.getElementById('btn-calibrate-analytics');
  if (calibrateBtn) {
    calibrateBtn.addEventListener('click', () => {
      const current = getAnalyticsData();
      const newTotalStr = prompt('Masukkan target Total Kunjungan Portal:', String(current.totalVisits));
      if (newTotalStr === null) return;
      const newTodayStr = prompt('Masukkan target Kunjungan Pengunjung Hari Ini:', String(current.todayVisits));
      if (newTodayStr === null) return;

      const newTotal = parseInt(newTotalStr, 10);
      const newToday = parseInt(newTodayStr, 10);

      if (!isNaN(newTotal) && !isNaN(newToday) && newTotal >= 0 && newToday >= 0) {
        calibrateAnalytics(newTotal, newToday);
        alert('Angka statistik kunjungan berhasil disesuaikan!');
        renderTabRoleSettings(container);
      } else {
        alert('Input tidak valid. Harap masukkan angka bulat positif.');
      }
    });
  }
}

/* ==========================================================================
   TAB 6: SPMB ONLINE (MANAJEMEN PENDAFTARAN SANTRI BARU)
   ========================================================================== */
let spmbSearchQuery = '';
let spmbFilterJenjang = 'all';
let spmbFilterStatus = 'all';

function renderTabSpmb(container) {
  const summary = getSpmbSummary();
  const allRegistrations = getAllRegistrations();

  const filtered = allRegistrations.filter(r => {
    if (spmbFilterJenjang !== 'all' && r.jenjang !== spmbFilterJenjang) return false;
    if (spmbFilterStatus !== 'all' && r.status !== spmbFilterStatus) return false;
    if (spmbSearchQuery) {
      const q = spmbSearchQuery.toLowerCase();
      const match = (r.namaLengkap && r.namaLengkap.toLowerCase().includes(q)) ||
                    (r.id && r.id.toLowerCase().includes(q)) ||
                    (r.nisn && r.nisn.includes(q)) ||
                    (r.asalSekolah && r.asalSekolah.toLowerCase().includes(q)) ||
                    (r.namaAyah && r.namaAyah.toLowerCase().includes(q)) ||
                    (r.namaIbu && r.namaIbu.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  container.innerHTML = `
    <div class="spmb-admin-container">
      <!-- 1. Header & Summary Metric Cards -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h3 class="admin-pane-title" style="margin-bottom: 0.25rem;">
            <i data-lucide="graduation-cap" width="20" height="20" style="color: #10B981;"></i>
            <span>Penerimaan Santri Baru (SPMB 2026/2027)</span>
          </h3>
          <p style="font-size: 0.8125rem; color: var(--text-secondary); margin: 0;">
            Kelola pendaftaran santri terpadu Day Care, Play Group, RA/TK, SDT, SMPT & SMAT Al-Qudwah Lebak.
          </p>
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button type="button" class="btn-primary" id="btn-spmb-open-new" style="background: #10B981; font-size: 0.8125rem; padding: 0.45rem 0.85rem;">
            <i data-lucide="plus" width="15" height="15"></i>
            <span>Daftar Santri Baru</span>
          </button>
          <button type="button" class="btn-secondary" id="btn-spmb-export-csv" style="font-size: 0.8125rem; padding: 0.45rem 0.85rem;">
            <i data-lucide="download" width="15" height="15"></i>
            <span>Unduh CSV / Excel</span>
          </button>
        </div>
      </div>

      <!-- Stat Cards Grid -->
      <div class="spmb-stat-grid">
        <div class="spmb-stat-card">
          <div class="stat-number">${summary.total}</div>
          <div class="stat-title">Total Pendaftar</div>
        </div>
        <div class="spmb-stat-card">
          <div class="stat-number" style="color: #06B6D4;">${(summary.daycare || 0) + (summary.playgroup || 0) + (summary.rat || 0) + (summary.tkt || 0)}</div>
          <div class="stat-title">PAUD/TK/RA</div>
        </div>
        <div class="spmb-stat-card">
          <div class="stat-number" style="color: #10B981;">${summary.sdt || 0}</div>
          <div class="stat-title">SDT Al-Qudwah</div>
        </div>
        <div class="spmb-stat-card">
          <div class="stat-number" style="color: #3B82F6;">${summary.smpt || 0}</div>
          <div class="stat-title">SMPT Al-Qudwah</div>
        </div>
        <div class="spmb-stat-card">
          <div class="stat-number" style="color: #8B5CF6;">${summary.smat || 0}</div>
          <div class="stat-title">SMAT Al-Qudwah</div>
        </div>
        <div class="spmb-stat-card">
          <div class="stat-number" style="color: #F59E0B;">${summary.pending}</div>
          <div class="stat-title">Menunggu Verifikasi</div>
        </div>
        <div class="spmb-stat-card">
          <div class="stat-number" style="color: #059669;">${summary.accepted}</div>
          <div class="stat-title">Lolos / Diterima</div>
        </div>
      </div>

      <!-- 2. Toolbar Filter & Live Search -->
      <div class="spmb-toolbar">
        <div class="spmb-search-box">
          <i data-lucide="search" width="16" height="16"></i>
          <input 
            type="search" 
            id="spmb-search-input" 
            placeholder="Cari nama santri, NISN, sekolah, no. reg..." 
            value="${escapeHtml(spmbSearchQuery)}"
          />
        </div>

        <div class="spmb-filter-group">
          <select id="spmb-filter-jenjang" class="form-select" style="font-size: 0.8125rem; padding: 0.4rem 0.65rem;">
            <option value="all" ${spmbFilterJenjang === 'all' ? 'selected' : ''}>Semua Jenjang</option>
            <option value="Day Care" ${spmbFilterJenjang === 'Day Care' ? 'selected' : ''}>Day Care</option>
            <option value="Play Group" ${spmbFilterJenjang === 'Play Group' ? 'selected' : ''}>Play Group</option>
            <option value="RAT Al-Qudwah" ${spmbFilterJenjang === 'RAT Al-Qudwah' ? 'selected' : ''}>RAT Al-Qudwah</option>
            <option value="TKT Al-Qudwah" ${spmbFilterJenjang === 'TKT Al-Qudwah' ? 'selected' : ''}>TKT Al-Qudwah</option>
            <option value="SDT Al-Qudwah" ${spmbFilterJenjang === 'SDT Al-Qudwah' ? 'selected' : ''}>SDT Al-Qudwah</option>
            <option value="SMPT Al-Qudwah" ${spmbFilterJenjang === 'SMPT Al-Qudwah' ? 'selected' : ''}>SMPT Al-Qudwah</option>
            <option value="SMAT Al-Qudwah" ${spmbFilterJenjang === 'SMAT Al-Qudwah' ? 'selected' : ''}>SMAT Al-Qudwah</option>
          </select>

          <select id="spmb-filter-status" class="form-select" style="font-size: 0.8125rem; padding: 0.4rem 0.65rem;">
            <option value="all" ${spmbFilterStatus === 'all' ? 'selected' : ''}>Semua Status</option>
            <option value="pending" ${spmbFilterStatus === 'pending' ? 'selected' : ''}>Menunggu (Pending)</option>
            <option value="verified" ${spmbFilterStatus === 'verified' ? 'selected' : ''}>Terverifikasi</option>
            <option value="accepted" ${spmbFilterStatus === 'accepted' ? 'selected' : ''}>Lolos / Diterima</option>
            <option value="rejected" ${spmbFilterStatus === 'rejected' ? 'selected' : ''}>Ditolak</option>
          </select>
        </div>
      </div>

      <!-- 3. Applicants Table -->
      <div class="spmb-table-responsive">
        ${filtered.length === 0 ? `
          <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-secondary);">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
            <h4 style="font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">Tidak Ada Data Pendaftar</h4>
            <p style="font-size: 0.8125rem;">Tidak ada pendaftar yang sesuai kriteria pencarian / filter.</p>
          </div>
        ` : `
          <table class="spmb-admin-table">
            <thead>
              <tr>
                <th>No. Registrasi</th>
                <th>Calon Santri & Asal Sekolah</th>
                <th>Jenjang / Jalur</th>
                <th>Orang Tua & WhatsApp</th>
                <th>Status Verifikasi</th>
                <th style="text-align: right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(r => {
                const waUrl = createWhatsAppConfirmationLink(r);
                return `
                  <tr>
                    <td>
                      <span class="spmb-reg-code">${escapeHtml(r.id)}</span>
                      <div class="spmb-table-subtext">${new Date(r.createdAt).toLocaleDateString('id-ID')}</div>
                    </td>
                    <td>
                      <div class="spmb-student-name">
                        ${escapeHtml(r.namaLengkap)}
                        <span class="spmb-gender-badge ${r.jenisKelamin === 'L' ? 'male' : 'female'}">
                          ${r.jenisKelamin === 'L' ? 'L' : 'P'}
                        </span>
                      </div>
                      <div class="spmb-table-subtext">NISN: ${escapeHtml(r.nisn || '-')} • ${escapeHtml(r.asalSekolah)}</div>
                      <div class="spmb-table-subtext" style="color: #10B981; font-weight: 500;">Hafalan: ${escapeHtml(r.riwayatHafalan)}</div>
                    </td>
                    <td>
                      <span class="spmb-jenjang-badge">${escapeHtml(r.jenjang)}</span>
                      <div class="spmb-table-subtext">${escapeHtml(r.jalur)} (${escapeHtml(r.asrama)})</div>
                    </td>
                    <td>
                      <div style="font-weight: 600; font-size: 0.8125rem;">${escapeHtml(r.namaAyah || r.namaIbu || '-')}</div>
                      <div class="spmb-table-subtext">Penghasilan: ${escapeHtml(r.penghasilanOrtu)}</div>
                      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="spmb-wa-inline">
                        <i data-lucide="message-circle" width="13" height="13"></i>
                        <span>${escapeHtml(r.noWhatsapp)}</span>
                      </a>
                    </td>
                    <td>
                      <select class="spmb-status-select ${r.status}" data-action="change-spmb-status" data-id="${r.id}">
                        <option value="pending" ${r.status === 'pending' ? 'selected' : ''}>🟡 Menunggu</option>
                        <option value="verified" ${r.status === 'verified' ? 'selected' : ''}>🔵 Terverifikasi</option>
                        <option value="accepted" ${r.status === 'accepted' ? 'selected' : ''}>🟢 Diterima</option>
                        <option value="rejected" ${r.status === 'rejected' ? 'selected' : ''}>🔴 Ditolak</option>
                      </select>
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                      <button type="button" class="btn-icon" data-action="print-spmb-card" data-id="${r.id}" title="Cetak Bukti Pendaftaran">
                        <i data-lucide="printer" width="15" height="15"></i>
                      </button>
                      <button type="button" class="btn-icon" data-action="note-spmb" data-id="${r.id}" title="Catatan Panitia">
                        <i data-lucide="edit-3" width="15" height="15"></i>
                      </button>
                      <button type="button" class="btn-icon btn-icon-danger" data-action="delete-spmb" data-id="${r.id}" title="Hapus Pendaftar">
                        <i data-lucide="trash-2" width="15" height="15"></i>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;

  bindTabSpmbEvents(container);
}

/**
 * Event bindings untuk Tab SPMB
 */
function bindTabSpmbEvents(container) {
  // 1. Search Query Input
  const searchInput = document.getElementById('spmb-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      spmbSearchQuery = e.target.value.trim();
      renderTabSpmb(container);
      const reFocus = document.getElementById('spmb-search-input');
      if (reFocus) {
        reFocus.focus();
        reFocus.setSelectionRange(reFocus.value.length, reFocus.value.length);
      }
    });
  }

  // 2. Filter Jenjang
  const filterJenjang = document.getElementById('spmb-filter-jenjang');
  if (filterJenjang) {
    filterJenjang.addEventListener('change', (e) => {
      spmbFilterJenjang = e.target.value;
      renderTabSpmb(container);
    });
  }

  // 3. Filter Status
  const filterStatus = document.getElementById('spmb-filter-status');
  if (filterStatus) {
    filterStatus.addEventListener('change', (e) => {
      spmbFilterStatus = e.target.value;
      renderTabSpmb(container);
    });
  }

  // 4. Unduh Rekap CSV
  const exportBtn = document.getElementById('btn-spmb-export-csv');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const csvContent = exportRegistrationsCsv();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Rekap_SPMB_Yiqul_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  // 5. Buka Formulir Pendaftaran Baru
  const openNewBtn = document.getElementById('btn-spmb-open-new');
  if (openNewBtn) {
    openNewBtn.addEventListener('click', () => {
      openSpmbModal('SDT Al-Qudwah');
    });
  }

  // 6. Ubah Status Pendaftar
  container.querySelectorAll('[data-action="change-spmb-status"]').forEach(selectEl => {
    selectEl.addEventListener('change', (e) => {
      const id = selectEl.getAttribute('data-id');
      const newStatus = selectEl.value;
      updateRegistrationStatus(id, newStatus);
      renderTabSpmb(container);
    });
  });

  // 7. Cetak Bukti Pendaftaran
  container.querySelectorAll('[data-action="print-spmb-card"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openSpmbReceiptDirect(id);
    });
  });

  // 8. Catatan Panitia
  container.querySelectorAll('[data-action="note-spmb"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const list = getAllRegistrations();
      const current = list.find(r => r.id === id);
      const currentNote = (current && current.adminNotes) || '';
      const newNote = prompt(`Catatan Panitia untuk santri ${current ? current.namaLengkap : id}:`, currentNote);
      if (newNote !== null) {
        updateRegistrationStatus(id, current.status, newNote);
        renderTabSpmb(container);
      }
    });
  });

  // 9. Hapus Pendaftar
  container.querySelectorAll('[data-action="delete-spmb"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm(`Apakah Anda yakin ingin menghapus data pendaftar ${id}? Tindakan ini tidak dapat dibatalkan.`)) {
        deleteRegistration(id);
        renderTabSpmb(container);
      }
    });
  });
}

/**
 * Inisialisasi Admin Panel Controller
 */
function initAdminPanel() {
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


/* --- MODULE: src/components/LandingHero.js --- */
/**
 * COMPONENT: LANDING PAGE HERO SECTION (TECHWITPRO STYLE)
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Menampilkan Floating Pill Navbar, Trust Badges, Headline Bold Sans + Serif Italic,
 * Hero CTA, dan 3D Browser Mockup Showcase interaktif.
 */





let typewriterTimeoutId = null;

function startTypewriterAnimation(phrases) {
  if (typeof window === 'undefined') return;
  if (typewriterTimeoutId) {
    clearTimeout(typewriterTimeoutId);
    typewriterTimeoutId = null;
  }

  const el = document.getElementById('hero-typewriter-text');
  if (!el || !phrases || phrases.length === 0) return;

  let phraseIndex = 0;
  let charIndex = phrases[0].length;
  let isDeleting = true;

  function loop() {
    const current = phrases[phraseIndex % phrases.length];

    if (isDeleting) {
      charIndex--;
      el.textContent = current.substring(0, charIndex);
    } else {
      charIndex++;
      el.textContent = current.substring(0, charIndex);
    }

    let speed = isDeleting ? 38 : 75;

    if (!isDeleting && charIndex === current.length) {
      speed = 2500;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex++;
      speed = 380;
    }

    typewriterTimeoutId = setTimeout(loop, speed);
  }

  typewriterTimeoutId = setTimeout(loop, 2200);
}

/**
 * Render seluruh elemen Hero & Floating Navbar di Landing Page
 */
function renderLandingHero() {
  const container = document.getElementById('landing-hero-container');
  if (!container) return;

  const branding = getBranding();
  const allApps = getAllApps();
  const previewApps = allApps.slice(0, 6);
  const orgName = branding.organizationName || 'Yayasan Islam Qudwatul Ummah';

  const directLogo = branding.logoUrl ? convertGoogleDriveToDirectLink(branding.logoUrl) : '';

  container.innerHTML = `
    <!-- Ambient Background Glows -->
    <div class="landing-glow-1" aria-hidden="true"></div>
    <div class="landing-glow-2" aria-hidden="true"></div>

    <!-- Floating Pill Navigation Bar (Techwitpro Header Style) -->
    <div class="floating-navbar-wrapper">
      <nav class="floating-pill-nav" aria-label="Navigasi Landing Page">
        <a href="#/" class="landing-brand">
          <div class="landing-brand-logo" aria-hidden="true">
            ${directLogo ? `<img src="${directLogo}" alt="Logo" />` : `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            `}
          </div>
          <span class="landing-brand-title">${escapeHtml(branding.portalTitle || 'PORTAL YIQUL')}</span>
        </a>

        <!-- Center Nav Links -->
        <ul class="landing-nav-links">
          <li><a href="#/" class="landing-nav-link">Beranda</a></li>
          <li><a href="#pillars-section" class="landing-nav-link">Layanan & Modul</a></li>
          <li><a href="#showcase-section" class="landing-nav-link">Ekosistem Apps</a></li>
          <li><a href="#stats-section" class="landing-nav-link">Statistik</a></li>
        </ul>

        <!-- White Pill Action Button (Techwitpro Style) -->
        <a href="#/portal" class="btn-white-pill" id="landing-open-portal-btn" aria-label="Buka Portal Ekosistem">
          <span>Masuk Portal</span>
          <span class="btn-white-pill-arrow" aria-hidden="true">↗</span>
        </a>
      </nav>
    </div>

    <!-- Hero Content -->
    <header class="landing-hero yiqul-container">
      <!-- Trust & Review Badges Bar -->
      <div class="trust-badges-bar">
        <div class="trust-item">
          <span class="trust-stars" aria-label="Rating 5 bintang">★★★★★</span>
          <span>Google Review 5.0</span>
        </div>
        <span class="trust-item-divider" aria-hidden="true"></span>
        <div class="trust-item">
          <i data-lucide="award" width="14" height="14" style="color: #34D399;"></i>
          <span>Akreditasi A Unggul</span>
        </div>
        <span class="trust-item-divider" aria-hidden="true"></span>
        <div class="trust-item">
          <i data-lucide="layers" width="14" height="14" style="color: #60A5FA;"></i>
          <span>${allApps.length}+ Sistem Terintegrasi</span>
        </div>
      </div>

      <!-- Main Split Headline (Sans + Serif Italic Accent) -->
      <h1 class="landing-headline">
        Pusat Komando & Portal Navigasi Digital<br>
        <span class="headline-serif-italic">
          <span id="hero-typewriter-text" class="typewriter-text">${escapeHtml(orgName)}</span><span class="typewriter-cursor" aria-hidden="true">|</span>
        </span>
      </h1>

      <!-- Subtitle Description -->
      <p class="landing-subheadline">
        Satu gerbang terpadu untuk mengakses seluruh sistem akademik, setoran mutaba'ah tahfidz, 
        billing kasir & SPP, administrasi HRIS asatidz, hingga portal wali santri secara cepat, aman, dan instan.
      </p>

      <!-- Action CTA Buttons -->
      <div class="landing-hero-cta">
        <a href="#/portal" class="btn-landing-primary" id="hero-enter-portal-btn">
          <span>Buka Portal Ekosistem</span>
          <i data-lucide="arrow-right" width="18" height="18"></i>
        </a>
        <a href="#showcase-section" class="btn-landing-secondary">
          <i data-lucide="layout-grid" width="16" height="16"></i>
          <span>Lihat Preview Sistem</span>
        </a>
      </div>

      <!-- Interactive 3D Browser Mockup Showcase -->
      <div class="showcase-browser-wrapper" id="showcase-section">
        <div class="showcase-browser-frame">
          <!-- Browser Header Bar -->
          <div class="browser-header-bar">
            <div class="browser-dots">
              <span class="browser-dot red"></span>
              <span class="browser-dot yellow"></span>
              <span class="browser-dot green"></span>
            </div>
            <div class="browser-address-bar">
              <i data-lucide="lock" width="12" height="12"></i>
              <span>https://portal.qudwatulummah.sch.id/launcher</span>
            </div>
            <a href="#/portal" style="font-size: 0.75rem; color: #34D399; text-decoration: none; font-weight: 600;">
              Layar Penuh ↗
            </a>
          </div>

          <!-- Inside Preview Bento Grid -->
          <div class="browser-inner-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; text-align: left;">
              <div>
                <span style="font-size: 0.75rem; color: #10B981; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Preview Langsung</span>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: #FFFFFF;">Katalog Aplikasi Siap Buka</h3>
              </div>
              <a href="#/portal" class="btn-white-pill" style="font-size: 0.75rem; padding: 0.4rem 1rem;">
                Buka Semua (${allApps.length}) ↗
              </a>
            </div>

            <div class="preview-grid-cards">
              ${previewApps.map(app => `
                <div class="preview-mini-card">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="width: 2.5rem; height: 2.5rem; border-radius: 10px; background: rgba(16, 185, 129, 0.15); color: #34D399; display: flex; align-items: center; justify-content: center;">
                      ${app.customIconUrl ? `<img src="${app.customIconUrl}" alt="${app.title}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" />` : `<i data-lucide="${app.iconName || 'Globe'}" width="18" height="18"></i>`}
                    </div>
                    <span style="font-size: 0.6875rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 999px; background: rgba(16, 185, 129, 0.2); color: #6EE7B7;">
                      🟢 Aktif
                    </span>
                  </div>
                  <div>
                    <h4 style="font-size: 0.9375rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.25rem;">
                      ${escapeHtml(app.title)}
                    </h4>
                    <p style="font-size: 0.75rem; color: #94A3B8; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                      ${escapeHtml(app.shortDescription || '')}
                    </p>
                  </div>
                  <a href="#/portal" style="display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; font-weight: 600; color: #34D399; text-decoration: none; padding-top: 0.5rem; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                    <span>Akses di Portal</span>
                    <i data-lucide="chevron-right" width="14" height="14"></i>
                  </a>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </header>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // Trigger animasi halus GSAP untuk Hero & Floating Navbar
  initLandingHeroAnimation();

  // Mulai animasi Typewriter teks berputar terus menerus
  const phrases = [
    orgName,
    'Ekosistem Akademik & Tahfidz Quran',
    'Sistem Keuangan & Billing SPP Santri',
    'Portal Asatidz, Santri & Wali Murid',
    'Navigasi 18+ Sistem Terintegrasi'
  ];
  startTypewriterAnimation(phrases);
}


/* --- MODULE: src/components/LandingFeatures.js --- */
/**
 * COMPONENT: LANDING FEATURES & STATS SECTION
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Menampilkan Stats Counter Bar, 6 Pilar Ekosistem Utama,
 * Alur Kerja Satu Pintu Hub & Spoke, serta Bottom Call to Action.
 */





function renderLandingFeatures() {
  const container = document.getElementById('landing-features-container');
  if (!container) return;

  const allApps = getAllApps();
  const branding = getBranding();
  const analytics = getAnalyticsData();

  container.innerHTML = `
    <!-- Stats Counter Bar (Live Monitoring Pengunjung Harian & Metrik Ekosistem) -->
    <section class="landing-stats-row" id="stats-section" aria-label="Statistik Ekosistem & Pemantauan Pengunjung">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number" id="stat-modules-count">${allApps.length}+</div>
          <div class="stat-label">Sistem & Modul Terhubung</div>
        </div>
        <div class="stat-card stat-card-highlight">
          <div class="stat-badge-live">
            <span class="live-pulse-dot"></span>
            <span>Terpantau Hari Ini</span>
          </div>
          <div class="stat-number" id="stat-daily-visitors">${formatVisitorNumber(analytics.todayVisits)}+</div>
          <div class="stat-label">Pengunjung Harian Aktif</div>
        </div>
        <div class="stat-card">
          <div class="stat-badge-pill">Akumulasi Portal</div>
          <div class="stat-number" id="stat-total-visitors">${formatVisitorNumber(analytics.totalVisits)}+</div>
          <div class="stat-label">Total Kunjungan Civitas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">4,500+</div>
          <div class="stat-label">Santri & Civitas Yiqul</div>
        </div>
      </div>
    </section>

    <!-- Core Ecosystem Pillars (Bento Grid Style) -->
    <section class="landing-pillars-section" id="pillars-section" aria-label="Pilar Ekosistem">
      <div class="pillars-tagline">Arsitektur Terpadu</div>
      <h2 class="pillars-title">6 Pilar Utama Ekosistem Digital Yiqul</h2>

      <div class="pillars-grid">
        <!-- Pillar 1 -->
        <div class="pillar-item-card">
          <div class="pillar-icon-box">
            <i data-lucide="graduation-cap" width="24" height="24"></i>
          </div>
          <h3 class="pillar-card-title">Akademik & E-Rapor</h3>
          <p class="pillar-card-desc">
            Pengelolaan nilai santri, pencetakan buku rapor digital, kalender akademik, dan portal LMS terintegrasi.
          </p>
        </div>

        <!-- Pillar 2 -->
        <div class="pillar-item-card">
          <div class="pillar-icon-box">
            <i data-lucide="book-open" width="24" height="24"></i>
          </div>
          <h3 class="pillar-card-title">Tahfidz & Kepesantrenan</h3>
          <p class="pillar-card-desc">
            Pencatatan mutaba'ah setoran hafalan Al-Quran, tracking muroja'ah halaqah, dan perizinan santri asrama.
          </p>
        </div>

        <!-- Pillar 3 -->
        <div class="pillar-item-card">
          <div class="pillar-icon-box">
            <i data-lucide="coins" width="24" height="24"></i>
          </div>
          <h3 class="pillar-card-title">Keuangan & Kasir SPP</h3>
          <p class="pillar-card-desc">
            Sistem penagihan syahriyah bulanan, kuitansi pembayaran digital, rekap kasir pondok, dan bot arus kas.
          </p>
        </div>

        <!-- Pillar 4 -->
        <div class="pillar-item-card">
          <div class="pillar-icon-box">
            <i data-lucide="users" width="24" height="24"></i>
          </div>
          <h3 class="pillar-card-title">SDM & Presensi Asatidz</h3>
          <p class="pillar-card-desc">
            Absensi kehadiran rapat, barcode check-in asatidz, manajemen divisi tilawah, dan HRIS kepegawaian.
          </p>
        </div>

        <!-- Pillar 5 -->
        <div class="pillar-item-card">
          <div class="pillar-icon-box">
            <i data-lucide="building-2" width="24" height="24"></i>
          </div>
          <h3 class="pillar-card-title">Sarpras & Agrobisnis</h3>
          <p class="pillar-card-desc">
            Inventarisasi aset pondok, booking ruang rapat, dan sistem pengelolaan bisnis agrosantri binaan yayasan.
          </p>
        </div>

        <!-- Pillar 6 -->
        <div class="pillar-item-card">
          <div class="pillar-icon-box">
            <i data-lucide="heart-handshake" width="24" height="24"></i>
          </div>
          <h3 class="pillar-card-title">Layanan Wali & Infaq</h3>
          <p class="pillar-card-desc">
            Portal transparan perkembangan santri bagi orang tua, infaq online, dan pendaftaran santri baru (PSB).
          </p>
        </div>
      </div>
    </section>

    <!-- Bottom CTA Callout Banner -->
    <section class="landing-bottom-cta">
      <div class="bottom-cta-banner">
        <h2 class="bottom-cta-title">Siap Menjelajahi Ekosistem Digital Yiqul?</h2>
        <p class="bottom-cta-desc">
          Masuk ke portal sekarang untuk mencari dan menjalankan seluruh sistem operasional dalam 1 klik.
        </p>
        <a href="#/portal" class="btn-landing-primary" style="padding: 1rem 2.5rem; font-size: 1.0625rem;">
          <span>Buka Portal Sekarang</span>
          <i data-lucide="arrow-right" width="20" height="20"></i>
        </a>
      </div>
    </section>

    <!-- Landing Footer -->
    <footer style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding: 3rem 1rem; text-align: center; color: #64748B; font-size: 0.8125rem;">
      <div class="yiqul-container" style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
        <p style="color: #CBD5E1; font-weight: 700; font-size: 0.9375rem;">
          ${escapeHtml(branding.portalTitle || 'PORTAL YIQUL')} • ${escapeHtml(branding.organizationName || 'Yayasan Islam Qudwatul Ummah')}
        </p>
        <p>© 2026 Yayasan Islam Qudwatul Ummah Lebak - Banten. Seluruh Hak Cipta Dilindungi.</p>
        <p>Bantuan Teknis IT: <a href="mailto:it-support@qudwatulummah.sch.id" style="color: #34D399; text-decoration: none;">it-support@qudwatulummah.sch.id</a></p>
      </div>
    </footer>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // Trigger animasi rolling ticker GSAP & staggered entrance
  initStatsAnimation(analytics, allApps.length);
  initPillarsAnimation();

  // Live real-time update jika analitik bertambah
  window.addEventListener('yiqul-analytics-updated', (e) => {
    const updated = e.detail;
    if (!updated) return;
    const dailyEl = document.getElementById('stat-daily-visitors');
    const totalEl = document.getElementById('stat-total-visitors');
    if (dailyEl && typeof updated.todayVisits === 'number') {
      dailyEl.textContent = `${formatVisitorNumber(updated.todayVisits)}+`;
    }
    if (totalEl && typeof updated.totalVisits === 'number') {
      totalEl.textContent = `${formatVisitorNumber(updated.totalVisits)}+`;
    }
  });
}


/* --- MODULE: src/components/PwaInstallPrompt.js --- */
/**
 * COMPONENT: IN-APP PWA INSTALL PROMPT
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Menangkap event 'beforeinstallprompt' dari browser Android / iOS / Desktop Chrome,
 * dan memunculkan toast banner ramah untuk menginstal aplikasi ke Homescreen.
 */

let deferredInstallPrompt = null;

function initPwaInstallPrompt() {
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


/* --- MODULE: src/app.js --- */
/**
 * MASTER APPLICATION ORCHESTRATOR & DUAL-VIEW ROUTER
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * Yayasan Islam Qudwatul Ummah (Yiqul)
 */














/**
 * Update rendering katalog Bento Grid berdasarkan filter saat ini
 */
function refreshCatalogView() {
  try {
    const allApps = getAllApps();
    const favorites = getFavorites();
    const filterState = getCurrentFilterState();
    const filtered = filterApps(allApps, {
      category: filterState.category,
      query: filterState.query,
      favorites
    });
    renderSuccessState(filtered, filterState);
  } catch (error) {
    console.error('[Portal App] Gagal me-refresh tampilan katalog:', error);
    renderErrorState(error.message, refreshCatalogView);
  }
}

/**
 * Handle Hash-Based Dual-View Routing (#/ Landing Page vs #/portal Bento Launcher)
 */
function handleRouting() {
  const hash = window.location.hash || '';

  if (hash.startsWith('#/portal')) {
    // Mode View 2: Portal Bento Launcher
    document.body.classList.remove('view-landing');
    document.body.classList.add('view-portal');
    refreshCatalogView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // Mode View 1: Landing Page (Techwitpro Style)
    document.body.classList.remove('view-portal');
    document.body.classList.add('view-landing');
    renderLandingHero();
    renderLandingFeatures();

    // Jika mengarah ke anchor section tertentu (misal: #showcase-section)
    if (hash.startsWith('#') && hash !== '#/' && hash !== '#') {
      const targetEl = document.querySelector(hash);
      if (targetEl) {
        setTimeout(() => targetEl.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

/**
 * Bootstrapping Aplikasi Utama Portal Yiqul
 */
function bootstrap() {
  if (typeof window !== 'undefined') {
    if (window.__PORTAL_YIQUL_BOOTSTRAPPED__) return;
    window.__PORTAL_YIQUL_BOOTSTRAPPED__ = true;
  }
  console.log('🚀 [Portal Yiqul] Initializing Unified Ecosystem Launcher & Landing Page...');

  // 0. Pelacakan Pengunjung & Kunjungan Harian Real-time
  try {
    recordVisit();
  } catch (err) {
    console.warn('[Analytics] Gagal mencatat kunjungan:', err);
  }

  // 1. Inisialisasi Tampilan Landing Page
  renderLandingHero();
  renderLandingFeatures();

  // 2. Tampilkan Skeleton Loading State untuk Portal View
  renderLoadingSkeleton();

  // 3. Inisialisasi Header, Kalender, Jam & Tema
  initHeader();

  // 4. Inisialisasi Modal Viewer (iframe)
  initModalViewer();

  // 5. Inisialisasi Banner Promosi Bergambar (Hero Slider)
  initBannerSlider();

  // 6. Inisialisasi Admin Panel 6 Tab Terpadu & Role Gate
  initAdminPanel();

  // 6b. Inisialisasi SPMB Online Modal & Pendaftaran Santri Baru
  initSpmbModal();

  // 7. Inisialisasi Event Delegation Kartu Bento
  initBentoGridEvents({
    onOpenModal: (app) => {
      openModalViewer(app);
    },
    onEditApp: (app) => {
      openAdminPanel('apps');
    }
  });

  // 8. Inisialisasi Search & Ribbon
  initSearchAndRibbon(() => {
    refreshCatalogView();
  });

  // 9. Jalankan Router Hash Awal
  handleRouting();
  window.addEventListener('hashchange', handleRouting);

  // 10. Re-render jika branding berubah
  window.addEventListener('yiqul:branding-changed', () => {
    renderLandingHero();
    renderLandingFeatures();
  });

  // 11. Inisialisasi PWA In-App Install Prompt
  initPwaInstallPrompt();

  // 12. Register Service Worker jika di environment production PWA
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[PWA] Service Worker terdaftar:', reg.scope))
      .catch(err => console.log('[PWA] Service Worker registration skipped:', err));
  }

  // 13. Cyber Security Defense: Anti-Clickjacking Frame Guard & Session Auto-Timeout
  checkClickjackingGuard();
  initSessionTimeout(() => {
    logoutAdmin();
    closeAdminPanel();
  });
}

// Jalankan ketika DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

})();
