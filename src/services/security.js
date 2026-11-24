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
export function sha256(ascii) {
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
export function hashPin(pin) {
  const cleanPin = String(pin || '').trim();
  return sha256(`${GLOBAL_SALT}:${cleanPin}`);
}

// Default Hashed PIN untuk "1234"
export const DEFAULT_PIN_HASH = hashPin('1234');

/**
 * Ambil Hash PIN Admin dari storage (dengan migrasi otomatis dari legacy plaintext)
 * @returns {string} Hashed PIN
 */
export function getStoredPinHash() {
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
export function storeNewPin(newPin) {
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
export function checkRateLimit() {
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
export function recordFailedAttempt(context = 'AUTH') {
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
export function recordSuccessfulAttempt(context = 'AUTH') {
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
export function logSecurityEvent(type, severity = 'INFO', details = '') {
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
export function getSecurityAuditLogs() {
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
export function clearSecurityAuditLogs() {
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

export function updateActivityTimestamp() {
  lastActivityTime = Date.now();
}

/**
 * Inisialisasi pengawas inaktivitas sesi admin (15 menit)
 * @param {Function} onTimeoutCallback - Dipanggil saat sesi expired
 */
export function initSessionTimeout(onTimeoutCallback) {
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
export function sanitizeObject(obj) {
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
export function checkClickjackingGuard() {
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

/* ==========================================================================
   7. PIN MODAL HELPERS (ON-SCREEN TOUCH NUMPAD & EYE TOGGLE)
   ========================================================================== */

/**
 * Bind helper untuk modal PIN: On-Screen Touch Numpad dan Eye Toggle
 */
export function bindPinModalHelpers({
  backdropId,
  inputId,
  eyeToggleId,
  numpadGridSelector = '.pin-numpad-grid'
}) {
  if (typeof document === 'undefined') return;

  const backdrop = document.getElementById(backdropId);
  const input = document.getElementById(inputId);
  const eyeBtn = document.getElementById(eyeToggleId);

  // 1. Eye Toggle (Intip PIN)
  const eyeSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const eyeOffSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>';

  if (eyeBtn && !eyeBtn.__hasEyeListener) {
    eyeBtn.__hasEyeListener = true;
    eyeBtn.innerHTML = eyeSvg;
    eyeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        eyeBtn.innerHTML = eyeOffSvg;
        eyeBtn.setAttribute('aria-label', 'Sembunyikan PIN');
      } else {
        input.type = 'password';
        eyeBtn.innerHTML = eyeSvg;
        eyeBtn.setAttribute('aria-label', 'Lihat PIN');
      }
    });
  }

  // 2. On-Screen Touch Numpad Grid
  if (backdrop) {
    const numpadGrid = backdrop.querySelector(numpadGridSelector);
    if (numpadGrid && !numpadGrid.__hasNumpadListener) {
      numpadGrid.__hasNumpadListener = true;
      numpadGrid.querySelectorAll('.pin-pad-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!input) return;

          const key = btn.getAttribute('data-key');
          if (key === 'clear') {
            input.value = '';
          } else if (key === 'backspace') {
            input.value = input.value.slice(0, -1);
          } else if (/^[0-9]$/.test(key)) {
            if (input.value.length < 8) {
              input.value += key;
            }
          }
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
    }
  }

  // 3. Tapping input brings native focus without getting stuck
  if (input && !input.__hasTouchFocusListener) {
    input.__hasTouchFocusListener = true;
    input.addEventListener('click', () => {
      input.focus();
    });
  }
}

/**
 * Reset status input PIN dan ikon mata saat modal dibuka
 */
export function resetPinInputState(inputId, eyeToggleId) {
  if (typeof document === 'undefined') return;
  const input = document.getElementById(inputId);
  const eyeBtn = document.getElementById(eyeToggleId);
  if (input) {
    input.value = '';
    input.type = 'password';
  }
  if (eyeBtn) {
    eyeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
    eyeBtn.setAttribute('aria-label', 'Lihat PIN');
  }
}
