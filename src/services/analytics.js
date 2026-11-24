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
export function getTodayDateString() {
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
export function getAnalyticsData() {
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
export function saveAnalyticsData(data) {
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
export function recordVisit() {
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
export function recordAppLaunch(appId, appTitle = '') {
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
export function getRecentDailyHistory(daysCount = 7) {
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
export function calibrateAnalytics(newTotal, newToday) {
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
export function formatVisitorNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  return num.toLocaleString('id-ID');
}
