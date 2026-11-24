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
export function hasGsap() {
  return typeof window !== 'undefined' && typeof window.gsap !== 'undefined';
}

/**
 * Cek preferensi aksesibilitas pengguna (prefers-reduced-motion)
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Inisialisasi animasi entrance Landing Page Hero & Navbar
 */
export function initLandingHeroAnimation() {
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
export function animateCounterNumber(element, targetValue, suffix = '+') {
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
export function initStatsAnimation(analyticsData, totalModules = 19) {
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
export function initPillarsAnimation() {
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
export function animateBentoGridCards(containerSelector = '#main-bento-grid') {
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
export function animateModalOpen(modalContainer) {
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
