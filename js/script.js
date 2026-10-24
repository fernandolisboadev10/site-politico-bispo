(function () {
  'use strict';

  var header = document.getElementById('header');
  var menuToggle = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');
  var navLinks = document.querySelectorAll('.nav__link');

  /* ---- Header com sombra ao rolar ---- */
  function onScroll() {
    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Menu mobile ---- */
  function closeMenu() {
    nav.classList.remove('is-open');
    menuToggle.classList.remove('is-active');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    menuToggle.classList.toggle('is-active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* ---- Nav ativo conforme a seção visível ---- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
    });
  }

  var navObserver = new IntersectionObserver(function (entries) {
    var visible = entries
      .filter(function (entry) { return entry.isIntersecting; })
      .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });

    if (visible.length > 0) {
      setActiveLink(visible[0].target.getAttribute('id'));
    }
  }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });

  sections.forEach(function (section) { navObserver.observe(section); });

  /* ---- Animações de entrada (fade-in-up) ---- */
  var revealEls = document.querySelectorAll('.reveal');

  var revealObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* ---- Galeria: setas do carrossel ---- */
  var galleryWrap = document.getElementById('galleryTrackWrap');
  var galleryPrev = document.getElementById('galleryPrev');
  var galleryNext = document.getElementById('galleryNext');

  if (galleryWrap && galleryPrev && galleryNext) {
    function galleryStep() {
      var slide = galleryWrap.querySelector('.gallery-slide');
      if (!slide) return galleryWrap.clientWidth;
      var style = window.getComputedStyle(slide.parentElement);
      var gap = parseFloat(style.columnGap || style.gap) || 0;
      return slide.getBoundingClientRect().width + gap;
    }

    function updateGalleryArrows() {
      var maxScroll = galleryWrap.scrollWidth - galleryWrap.clientWidth;
      galleryPrev.disabled = galleryWrap.scrollLeft <= 4;
      galleryNext.disabled = galleryWrap.scrollLeft >= maxScroll - 4;
    }

    galleryPrev.addEventListener('click', function () {
      galleryWrap.scrollBy({ left: -galleryStep() * 2, behavior: 'smooth' });
    });

    galleryNext.addEventListener('click', function () {
      galleryWrap.scrollBy({ left: galleryStep() * 2, behavior: 'smooth' });
    });

    galleryWrap.addEventListener('scroll', updateGalleryArrows, { passive: true });
    window.addEventListener('resize', updateGalleryArrows);
    updateGalleryArrows();
  }

})();
