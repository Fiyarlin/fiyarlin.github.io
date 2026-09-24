/* =========================================================
   Fiyarlin K | Portfolio
   Vanilla JS only. No dependencies, no build step.
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile navigation ---------- */
  var header = document.querySelector('.site-header');
  var toggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('primary-nav');

  function setMenu(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (header && toggle && navLinks) {
    toggle.addEventListener('click', function () {
      setMenu(!header.classList.contains('is-open'));
    });

    // Close after choosing a link
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    // Close with Escape and return focus to the button
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    // Close when clicking outside the header
    document.addEventListener('click', function (e) {
      if (header.classList.contains('is-open') && !header.contains(e.target)) {
        setMenu(false);
      }
    });

    // Reset when the viewport grows past the mobile breakpoint
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768 && header.classList.contains('is-open')) {
        setMenu(false);
      }
    });
  }

  /* ---------- Header shadow once scrolled ---------- */
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Placeholder links ("#") should not jump to the top ---------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href="#"]');
    if (link) e.preventDefault();
  });

  /* ---------- Scroll reveal (fade in once) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  // Small stagger for items that share a parent group
  Array.prototype.forEach.call(document.querySelectorAll('[data-reveal-group]'), function (group) {
    var items = Array.prototype.filter.call(group.children, function (child) {
      return child.classList.contains('reveal');
    });
    items.forEach(function (el, i) {
      el.style.setProperty('--d', Math.min(i, 5) * 70 + 'ms');
    });
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Highlight the current section in the nav ---------- */
  var navAnchors = navLinks ? navLinks.querySelectorAll('a[href^="#"]') : [];
  var sectionEls = ['home', 'about', 'skills', 'projects', 'assistant', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setCurrent(id) {
    Array.prototype.forEach.call(navAnchors, function (a) {
      if (a.getAttribute('href') === '#' + id) {
        a.setAttribute('aria-current', 'true');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window && navAnchors.length) {
    var currentObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setCurrent(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sectionEls.forEach(function (el) { currentObserver.observe(el); });
  }

  /* ---------- AI assistant iframe ----------
     If the iframe still points at the placeholder Streamlit URL, swap it for a
     friendly message so visitors never see a broken embed. Once a real URL is
     set in index.html, the iframe is left alone and an "open in new tab" link
     is shown. */
  var frame = document.getElementById('assistant-iframe');
  var fallback = document.getElementById('assistant-fallback');
  var openLink = document.getElementById('assistant-open');

  if (frame) {
    var src = frame.getAttribute('src') || '';
    var isPlaceholder = !src || src.indexOf('[') !== -1 || /YOUR[-_ ]?(APP|STREAMLIT)/i.test(src);

    if (isPlaceholder) {
      frame.parentNode.removeChild(frame);
      if (fallback) fallback.hidden = false;
    } else if (openLink) {
      try {
        var url = new URL(src, window.location.href);
        url.searchParams.delete('embed');
        openLink.href = url.toString();
        openLink.hidden = false;
      } catch (err) {
        /* leave the link hidden if the URL cannot be parsed */
      }
    }
  }
})();
