/**
 * COMPONENT: LANDING PAGE HERO SECTION (TECHWITPRO STYLE)
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Menampilkan Floating Pill Navbar, Trust Badges, Headline Bold Sans + Serif Italic,
 * Hero CTA, dan 3D Browser Mockup Showcase interaktif.
 */

import { getBranding, getAllApps } from '../services/storage.js';
import { escapeHtml } from '../services/sanitizer.js';
import { convertGoogleDriveToDirectLink } from '../services/uploader.js';

/**
 * Render seluruh elemen Hero & Floating Navbar di Landing Page
 */
export function renderLandingHero() {
  const container = document.getElementById('landing-hero-container');
  if (!container) return;

  const branding = getBranding();
  const allApps = getAllApps();
  const previewApps = allApps.slice(0, 6);

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
        <span class="headline-serif-italic">${escapeHtml(branding.organizationName || 'Yayasan Islam Qudwatul Ummah')}</span>
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
}
