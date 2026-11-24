/**
 * COMPONENT: LANDING FEATURES & STATS SECTION
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Menampilkan Stats Counter Bar, 6 Pilar Ekosistem Utama,
 * Alur Kerja Satu Pintu Hub & Spoke, serta Bottom Call to Action.
 */

import { getAllApps, getBranding } from '../services/storage.js';
import { escapeHtml } from '../services/sanitizer.js';
import { getAnalyticsData, formatVisitorNumber } from '../services/analytics.js';

export function renderLandingFeatures() {
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
          <div class="stat-number">${allApps.length}+</div>
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
