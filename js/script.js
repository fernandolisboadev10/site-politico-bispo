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

  /* ---- Barra de progresso da rolagem (JS puro: funciona também no celular) ---- */
  var progressBar = document.getElementById('scrollProgress');

  function updateProgress() {
    var root = document.documentElement;
    var max = root.scrollHeight - window.innerHeight;
    var y = window.pageYOffset || root.scrollTop || document.body.scrollTop || 0;
    var ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    progressBar.style.transform = 'scaleX(' + ratio + ')';
  }

  if (progressBar) {
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    window.addEventListener('load', updateProgress);
    updateProgress();
  }

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

  /* ---- Animações de entrada: Motion + scroll reveal ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var M = window.Motion;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motionOk = M && M.animate && M.inView && M.scroll;

  function showNow(el) { el.classList.add('is-visible'); }

  if (!motionOk) {
    // Sem Motion (CDN bloqueada): revela só com fade via CSS.
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          showNow(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Com "reduzir movimento" (comum em celulares): só fade suave, sem deslocamento,
    // contador nem parallax.
    var EASE = [0.16, 1, 0.3, 1];

    // Atraso escalonado entre irmãos .reveal (cards de valores, propostas etc.)
    function siblingDelay(el) {
      var group = Array.prototype.filter.call(el.parentElement.children, function (c) {
        return c.classList.contains('reveal');
      });
      return Math.min(group.indexOf(el) * 0.09, 0.45);
    }

    function keyframesFor(el) {
      if (reduceMotion) return { opacity: [0, 1] };
      var dir = el.getAttribute('data-reveal') || 'up';
      var kf = { opacity: [0, 1], scale: [0.96, 1] };
      if (dir === 'left') kf.x = [-44, 0];
      else if (dir === 'right') kf.x = [44, 0];
      else if (dir === 'zoom') kf.scale = [0.9, 1];
      else kf.y = [34, 0];
      return kf;
    }

    function countUp(el, delay) {
      var target = parseInt(el.textContent, 10);
      if (isNaN(target)) return;
      el.textContent = '0';
      M.animate(0, target, {
        duration: 1.8,
        delay: delay,
        ease: EASE,
        onUpdate: function (v) { el.textContent = Math.round(v); }
      });
    }

    revealEls.forEach(function (el) {
      M.inView(el, function () {
        var delay = siblingDelay(el);
        el.style.opacity = '0';
        el.classList.add('is-animating', 'is-visible');

        var controls = M.animate(el, keyframesFor(el), { duration: 0.9, delay: delay, ease: EASE });
        var clearInline = function () {
          el.style.removeProperty('opacity');
          el.style.removeProperty('transform');
        };
        var finish = function () {
          // Devolve o controle ao CSS (hover dos cards, etc.) sem mudança visual.
          clearInline();
          el.classList.remove('is-animating');
          // O Motion pode gravar o estilo final logo depois; limpa de novo.
          setTimeout(clearInline, 120);
        };
        Promise.resolve(controls.finished || controls).then(finish, finish);

        var counter = el.querySelector('.thanks__count');
        if (counter && !reduceMotion) countUp(counter, delay + 0.6);
      }, { amount: 0.15 });
    });

    /* ---- Parallax e barra de progresso ligados à rolagem ---- */
    var hero = document.getElementById('inicio');
    var heroBg = document.querySelector('.hero__bg');
    if (hero && heroBg && !reduceMotion) {
      M.scroll(M.animate(heroBg, { y: [0, 80] }, { ease: 'linear' }), {
        target: hero,
        offset: ['start start', 'end start']
      });
    }

    var cta = document.getElementById('ajudar');
    var ctaBg = document.querySelector('.cta__bg');
    if (cta && ctaBg && !reduceMotion) {
      M.scroll(M.animate(ctaBg, { y: [-30, 30] }, { ease: 'linear' }), {
        target: cta,
        offset: ['start end', 'end start']
      });
    }

  }

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
