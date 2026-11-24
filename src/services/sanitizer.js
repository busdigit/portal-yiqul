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
export function sanitizeUrl(url) {
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
export function isValidUrl(url) {
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
export function escapeHtml(str) {
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
export function getSafeLinkAttributes(targetMode = '_blank') {
  if (targetMode === '_blank') {
    return 'target="_blank" rel="noopener noreferrer"';
  }
  if (targetMode === '_self') {
    return 'target="_self"';
  }
  // Untuk mode iframe, tombol dikontrol via JavaScript event handler
  return 'data-modal="iframe" role="button"';
}
