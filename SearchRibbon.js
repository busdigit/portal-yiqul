/**
 * COMPONENT: SEARCH & CATEGORY RIBBON
 * Portal Yiqul - Unified Digital Ecosystem Launcher
 * 
 * Mengelola bilah pencarian instan, shortcut keyboard global (Ctrl+K, /),
 * dan ribbon kategori yang dapat digeser secara horizontal.
 */

import { CATEGORIES } from '../data/defaultApps.js';
import { getFavorites, getAllApps } from '../services/storage.js';

let activeCategory = 'all';
let searchQuery = '';
let onFilterChangeCallback = null;

/**
 * Filter daftar aplikasi berdasarkan kategori dan kata kunci pencarian
 * @param {Array} apps
 * @param {Object} filterOptions
 * @returns {Array}
 */
export function filterApps(apps, { category = 'all', query = '', favorites = [] } = {}) {
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
export function renderCategoryRibbon(allApps = getAllApps(), favorites = getFavorites()) {
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
export function setActiveCategory(categoryId) {
  activeCategory = categoryId;
  renderCategoryRibbon();
  triggerFilterChange();
}

/**
 * Inisialisasi bilah pencarian dan keyboard shortcuts
 * @param {Function} onFilterChange
 */
export function initSearchAndRibbon(onFilterChange) {
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
export function resetFilters() {
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
export function getCurrentFilterState() {
  return {
    category: activeCategory,
    query: searchQuery
  };
}
