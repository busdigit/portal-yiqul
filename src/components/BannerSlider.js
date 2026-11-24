/**
 * COMPONENT: DYNAMIC PROMO & HERO IMAGE BANNER
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Menampilkan banner gambar promosi, pengumuman akbar, dan agenda yayasan
 * yang diunggah oleh admin melalui Google Drive dengan tautan aksi dinamis.
 */

import { getBanners } from '../services/storage.js';
import { escapeHtml, sanitizeUrl } from '../services/sanitizer.js';
import { convertGoogleDriveToDirectLink } from '../services/uploader.js';

let currentSlideIndex = 0;
let slideInterval = null;

/**
 * Render komponen Banner Slider di halaman depan beranda
 */
export function renderBannerSlider() {
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
  const isJadwalAction = Boolean(
    (currentBanner.actionUrl && (currentBanner.actionUrl.includes('jadwal') || currentBanner.actionUrl === '#jadwal')) ||
    (currentBanner.actionText && currentBanner.actionText.toLowerCase().includes('jadwal'))
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
          ` : isJadwalAction ? `
            <button type="button" class="btn-primary banner-cta-btn" data-action="open-jadwal" style="background: #10B981;">
              <span>${safeActionText}</span>
              <i data-lucide="calendar" width="16" height="16"></i>
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
export function initBannerSlider() {
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
      const jadwalBtn = e.target.closest('[data-action="open-jadwal"]');
      if (jadwalBtn) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('yiqul:open-jadwal'));
      }
    });
  }
}
