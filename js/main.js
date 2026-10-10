(() => {
  const root = document.documentElement;
  root.classList.add('js');

  // Menú mobile
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('navegacion');
  if (toggle && nav) {
    const setOpen = open => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
  }

  // Header transparente sobre el hero → sólido al scrollear. WhatsApp flotante aparece pasado el hero.
  const header = document.querySelector('[data-header]');
  const hero = document.querySelector('.hero');
  const floatWa = document.querySelector('.float-wa');
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-solid', y > 12);
    if (floatWa && hero) floatWa.classList.toggle('is-visible', y > hero.offsetHeight * 0.75);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Revelado de tarjetas
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add('is-in'));
  }

  // Tienda (próximamente): adapta etiqueta, foto y mensaje de WhatsApp a la categoría de la tarjeta (?c=)
  const store = document.querySelector('[data-store]');
  if (store) {
    const cats = {
      'bifes': ['Bifes', 'bifes', 'bifes', 'carnes'],
      'cortes-especiales': ['Cortes especiales', 'cortes especiales', 'cortes-especiales', 'carnes'],
      'parrilla': ['Parrilla', 'cortes para parrilla', 'parrilla', 'carnes'],
      'achuras-embutidos': ['Achuras y embutidos', 'achuras y embutidos', 'picadas', 'carnes'],
      'pescaderia': ['Pescadería', 'pescadería', 'pescaderia', 'complementos'],
      'fiambres': ['Fiambres', 'fiambres', 'fiambres', 'complementos'],
      'quesos': ['Quesos', 'quesos', 'quesos', 'complementos'],
      'almacen': ['Almacén', 'almacén', 'almacen', 'complementos']
    };
    const cat = cats[new URLSearchParams(location.search).get('c')];
    if (cat) {
      const [label, wa, img, back] = cat;
      store.querySelector('[data-store-label]').textContent = label;
      store.querySelector('[data-store-wa]').href = 'https://wa.me/5493487686764?text=' + encodeURIComponent('Hola, quiero hacer un pedido de ' + wa + ' en CARVAN');
      const pic = store.querySelector('[data-store-img]');
      pic.srcset = `assets/${img}-mobile.webp 480w, assets/${img}-desktop.webp 960w`;
      pic.src = `assets/${img}-desktop.webp`;
      const backLink = store.querySelector('[data-store-back]');
      backLink.href = 'index.html#' + back;
      if (back === 'complementos') backLink.textContent = 'Volver a más sabores';
    }
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Logo: cada letra sube desde abajo del recorte (TRAMA · revelado-por-mascara-carvan)
  const logo = document.querySelector('.fx-mask');
  if (logo) requestAnimationFrame(() => logo.classList.add('run'));

  // Títulos: split por palabras, cada una sube desde abajo del renglón (TRAMA · reveal-de-texto).
  // Recorre el DOM para no romper <br> ni el <span class="nowrap"> del H1.
  const STAGGER = 90;
  const split = el => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            w.style.setProperty('--d', (i++ * STAGGER + (el.tagName === 'H1' ? 250 : 0)) + 'ms');
            const inner = document.createElement('i');
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(el);
  };
  const titles = document.querySelectorAll('[data-split]');
  titles.forEach(split);
  if (reduced || !('IntersectionObserver' in window)) {
    titles.forEach(t => t.classList.add('is-in'));
  } else {
    const tio = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); tio.unobserve(e.target); }
    }), { threshold: .2 });
    titles.forEach(t => tio.observe(t));
  }

  // Fotos: parallax dentro del marco (TRAMA · parallax-interno). Publica --pv (0 al asomar, 1 al salir)
  // y sólo calcula mientras el marco está a la vista.
  const frames = [...document.querySelectorAll('[data-view]')];
  if (frames.length && !reduced && 'IntersectionObserver' in window) {
    const live = new Set();
    let raf = 0;
    const tick = () => {
      live.forEach(el => {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
        el.style.setProperty('--pv', p.toFixed(4));
      });
      raf = live.size ? requestAnimationFrame(tick) : 0;
    };
    const vio = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? live.add(e.target) : live.delete(e.target));
      if (live.size && !raf) raf = requestAnimationFrame(tick);
    });
    frames.forEach(f => vio.observe(f));
  }

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
