/* ============================================
   SDN 3 Ngrayun — Desa Sambiganen
   JavaScript v2.0 — Native
   ============================================ */

(function () {
  'use strict';

  // ==========================================
  // 1. Footer — Auto Tahun
  // ==========================================
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ==========================================
  // 2. Header — Scroll State & Back to Top
  // ==========================================
  var header = document.getElementById('siteHeader');
  var toTop = document.getElementById('toTop');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('scrolled', y > 40);
    if (toTop) {
      toTop.classList.toggle('show', y > 500);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================
  // 3. Mobile Nav — Toggle & Close
  // ==========================================
  var burger = document.getElementById('burgerBtn');
  var nav = document.getElementById('mainNav');

  function closeNav() {
    nav.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Close on nav link click
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  // ==========================================
  // 4. Active Nav Link — IntersectionObserver
  // ==========================================
  var navLinks = nav ? nav.querySelectorAll('a') : [];
  var sections = Array.prototype.filter.call(
    document.querySelectorAll('main section[id]'),
    function (section) {
      return Array.prototype.some.call(navLinks, function (link) { return link.getAttribute('href') === '#' + section.id; });
    }
  );

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach(function (s) {
      navObserver.observe(s);
    });
  }

  // ==========================================
  // 5. Reveal on Scroll — IntersectionObserver
  // ==========================================
  var revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('in');
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      // Fallback: show all immediately
      revealEls.forEach(function (el) {
        el.classList.add('in');
      });
    }
  }

  // ==========================================
  // 6. Contact Form — Front-end Only
  // ==========================================
  var form = document.getElementById('contactForm');
  var msg = document.getElementById('formMsg');

  if (form && msg) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.textContent =
        'Terima kasih! Pesan Anda sudah tercatat. (Form ini masih contoh tampilan — sambungkan ke email/WhatsApp/backend agar pesan benar-benar terkirim.)';
      msg.style.opacity = '1';
      form.reset();

      // Fade out message after 5 seconds
      setTimeout(function () {
        msg.style.opacity = '0';
        setTimeout(function () {
          msg.textContent = '';
          msg.style.opacity = '1';
        }, 500);
      }, 5000);
    });
  }
})();

