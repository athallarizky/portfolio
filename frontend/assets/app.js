/* Personal Portfolio — shared interactions
 * - Theme toggle (light/dark) persisted in localStorage
 * - Mobile sidebar drawer
 * - Sidebar collapse (desktop)
 * - Active nav highlight based on current file
 * - Mobile doc-height setter (avoids URL-bar resize bug)
 */

(function () {
  'use strict';

  /* ---------- doc-height (mirrors Blinko's var(--doc-height)) ---------- */
  function setDocHeight() {
    document.documentElement.style.setProperty('--doc-height', window.innerHeight + 'px');
  }
  setDocHeight();
  window.addEventListener('resize', setDocHeight);
  window.addEventListener('orientationchange', setDocHeight);

  /* ---------- Theme ---------- */
  var STORAGE_KEY = 'portfolio-theme';

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.setAttribute('icon', theme === 'dark' ? 'solar:sun-bold' : 'solar:moon-bold');
    }
  }

  function initTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    applyTheme(saved);

    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var isDark = document.documentElement.classList.contains('dark');
        var next = isDark ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
      });
    }
  }

  /* ---------- Active nav ---------- */
  function basename() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    return path === '' ? 'index.html' : path;
  }

  function initActiveNav() {
    var current = basename();
    var links = document.querySelectorAll('.sidebar-link[data-page]');
    links.forEach(function (link) {
      var target = link.getAttribute('data-page');
      // tooltip from the visible label — essential when sidebar is collapsed
      var label = link.querySelector('.label');
      if (label && !link.getAttribute('title')) {
        link.setAttribute('title', label.textContent.trim());
      }
      if (target === current) link.classList.add('is-active');
    });
  }

  /* ---------- Mobile drawer ---------- */
  function initMobileDrawer() {
    var sidebar = document.getElementById('sidebar');
    var backdrop = document.getElementById('sidebar-backdrop');
    var hamburger = document.getElementById('hamburger');
    if (!sidebar || !backdrop) return;

    function open()  { sidebar.classList.add('is-open');  backdrop.classList.add('is-open'); }
    function close() { sidebar.classList.remove('is-open'); backdrop.classList.remove('is-open'); }

    if (hamburger) hamburger.addEventListener('click', open);
    backdrop.addEventListener('click', close);
    sidebar.querySelectorAll('.sidebar-link').forEach(function (l) {
      l.addEventListener('click', close);
    });

    // close on resize to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) close();
    });
  }

  /* ---------- Desktop collapse ---------- */
  function initSidebarCollapse() {
    var toggle = document.getElementById('sidebar-collapse');
    var sidebar = document.getElementById('sidebar');
    if (!toggle || !sidebar) return;
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('is-collapsed');
      localStorage.setItem('portfolio-sidebar-collapsed', sidebar.classList.contains('is-collapsed') ? '1' : '0');
    });
    if (localStorage.getItem('portfolio-sidebar-collapsed') === '1') {
      sidebar.classList.add('is-collapsed');
    }
  }

  /* ---------- Mobile nav highlight for header title ---------- */
  function initPageTitle() {
    var el = document.getElementById('page-title');
    if (!el) return;
    var map = {
      'index.html': 'Home',
      'projects.html': 'Projects',
      'blogs.html': 'Blogs',
      'documents.html': 'Documents',
      'social.html': 'Socials'
    };
    el.textContent = map[basename()] || 'Portfolio';
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initActiveNav();
    initMobileDrawer();
    initSidebarCollapse();
    initPageTitle();
  });
})();
