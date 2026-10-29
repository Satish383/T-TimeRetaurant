/* ==========================================================
   T-Time Family Restaurant — Main JavaScript
   ========================================================== */

(function () {
  'use strict';

  /* ---------- DOM Ready ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initNavbarScroll();
    initSmoothScroll();
    initActiveNavLinks();
    initRevealAnimations();
    initMenuFilter();
    initGalleryLightbox();
    initBackToTop();
    setCurrentYear();
  });

  /* ---------- Navbar scroll state ---------- */
  function initNavbarScroll() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;

    function updateNav() {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }

    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
  }

  /* ---------- Smooth scrolling for internal links ---------- */
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        // Close mobile navbar if open
        const navCollapse = document.getElementById('navMenu');
        if (navCollapse && navCollapse.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) bsCollapse.hide();
          else new bootstrap.Collapse(navCollapse, { toggle: true }).hide();
        }

        const navHeight = document.getElementById('mainNav')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  function initActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    if (!sections.length || !navLinks.length) return;

    function updateActive() {
      const scrollPos = window.scrollY + 120;

      let currentId = '';
      sections.forEach(function (section) {
        if (section.offsetTop <= scrollPos) {
          currentId = section.getAttribute('id');
        }
      });

      navLinks.forEach(function (link) {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === '#' + currentId) {
          link.classList.add('active');
        }
      });
    }

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
  }

  /* ---------- Scroll reveal with IntersectionObserver ---------- */
  function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything
      reveals.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Menu category filtering ---------- */
  function initMenuFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    if (!filterBtns.length || !menuItems.length) return;

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Set active button
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');

        const filter = this.getAttribute('data-filter');

        menuItems.forEach(function (item) {
          const category = item.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            item.classList.remove('hidden');
            // Re-trigger reveal animation
            item.classList.remove('revealed');
            // Force reflow
            void item.offsetWidth;
            item.classList.add('revealed');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

  /* ---------- Gallery lightbox ---------- */
  function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    if (!galleryItems.length || !lightbox || !lightboxImg) return;

    // Build image data from DOM
    const images = [];
    galleryItems.forEach(function (item) {
      const img = item.querySelector('img');
      if (img) {
        images.push({ src: img.src, alt: img.alt });
      }
    });

    let currentIndex = 0;

    function openLightbox(index) {
      if (index < 0 || index >= images.length) return;
      currentIndex = index;
      lightboxImg.src = images[currentIndex].src;
      lightboxImg.alt = images[currentIndex].alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      // Return focus to the triggering item
      if (galleryItems[currentIndex]) {
        galleryItems[currentIndex].focus();
      }
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      lightboxImg.src = images[currentIndex].src;
      lightboxImg.alt = images[currentIndex].alt;
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % images.length;
      lightboxImg.src = images[currentIndex].src;
      lightboxImg.alt = images[currentIndex].alt;
    }

    galleryItems.forEach(function (item, index) {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', 'View image ' + (index + 1));

      item.addEventListener('click', function () { openLightbox(index); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    // Close on backdrop click
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard controls
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('active')) return;

      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showPrev();
      else if (e.key === 'ArrowRight') showNext();
    });
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    function toggleVisibility() {
      if (window.scrollY > 500) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Footer year ---------- */
  function setCurrentYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }
})();