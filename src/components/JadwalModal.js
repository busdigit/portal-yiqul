/**
 * COMPONENT: JADWAL & AGENDA KEGIATAN YAYASAN INTERACTIVE MODAL
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * Yayasan Islam Qudwatul Ummah (Yiqul)
 * 
 * Menampilkan jadwal agenda resmi (Wisuda Tahfidz, MPLS, Ujian Sanad, Silaturahmi Wali)
 * dengan filter kategori dinamis, penanda waktu, dan informasi lokasi.
 */

import { getSchedules } from '../services/storage.js';
import { escapeHtml } from '../services/sanitizer.js';

let activeCategoryFilter = 'all';

/**
 * Format string tanggal YYYY-MM-DD ke format Indonesia (Contoh: "20 Des 2026")
 * @param {string} dateStr 
 * @returns {{day: string, month: string, year: string, full: string}}
 */
function parseScheduleDate(dateStr) {
  if (!dateStr) {
    return { day: '--', month: '---', year: '----', full: '-' };
  }
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
  const fullMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parts[0];
    const mIdx = parseInt(parts[1], 10) - 1;
    const d = parts[2];
    const mShort = months[mIdx] || 'BLN';
    const mFull = fullMonths[mIdx] || '';
    return {
      day: d,
      month: mShort,
      year: y,
      full: `${parseInt(d, 10)} ${mFull} ${y}`
    };
  }
  return { day: '01', month: 'KEG', year: '2026', full: dateStr };
}

/**
 * Buka modal jadwal kegiatan yayasan
 * @param {string} prefillCategory - 'all' | 'Tahfidz' | 'Akademik' | 'Yayasan'
 */
export function openJadwalModal(prefillCategory = 'all') {
  activeCategoryFilter = prefillCategory;
  const modal = document.getElementById('jadwal-modal');
  if (!modal) return;

  renderJadwalModalContent();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Tutup modal jadwal kegiatan yayasan
 */
export function closeJadwalModal() {
  const modal = document.getElementById('jadwal-modal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Render seluruh isi antarmuka modal jadwal
 */
function renderJadwalModalContent() {
  const modal = document.getElementById('jadwal-modal');
  if (!modal) return;

  const allSchedules = getSchedules();
  const filtered = activeCategoryFilter === 'all'
    ? allSchedules
    : allSchedules.filter(s => s.category.toLowerCase() === activeCategoryFilter.toLowerCase());

  modal.innerHTML = `
    <div class="modal-container jadwal-modal-window">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-title-group">
          <div class="brand-logo-badge" style="background: rgba(16, 185, 129, 0.15); color: #10B981;" aria-hidden="true">
            <i data-lucide="calendar" width="20" height="20"></i>
          </div>
          <div>
            <h3 class="modal-title">Jadwal & Agenda Kegiatan Yayasan</h3>
            <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 500;">
              Pesantren & Sekolah Terpadu Islam Qudwatul Ummah Lebak
            </span>
          </div>
        </div>
        <button type="button" class="btn-icon" id="jadwal-close-btn" aria-label="Tutup Jadwal">
          <i data-lucide="x" width="20" height="20"></i>
        </button>
      </div>

      <!-- Filter Kategori Kapsul -->
      <div style="padding: 0.75rem 1.25rem; background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle); display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
        <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-right: 0.25rem;">Filter:</span>
        <button type="button" class="jadwal-filter-pill ${activeCategoryFilter === 'all' ? 'active' : ''}" data-cat="all">
          Semua (${allSchedules.length})
        </button>
        <button type="button" class="jadwal-filter-pill ${activeCategoryFilter === 'Tahfidz' ? 'active' : ''}" data-cat="Tahfidz">
          📖 Tahfidz
        </button>
        <button type="button" class="jadwal-filter-pill ${activeCategoryFilter === 'Akademik' ? 'active' : ''}" data-cat="Akademik">
          🎓 Akademik
        </button>
        <button type="button" class="jadwal-filter-pill ${activeCategoryFilter === 'Yayasan' ? 'active' : ''}" data-cat="Yayasan">
          🏛️ Yayasan
        </button>
      </div>

      <!-- Timeline List -->
      <div class="jadwal-timeline-list">
        ${filtered.length === 0 ? `
          <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
            <i data-lucide="calendar-x" width="40" height="40" style="margin-bottom: 0.5rem; opacity: 0.5;"></i>
            <p style="font-weight: 600; font-size: 0.9375rem;">Tidak ada agenda di kategori ini</p>
            <p style="font-size: 0.8125rem;">Silakan pilih filter lain atau hubungi Asatidz/Sekretariat.</p>
          </div>
        ` : filtered.map(item => {
          const dateObj = parseScheduleDate(item.date);
          return `
            <div class="jadwal-card">
              <div class="jadwal-date-badge">
                <span class="jadwal-date-day">${escapeHtml(dateObj.day)}</span>
                <span class="jadwal-date-month">${escapeHtml(dateObj.month)}</span>
              </div>
              <div class="jadwal-card-info">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; flex-wrap: wrap;">
                  <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">
                    ${escapeHtml(item.title)}
                  </h4>
                  <span class="jadwal-badge-cat cat-${item.category.toLowerCase()}">
                    ${escapeHtml(item.category)}
                  </span>
                </div>
                
                ${item.description ? `
                  <p style="margin: 0.35rem 0 0.5rem 0; font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.45;">
                    ${escapeHtml(item.description)}
                  </p>
                ` : ''}

                <div style="display: flex; gap: 0.875rem; flex-wrap: wrap; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
                  <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                    <i data-lucide="clock" width="13" height="13" style="color: #10B981;"></i>
                    ${escapeHtml(item.time || 'Waktu Menyesuaikan')}
                  </span>
                  <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                    <i data-lucide="map-pin" width="13" height="13" style="color: #3B82F6;"></i>
                    ${escapeHtml(item.location || 'Kampus Al-Qudwah')}
                  </span>
                  ${item.speakerOrHost ? `
                    <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                      <i data-lucide="user-check" width="13" height="13" style="color: #8B5CF6;"></i>
                      ${escapeHtml(item.speakerOrHost)}
                    </span>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Modal Footer -->
      <div style="padding: 0.875rem 1.25rem; background: var(--bg-surface); border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.75rem; color: var(--text-muted);">
          * Jadwal dapat disesuaikan sewaktu-waktu oleh Sekretariat Yayasan.
        </span>
        <button type="button" class="btn-primary" id="jadwal-ok-btn" style="padding: 0.4rem 1rem; font-size: 0.8125rem;">
          Tutup
        </button>
      </div>
    </div>
  `;

  // Bind Event Listeners
  const closeBtn = modal.querySelector('#jadwal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeJadwalModal);

  const okBtn = modal.querySelector('#jadwal-ok-btn');
  if (okBtn) okBtn.addEventListener('click', closeJadwalModal);

  // Filter Kapsul
  modal.querySelectorAll('.jadwal-filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategoryFilter = btn.getAttribute('data-cat') || 'all';
      renderJadwalModalContent();
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    });
  });

  // Klik backdrop luar
  if (!modal.__hasBackdropListener) {
    modal.__hasBackdropListener = true;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeJadwalModal();
      }
    });
  }
}
