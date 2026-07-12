/* ====================================================================
   MNG.CSL — Script global
   Langue (FR/EN persistée), navigation, révélation au défilement,
   menu mobile, soumission Formspree, filtres blog.
   ==================================================================== */
(function () {
  'use strict';

  var html = document.documentElement;

  /* ============== LANGUE (persistée entre les pages) ============== */
  var STORAGE_KEY = 'mngcsl-lang';
  function applyLang(lang) {
    if (lang !== 'fr' && lang !== 'en') lang = 'fr';
    html.setAttribute('data-lang', lang);
    html.setAttribute('lang', lang);
    // Titre de l'onglet dans la bonne langue (si fourni)
    var t = html.getAttribute('data-title-' + lang);
    if (t) document.title = t;
    document.querySelectorAll('.lang-toggle__btn').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.langSet === lang);
      b.setAttribute('aria-pressed', b.dataset.langSet === lang ? 'true' : 'false');
    });
    // Attributs traduisibles : placeholders et libellés d'<option> (impossibles à
    // gérer via des <span> masqués). Bascule pilotée par data-ph-* / data-txt-*.
    document.querySelectorAll('[data-ph-fr]').forEach(function (el) {
      var v = el.getAttribute('data-ph-' + lang);
      if (v !== null) el.setAttribute('placeholder', v);
    });
    document.querySelectorAll('[data-txt-fr]').forEach(function (el) {
      var v = el.getAttribute('data-txt-' + lang);
      if (v !== null) el.textContent = v;
    });
  }
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) applyLang(stored);
  } catch (e) { /* stockage indisponible */ }

  document.querySelectorAll('.lang-toggle__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.dataset.langSet;
      applyLang(lang);
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    });
  });

  /* ============== NAV : état actif ============== */
  // Multi-pages : surligne le lien correspondant à l'URL courante.
  var path = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav__links a[data-path]').forEach(function (a) {
    var linkPath = a.getAttribute('data-path');
    if (linkPath === path) a.classList.add('is-active');
  });

  // Page d'accueil : suit les sections au défilement.
  var sectionIds = ['top', 'services', 'cases', 'blog', 'contact'];
  var sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    var navAnchors = document.querySelectorAll('.nav__links a[href^="#"]');
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navAnchors.forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { sectionObs.observe(s); });
  }

  /* ============== RÉVÉLATION AU DÉFILEMENT ============== */
  var reveals = document.querySelectorAll('.reveal');
  function revealAll() {
    reveals.forEach(function (r) { r.classList.add('is-visible'); });
  }
  if (reveals.length && 'IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach(function (r) { revealObs.observe(r); });

    // Filet 1 — révéler immédiatement tout ce qui est déjà à l'écran ou au-dessus.
    requestAnimationFrame(function () {
      reveals.forEach(function (r) {
        if (r.getBoundingClientRect().top < window.innerHeight) r.classList.add('is-visible');
      });
    });
    // Filet 2 — arrivée sur une ancre (#services, #contact…) : le navigateur saute
    // par-dessus des sections qui ne passeraient jamais devant l'observateur. On révèle tout.
    if (window.location.hash) revealAll();
    window.addEventListener('hashchange', revealAll);
    // Filet 3 — sécurité absolue : après le chargement, plus rien ne doit rester invisible.
    window.addEventListener('load', function () { setTimeout(revealAll, 1000); });
  } else {
    revealAll();
  }
  // Retour arrière (bfcache) : re-révéler pour éviter tout affichage vide.
  window.addEventListener('pageshow', function (e) { if (e.persisted) revealAll(); });

  /* ============== MENU MOBILE ============== */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('navBurger');
  if (nav && burger) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
    // Échap ferme le menu
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* ============== FORMULAIRES (Formspree, AJAX) ============== */
  function labelFor(lang, fr, en) { return lang === 'en' ? en : fr; }

  document.querySelectorAll("form[action*='formspree.io']").forEach(function (form) {
    var note = form.querySelector('.form-note') || document.getElementById('formNote');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var lang = html.getAttribute('data-lang') || 'fr';

      if (form.hasAttribute('novalidate') && !form.checkValidity()) {
        if (note) {
          note.style.color = '#C8372D';
          note.textContent = labelFor(lang,
            '⤬ Merci de compléter les champs obligatoires.',
            '⤬ Please complete the required fields.');
        }
        form.reportValidity && form.reportValidity();
        return;
      }

      var submitBtn = form.querySelector("button[type='submit']");
      var originalHTML = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "<span class='lang-fr'>Envoi en cours…</span><span class='lang-en'>Sending…</span>";
      }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          form.reset();
          if (submitBtn) {
            submitBtn.innerHTML = "<span class='lang-fr'>Message envoyé ✓</span><span class='lang-en'>Message sent ✓</span>";
          }
          if (note) {
            note.style.color = 'var(--accent-deep)';
            note.textContent = labelFor(lang,
              '✓ Message reçu — réponse sous 48 heures ouvrées.',
              '✓ Message received — reply within 48 business hours.');
          }
          setTimeout(function () {
            if (submitBtn) { submitBtn.innerHTML = originalHTML; submitBtn.disabled = false; }
          }, 4000);
        } else {
          throw new Error('bad-status');
        }
      }).catch(function () {
        if (submitBtn) { submitBtn.innerHTML = originalHTML; submitBtn.disabled = false; }
        if (note) {
          note.style.color = '#C8372D';
          note.textContent = labelFor(lang,
            '⤬ Une erreur est survenue. Veuillez réessayer ou écrire à contact@mngcsl.ca.',
            '⤬ Something went wrong. Please retry or email contact@mngcsl.ca.');
        }
      });
    });
  });

  /* ============== FILTRES BLOG ============== */
  var filterBar = document.querySelector('.filters');
  if (filterBar) {
    var cards = document.querySelectorAll('[data-cat]');
    filterBar.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.dataset.filter;
        filterBar.querySelectorAll('button').forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        cards.forEach(function (c) {
          c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none';
        });
      });
    });
  }

  /* ============== ANNÉE ============== */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
