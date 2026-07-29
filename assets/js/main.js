/* ==========================================================================
   SayNeel Technologies — Main script
   --------------------------------------------------------------------------
   No inline event handlers anywhere in the HTML. Everything is bound here.
   Every block is defensive: if an element is absent on a given page the
   block exits quietly, so this one file is safe to load on all pages.

   Contents
   01. Helpers
   02. Theme (dark / light) with persistence
   03. Sticky header shadow
   04. Mobile drawer
   05. Active navigation state
   06. Animated statistic counters
   07. Scroll reveal
   08. Back to top
   09. Filter pills (portfolio / audience switches)
   10. Newsletter (front-end validation only — no backend)
   11. Contact detail injection from config.js
   12. Footer year
   13. External link hardening
   ========================================================================== */
(function () {
  'use strict';

  /* 01. HELPERS ---------------------------------------------------------- */
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var CFG = window.SAYNEEL || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 02. THEME ------------------------------------------------------------ */
  var themeBtn = $('#theme');
  var STORAGE_KEY = 'sayneel-theme';

  function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    if (themeBtn) {
      themeBtn.textContent = mode === 'dark' ? '☀' : '◐';
      themeBtn.setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      themeBtn.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
    }
  }

  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage blocked */ }
  applyTheme(stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* storage blocked */ }
    });
  }

  /* 03. STICKY HEADER ---------------------------------------------------- */
  var hdr = $('#hdr');
  if (hdr) {
    var onScrollHeader = function () { hdr.classList.toggle('scrolled', window.scrollY > 24); };
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();
  }

  /* 04. MOBILE DRAWER ---------------------------------------------------- */
  var burger = $('#burger');
  var drawer = $('#drawer');

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    document.body.classList.remove('no-scroll');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = drawer.classList.toggle('open');
      document.body.classList.toggle('no-scroll', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var first = drawer.querySelector('a'); if (first) first.focus(); }
    });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', closeDrawer); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) { closeDrawer(); burger.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080) closeDrawer();
    });
  }

  /* 05. ACTIVE NAV ------------------------------------------------------- */
  (function markActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    $$('[data-nav]').forEach(function (link) {
      var target = link.getAttribute('data-nav');
      if (target === path) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }());

  /* 06. STAT COUNTERS ---------------------------------------------------- */
  (function counters() {
    var nodes = $$('[data-count]');
    if (!nodes.length) return;

    var format = function (n, el) {
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      return prefix + n.toLocaleString('en-IN') + suffix;
    };

    var run = function (el) {
      if (el.dataset.done === '1') return;
      el.dataset.done = '1';
      var end = parseFloat(el.getAttribute('data-count'));
      if (reduceMotion) { el.textContent = format(end, el); return; }
      var start = performance.now();
      var tick = function (now) {
        var p = Math.min((now - start) / 1200, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(Math.round(end * eased), el);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    nodes.forEach(function (n) { io.observe(n); });
  }());

  /* 07. SCROLL REVEAL ---------------------------------------------------- */
  (function reveal() {
    var nodes = $$('.reveal');
    if (!nodes.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    nodes.forEach(function (n) { io.observe(n); });
  }());

  /* 08. BACK TO TOP ------------------------------------------------------ */
  var toTop = $('#toTop');
  if (toTop) {
    var onScrollTop = function () { toTop.classList.toggle('show', window.scrollY > 500); };
    window.addEventListener('scroll', onScrollTop, { passive: true });
    onScrollTop();
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var skip = $('.skip'); if (skip) skip.focus();
    });
  }

  /* 09. FILTER PILLS ----------------------------------------------------- */
  $$('.pill-row').forEach(function (row) {
    var pills = $$('.pill', row);
    if (!pills.length) return;

    pills.forEach(function (pill) {
      pill.setAttribute('role', 'button');
      pill.setAttribute('tabindex', '0');
      pill.setAttribute('aria-pressed', pill.classList.contains('on') ? 'true' : 'false');

      var activate = function () {
        pills.forEach(function (p) { p.classList.remove('on'); p.setAttribute('aria-pressed', 'false'); });
        pill.classList.add('on');
        pill.setAttribute('aria-pressed', 'true');

        /* Audience panels: pills carry data-panel, panels carry data-panel-id */
        var panel = pill.getAttribute('data-panel');
        if (panel) {
          $$('[data-panel-id]').forEach(function (p) {
            p.hidden = p.getAttribute('data-panel-id') !== panel;
          });
        }

        /* Portfolio filtering: pills carry data-filter, cards carry data-cat */
        var filter = pill.getAttribute('data-filter');
        var targetSel = row.getAttribute('data-target');
        if (!filter || !targetSel) return;
        $$(targetSel + ' [data-cat]').forEach(function (card) {
          var cats = (card.getAttribute('data-cat') || '').split(' ');
          var show = filter === 'all' || cats.indexOf(filter) !== -1;
          card.style.display = show ? '' : 'none';
        });
      };

      pill.addEventListener('click', activate);
      pill.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });
  });

  /* 10. NEWSLETTER (front-end only) -------------------------------------- */
  (function newsletter() {
    var btn   = $('#nlBtn');
    var input = $('#nlEmail');
    var msg   = $('#nlMsg');
    if (!btn || !input || !msg) return;

    var setMsg = function (text, ok) {
      msg.textContent = text;
      msg.className = 'nl-msg show ' + (ok ? 'ok' : 'bad');
    };

    var submit = function () {
      var value = input.value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      if (!valid) {
        setMsg('Enter an email address in the format name@company.com.', false);
        input.focus();
        return;
      }
      /* No backend is connected. Hand the subscription to the mail client so
         nothing is silently lost. Replace this with your ESP embed when ready. */
      var to = CFG.email || 'info@sayneel.com';
      var subject = encodeURIComponent('Newsletter subscription');
      var body = encodeURIComponent('Please add this address to the SayNeel mailing list: ' + value);
      window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
      setMsg('Opening your email app to confirm the subscription.', true);
      input.value = '';
    };

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });
  }());

  /* 11. CONTACT INJECTION ------------------------------------------------ */
  (function contactDetails() {
    if (!CFG.email) return;

    /* Text nodes: <span data-contact="email"></span> */
    $$('[data-contact]').forEach(function (el) {
      var key = el.getAttribute('data-contact');
      var map = {
        email:          CFG.email,
        phone:          CFG.phoneDisplay,
        emailSales:     CFG.emailSales,
        emailBalSaathi: CFG.emailBalSaathi,
        emailCareers:   CFG.emailCareers,
        emailInvestors: CFG.emailInvestors,
        emailSupport:   CFG.emailSupport,
        emailPrivacy:   CFG.emailPrivacy,
        emailLegal:     CFG.emailLegal,
        address1:       CFG.addressLine1,
        address2:       CFG.addressLine2,
        address3:       CFG.addressLine3,
        hoursWeekday:   CFG.hoursWeekday,
        hoursSaturday:  CFG.hoursSaturday,
        hoursSunday:    CFG.hoursSunday
      };
      if (map[key]) el.textContent = map[key];
    });

    /* Links: <a data-mailto="emailCareers" data-subject="..."> and data-tel */
    $$('[data-mailto]').forEach(function (a) {
      var key = a.getAttribute('data-mailto');
      var addr = CFG[key] || CFG.email;
      var subject = a.getAttribute('data-subject');
      a.setAttribute('href', 'mailto:' + addr + (subject ? '?subject=' + encodeURIComponent(subject) : ''));
    });
    $$('[data-tel]').forEach(function (a) {
      if (CFG.phoneDial) a.setAttribute('href', 'tel:' + CFG.phoneDial);
    });
    $$('[data-maplink]').forEach(function (a) {
      if (CFG.mapLink) a.setAttribute('href', CFG.mapLink);
    });

    /* Social links */
    if (CFG.social) {
      $$('[data-social]').forEach(function (a) {
        var key = a.getAttribute('data-social');
        if (CFG.social[key]) a.setAttribute('href', CFG.social[key]);
      });
    }

    /* Optional Google Maps embed */
    var mapHost = $('#mapHost');
    if (mapHost && CFG.mapEmbed) {
      var frame = document.createElement('iframe');
      frame.src = CFG.mapEmbed;
      frame.title = 'SayNeel Technologies office location';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      frame.setAttribute('allowfullscreen', '');
      mapHost.innerHTML = '';
      mapHost.appendChild(frame);
    }
  }());

  /* 12. FOOTER YEAR ------------------------------------------------------ */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* 13. EXTERNAL LINK HARDENING ------------------------------------------ */
  $$('a[target="_blank"]').forEach(function (a) {
    var rel = (a.getAttribute('rel') || '').split(' ').filter(Boolean);
    if (rel.indexOf('noopener') === -1) rel.push('noopener');
    if (rel.indexOf('noreferrer') === -1) rel.push('noreferrer');
    a.setAttribute('rel', rel.join(' '));
  });
}());
