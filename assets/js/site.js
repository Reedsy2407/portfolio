/* Mejora progresiva del marco «Editor». Sin dependencias. Sin JavaScript todo el contenido se lee igual:
   esto añade tema, scrollspy, línea actual, minimapa, menú móvil, paleta de comandos,
   el botón de copiar el correo y la barra de estado con datos reales (errores contados, carga y LCP medidos, línea y
   columna según scroll y puntero). */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const en = root.lang === 'en';
  const put = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  const ms = (n) => Math.round(n) + ' ms';
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
  const systemLight = matchMedia('(prefers-color-scheme: light)');

  /* Tema: oscuro o claro; sigue al sistema hasta que la persona elige. */
  const themeBtns = $$('[data-theme-toggle]');
  const isLight = () => (root.dataset.theme ? root.dataset.theme === 'claro' : systemLight.matches);
  /* El botón dice la acción (CSS según data-eff); no es un interruptor con aria-pressed. */
  const paintTheme = () => { root.dataset.eff = isLight() ? 'light' : 'dark'; };
  themeBtns.forEach((b) => {
    b.hidden = false;
    b.addEventListener('click', () => {
      const next = isLight() ? 'oscuro' : 'claro';
      root.dataset.theme = next;
      store('tema', next);
      paintTheme();
    });
  });
  paintTheme();
  systemLight.addEventListener('change', paintTheme);

  /* Explorador: en escritorio se pliega desde la barra de actividad; en móvil es un menú. */
  const shell = $('.shell');
  const explorer = $('.explorer');
  const actExp = $('#act-exp');
  if (actExp) {
    actExp.hidden = false;
    actExp.addEventListener('click', () => {
      const on = shell.classList.toggle('no-exp');
      actExp.setAttribute('aria-pressed', String(!on));
    });
  }
  const menu = $('#exp-toggle');
  if (menu) {
    menu.hidden = false;
    menu.addEventListener('click', () => {
      const open = explorer.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    $$('a', explorer).forEach((a) => a.addEventListener('click', () => {
      explorer.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
    }));
  }

  /* Posición: scrollspy, línea actual, minimapa y barra de estado. Se recalcula en cada scroll (rAF);
     nunca se modifica el desplazamiento. */
  const sections = $$('main > section[id]');
  const links = $$('a[href^="#"]', explorer).concat($$('.tabs a[href^="#"]'));
  const strip = $('.tabs');
  const doc = $('.doc');
  const gutter = $('.gutter');
  const cur = $('.curline');
  const rows = gutter ? gutter.children : [];
  const view = $('.mm-view');
  const lineH = parseFloat(getComputedStyle(root).getPropertyValue('--ln-h')) || 28;
  const charW = 9.6; /* 0,6 em del texto de código de 16 px */
  let col = 1;
  let queued = false;
  let last = '';
  let lastLine = 0;

  const setCurrent = (id) => {
    links.forEach((a) => {
      const on = a.getAttribute('href') === '#' + id;
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      if (on && strip && strip.contains(a)) strip.scrollTo({ left: a.offsetLeft - (strip.clientWidth - a.offsetWidth) / 2, behavior: 'auto' });
    });
    const s = document.getElementById(id);
    put('m-lang', s && s.dataset.lang ? s.dataset.lang : '');
  };
  const paint = () => {
    queued = false;
    const bar = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    const line = bar + innerHeight * 0.18;
    const atEnd = innerHeight + scrollY >= root.scrollHeight - 2;
    if (sections.length) {
      const hit = atEnd ? sections[sections.length - 1] : sections.filter((s) => s.getBoundingClientRect().top <= line).pop() || sections[0];
      if (hit.id !== last) setCurrent((last = hit.id));
    }
    /* Línea actual: la que cruza la línea de lectura, medida desde el inicio del documento. */
    if (doc) {
      const y = scrollY + bar + innerHeight * 0.12 - (doc.getBoundingClientRect().top + scrollY);
      const n = Math.max(1, Math.min(rows.length || 999, Math.floor(y / lineH) + 1));
      if (n !== lastLine) {
        if (rows[lastLine - 1]) rows[lastLine - 1].classList.remove('cur');
        if (rows[n - 1]) rows[n - 1].classList.add('cur');
        if (cur) cur.style.transform = 'translateY(' + (n - 1) * lineH + 'px)';
        lastLine = n;
      }
      put('m-pos', 'Ln ' + n + ', Col ' + col);
    }
    if (view) {
      const mm = view.parentElement;
      const visible = innerHeight - bar;
      const vh = Math.min(mm.clientHeight, (visible / root.scrollHeight) * mm.clientHeight);
      const p = scrollY / Math.max(1, root.scrollHeight - innerHeight);
      view.style.setProperty('--vh', vh + 'px');
      view.style.setProperty('--vy', (mm.clientHeight - vh) * p + 'px');
    }
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  /* La columna sigue al puntero sobre el texto (el «cursor» del editor). */
  const main = $('main');
  if (main) {
    main.addEventListener('pointermove', (e) => {
      const left = main.getBoundingClientRect().left;
      const next = Math.max(1, Math.floor((e.clientX - left) / charW) + 1);
      if (next !== col) { col = next; queue(); }
    }, { passive: true });
  }
  paint();

  /* Paleta de comandos: Ctrl+K (o Cmd+K), el icono de búsqueda. Diálogo nativo sobre enlaces ya presentes. */
  const dlg = $('#cmd');
  const search = $('#act-search');
  if (dlg && typeof dlg.showModal === 'function') {
    const input = $('input', dlg);
    const items = $$('li', dlg);
    const visible = () => items.filter((li) => !li.hidden).map((li) => $('a', li));
    const filter = () => {
      const q = input.value.trim().toLowerCase();
      items.forEach((li) => { li.hidden = !li.textContent.toLowerCase().includes(q); });
    };
    const open = () => { input.value = ''; filter(); dlg.showModal(); input.focus(); };
    if (search) { search.hidden = false; search.addEventListener('click', open); }
    addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key || '').toLowerCase() === 'k') { e.preventDefault(); dlg.open ? dlg.close() : open(); }
    });
    input.addEventListener('input', filter);
    dlg.addEventListener('keydown', (e) => {
      const list = visible();
      const i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (list[i + 1] || list[0])?.focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); (i > 0 ? list[i - 1] : input).focus(); }
      else if (e.key === 'Enter' && document.activeElement === input) { list[0]?.click(); }
    });
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('a')) dlg.close(); });
  }

  /* Correo: sin JavaScript es un enlace mailto; aquí pasa a copiar la dirección y avisa con «Copiado». */
  const mail = $('#copiar-correo');
  const aviso = $('#copiado');
  if (mail && aviso) {
    const address = mail.querySelector('span').textContent;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = mail.className;
    btn.id = mail.id;
    btn.innerHTML = mail.innerHTML;
    btn.setAttribute('aria-label', mail.dataset.label);
    let timer;
    const say = (msg) => {
      aviso.textContent = msg;
      aviso.classList.add('on');
      clearTimeout(timer);
      timer = setTimeout(() => { aviso.textContent = ''; aviso.classList.remove('on'); }, 3000);
    };
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = address;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch {}
      ta.remove();
      return ok;
    };
    btn.addEventListener('click', async () => {
      let ok = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try { await navigator.clipboard.writeText(address); ok = true; } catch {}
      }
      if (!ok) ok = fallback();
      say(ok ? mail.dataset.ok : mail.dataset.fail);
    });
    mail.replaceWith(btn);
  }

  /* Errores contados de verdad: scripts, recursos que no cargan (captura en window desde el <head>),
     promesas rechazadas y fuentes que fallan. */
  let errors = window.__e || 0;
  const paintErr = () => { const el = document.getElementById('m-err'); if (el) { el.hidden = false; put('m-errn', String(errors)); } };
  addEventListener('error', () => { errors++; paintErr(); }, true);
  addEventListener('unhandledrejection', () => { errors++; paintErr(); });
  if (document.fonts) document.fonts.addEventListener('loadingerror', () => { errors++; paintErr(); });
  paintErr();

  /* Barra de estado: solo datos medidos en este navegador. */
  put('m-enc', document.characterSet);
  try {
    /* loadEventEnd es 0 hasta que terminan los manejadores de load: se lee justo después. */
    const showLoad = () => {
      const n = performance.getEntriesByType('navigation')[0];
      if (n && n.loadEventEnd > 0) put('m-carga', (en ? 'load ' : 'carga ') + ms(n.loadEventEnd));
    };
    if (document.readyState === 'complete') setTimeout(showLoad, 0); else addEventListener('load', () => setTimeout(showLoad, 0));
    new PerformanceObserver((list) => put('m-lcp', 'LCP ' + ms(list.getEntries().pop().startTime)))
      .observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}
  /* Partículas: se pausan cuando la pestaña no está visible. */
  const pauseFx = () => root.classList.toggle('fx-paused', document.hidden);
  document.addEventListener('visibilitychange', pauseFx);
  pauseFx();
})();
