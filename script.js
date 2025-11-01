(function() {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Nav toggle
  const navToggle = $('#navToggle');
  const navMenu = $('#navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Scroll reveal via IntersectionObserver
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduce) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.16 });
    $$('.reveal').forEach((el) => observer.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  // Parallax effect on hero layers
  const hero = $('#hero');
  const layers = $$('#hero .parallax-layer');
  if (hero && layers.length) {
    hero.addEventListener('pointermove', (e) => {
      const rect = hero.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      layers.forEach((layer, i) => {
        const depth = (i + 1) * 8;
        layer.style.transform = `translate(${px * depth}px, ${py * depth}px)`;
      });
    });
    hero.addEventListener('pointerleave', () => {
      layers.forEach((layer) => (layer.style.transform = 'translate(0,0)'));
    });
  }

  // Carousels
  function makeCarousel(track, options = {}) {
    if (!track) return;
    const container = track.parentElement;
    const controls = container.parentElement.querySelector('.carousel-controls');
    let index = 0;

    function itemWidth() {
      const first = track.children[0];
      return first ? first.getBoundingClientRect().width + 16 : 0; // include gap
    }

    function maxIndex() {
      const visible = Math.max(1, Math.floor(container.getBoundingClientRect().width / itemWidth()));
      return Math.max(0, track.children.length - visible);
    }

    function goTo(i) {
      index = Math.max(0, Math.min(i, maxIndex()));
      const offset = -index * itemWidth();
      track.style.transform = `translateX(${offset}px)`;
    }

    const prev = controls?.querySelector('[data-action="prev"]');
    const next = controls?.querySelector('[data-action="next"]');
    prev?.addEventListener('click', () => goTo(index - 1));
    next?.addEventListener('click', () => goTo(index + 1));

    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goTo(index - 1);
      if (e.key === 'ArrowRight') goTo(index + 1);
    });

    window.addEventListener('resize', () => goTo(index));

    if (options.autoplay) {
      setInterval(() => {
        goTo(index + 1);
        if (index >= maxIndex()) goTo(0);
      }, options.interval || 4000);
    }

    goTo(0);
  }

  makeCarousel($('#modelsTrack'), { autoplay: true, interval: 4500 });
  makeCarousel($('#testimonialsTrack'), { autoplay: true, interval: 5000 });

  // Tabs for Use Cases
  const tabs = $$('.tab');
  const panels = $$('.tabpanel');
  function activateTab(tab) {
    tabs.forEach(t => { t.classList.toggle('is-active', t === tab); t.setAttribute('aria-selected', String(t === tab)); });
    panels.forEach(p => { const active = p.id === tab.getAttribute('aria-controls'); p.hidden = !active; p.classList.toggle('is-active', active); });
  }
  tabs.forEach((tab) => tab.addEventListener('click', () => activateTab(tab)));

  // Accordions (features + FAQ)
  function setupAccordions(scope = document) {
    const triggers = $$('.accordion-trigger', scope);
    triggers.forEach((btn) => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }
  setupAccordions();

  // Pricing toggle
  const billingButtons = $$('.toggle-btn');
  function setBilling(mode) {
    billingButtons.forEach(b => {
      const active = b.dataset.bill === mode;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    $$('.price').forEach(p => {
      const value = mode === 'yearly' ? p.dataset.yearly : p.dataset.monthly;
      p.textContent = value || p.textContent;
    });
  }
  billingButtons.forEach(b => b.addEventListener('click', () => setBilling(b.dataset.bill)));

  // CTA form mock
  const cta = $('#ctaSubmit');
  const email = $('#email');
  cta?.addEventListener('click', () => {
    if (!email?.checkValidity()) {
      email?.reportValidity();
      return;
    }
    cta.disabled = true;
    const original = cta.textContent;
    cta.textContent = 'Joining?';
    setTimeout(() => {
      cta.textContent = 'Welcome aboard!';
      cta.classList.add('btn-ghost');
      cta.classList.remove('btn-primary');
    }, 900);
    setTimeout(() => {
      cta.textContent = original;
      cta.disabled = false;
    }, 4000);
  });

  // Footer year
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
