/* Outdoor Surplus USA - concept build. No framework, no dependencies. */
(function () {
  'use strict';

  /* One source of truth for the vendor record. The cards in the page and the
     copied text both come from here, so they cannot drift apart. */
  var VENDOR = [
    ['Vendor', 'Outdoor Surplus USA'],
    ['UEI', 'DYPGA6FNQ3J6'],
    ['CAGE', '9ZHH2'],
    ['SAM.gov', 'Active'],
    ['Location', 'Castaic, California'],
    ['Designation', 'Small Business · Woman-Owned'],
    ['California', 'SB Certified (Cal eProcure / OSDS)'],
    ['NAICS', '337127, 337215, 423210, 444220, 451110'],
    ['Phone', '(661) 607-3672'],
    ['Email', 'info@outdoorsurplususa.com']
  ];

  var vendorText = VENDOR.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');

  /* ---------- Copy vendor details ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-2000px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  document.querySelectorAll('[data-copy-vendor]').forEach(function (btn) {
    var label = btn.querySelector('[data-copy-label]') || btn;
    var original = label.textContent;
    var status = document.getElementById(btn.getAttribute('aria-describedby') || '');
    btn.addEventListener('click', function () {
      copyText(vendorText).then(function () {
        label.textContent = 'Copied';
        if (status) status.textContent = 'Vendor details copied to clipboard as plain text.';
      }, function () {
        label.textContent = 'Select and copy';
        if (status) status.textContent = 'Copy is blocked in this browser. Select the vendor record and copy it manually.';
      });
      setTimeout(function () { label.textContent = original; }, 2600);
    });
  });

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    var close = function () { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); };
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { close(); toggle.focus(); }
    });
  }

  /* ---------- Tabs (WAI-ARIA pattern, manual activation not needed) ---------- */
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  });


  /* ---------- Feature slider: manual only, no autoplay ---------- */
  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.slide'));
    var status = slider.querySelector('[data-slider-status]');
    var i = 0;
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.hidden = k !== i; });
      if (status) status.textContent = 'Showing ' + (i + 1) + ' of ' + slides.length + ': ' + slides[i].querySelector('h3').textContent;
    }
    slider.querySelector('[data-prev]').addEventListener('click', function () { show(i - 1); });
    slider.querySelector('[data-next]').addEventListener('click', function () { show(i + 1); });
  });

  /* ---------- Quote presets: links that pre-fill the form ---------- */
  function setSelect(id, value) {
    var el = document.getElementById(id);
    if (!el || !value) return;
    for (var i = 0; i < el.options.length; i++) {
      if (el.options[i].value === value) { el.selectedIndex = i; return; }
    }
  }
  document.querySelectorAll('[data-quote-buyer],[data-quote-method]').forEach(function (a) {
    a.addEventListener('click', function () {
      setSelect('f-buyer', a.getAttribute('data-quote-buyer'));
      setSelect('f-method', a.getAttribute('data-quote-method'));
    });
  });

  /* ---------- Quote form validation ---------- */
  var form = document.getElementById('quote-form');
  if (form) {
    var rules = [
      ['f-org', function (v) { return v ? '' : 'Enter your organization or agency.'; }],
      ['f-name', function (v) { return v ? '' : 'Enter a contact name.'; }],
      ['f-email', function (v) {
        if (!v) return 'Enter an email address, like name@agency.gov.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter an email address in the format name@agency.gov.';
      }]
    ];
    var status = document.getElementById('form-status');
    function check(id, fn) {
      var input = document.getElementById(id);
      var err = document.getElementById(id + '-error');
      var msg = fn(input.value.trim());
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) { err.textContent = msg; err.hidden = !msg; }
      return msg ? input : null;
    }
    rules.forEach(function (r) {
      var input = document.getElementById(r[0]);
      input.addEventListener('blur', function () { if (input.value) check(r[0], r[1]); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      rules.forEach(function (r) { var bad = check(r[0], r[1]); if (bad && !firstBad) firstBad = bad; });
      if (firstBad) {
        status.textContent = 'Please fix the highlighted fields.';
        firstBad.focus();
        return;
      }
      /* TODO(dev): wire to the form endpoint. This concept never submits. */
      status.textContent = 'Thank you. Online submission is not connected on this preview. Please call (661) 607-3672 or email info@outdoorsurplususa.com.';
    });
  }

  /* ---------- Reveal on scroll (skipped entirely under reduced motion) ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('[data-reveal]');
  if (!reduce && 'IntersectionObserver' in window && items.length) {
    document.documentElement.classList.add('can-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Header state ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 16); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
