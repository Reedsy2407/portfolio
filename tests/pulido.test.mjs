// Ronda de pulido: copiar correo (con y sin JS), iconos, secciones y botones quitados, disponibilidad única,
// enlaces del proyecto y legibilidad de la línea de tiempo de experiencia.
import { PAGES, VIEWPORTS, open } from './lib.mjs';

export const name = 'pulido: correo, iconos, proyectos y experiencia';

const CORREO = 'saenzvelarde2006@gmail.com';

export async function run({ browser, base, report }) {
  for (const p of PAGES.filter((x) => x.kind === 'home')) {
    const en = p.lang === 'en';

    // ── Copiar correo, con JavaScript y permiso de portapapeles.
    {
      const ctx = await browser.newContext({ viewport: VIEWPORTS.d, permissions: ['clipboard-read', 'clipboard-write'] });
      const page = await ctx.newPage();
      await page.goto(base + p.path, { waitUntil: 'load' });
      const antes = await page.evaluate(() => ({ chip: document.getElementById('copiar-correo').tagName, escribir: [...document.querySelectorAll('a.js-only')].map((a) => ({ href: a.getAttribute('href'), v: a.getBoundingClientRect().height >= 44 })) }));
      report.check(`${p.path}: con JS el chip es un botón y «Escribir» (mailto) aparece junto a él`, antes.chip === 'BUTTON' && antes.escribir.length === 1 && antes.escribir[0].href === `mailto:${CORREO}` && antes.escribir[0].v, JSON.stringify(antes));
      const nombre = await page.getAttribute('#copiar-correo', 'aria-label');
      report.check(`${p.path}: nombre accesible «${en ? 'Copy email' : 'Copiar correo'} ${CORREO}»`, nombre === `${en ? 'Copy email' : 'Copiar correo'} ${CORREO}`, nombre);
      const vivo = await page.getAttribute('#copiado', 'aria-live');
      const url0 = page.url();
      await page.click('#copiar-correo');
      await page.waitForFunction(() => document.getElementById('copiado').textContent.length > 0);
      const portapapeles = await page.evaluate(() => navigator.clipboard.readText());
      const aviso = await page.evaluate(() => { const e = document.getElementById('copiado'); const r = e.getBoundingClientRect(); return { texto: e.textContent, visible: r.width > 0 && r.height > 0 }; });
      report.check(`${p.path}: al hacer clic copia la dirección y muestra «${en ? 'Copied' : 'Copiado'}» (aria-live="polite")`, portapapeles === CORREO && aviso.texto === (en ? 'Copied' : 'Copiado') && aviso.visible && vivo === 'polite' && page.url() === url0, JSON.stringify({ portapapeles, aviso, vivo }));
      await page.waitForFunction(() => document.getElementById('copiado').textContent === '', null, { timeout: 8000 });
      report.check(`${p.path}: la confirmación desaparece sola`, true);
      await ctx.close();
    }

    // ── Copiar correo con respaldo (sin navigator.clipboard).
    {
      const { context, page } = await open(browser, base, p.path, {
        viewport: VIEWPORTS.d,
        init: () => {
          Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
          window.__copiado = [];
          document.execCommand = (c) => { const ta = document.querySelector('textarea'); window.__copiado.push([c, ta ? ta.value : null]); return true; };
        },
      });
      await page.click('#copiar-correo');
      await page.waitForFunction(() => document.getElementById('copiado').textContent.length > 0);
      const r = await page.evaluate(() => ({ cop: window.__copiado, txt: document.getElementById('copiado').textContent }));
      report.check(`${p.path}: sin navigator.clipboard usa el respaldo y confirma`, r.cop.length === 1 && r.cop[0][0] === 'copy' && r.cop[0][1] === CORREO && r.txt === (en ? 'Copied' : 'Copiado'), JSON.stringify(r));
      await context.close();
    }

    // ── Sin JavaScript: el chip es un enlace mailto normal.
    {
      const { context, page } = await open(browser, base, p.path, { js: false, viewport: VIEWPORTS.d });
      const r = await page.evaluate(() => {
        const c = document.getElementById('copiar-correo');
        const e = [...document.querySelectorAll('a.js-only')][0];
        const box = c.getBoundingClientRect();
        return { tag: c.tagName, href: c.getAttribute('href'), visible: box.width > 0 && box.height >= 44, escribirVisible: e.getBoundingClientRect().width > 0 };
      });
      report.check(`${p.path} sin JS: el chip es un enlace mailto visible y «Escribir» no se muestra`, r.tag === 'A' && r.href === `mailto:${CORREO}` && r.visible && !r.escribirVisible, JSON.stringify(r));
      await context.close();
    }

    // ── Iconos, secciones quitadas y disponibilidad única.
    {
      const { context, page } = await open(browser, base, p.path, { viewport: VIEWPORTS.d });
      const r = await page.evaluate(() => {
        const control = (sel) => document.querySelector(sel);
        const svgs = (el) => [...el.querySelectorAll('svg')].map((s) => ({ aria: s.getAttribute('aria-hidden'), focus: s.getAttribute('focusable') }));
        const conIcono = {
          linkedin: control('a[href^="https://www.linkedin.com"]'), github: control('.links a[href="https://github.com/Reedsy2407"]'),
          correo: control('#copiar-correo'), cv: control('a[href$="CV_Angel_Saenz.pdf"]'),
        };
        const iconos = Object.fromEntries(Object.entries(conIcono).map(([k, el]) => [k, el ? svgs(el) : null]));
        const body = document.body.innerText;
        return {
          iconos,
          contacto: Boolean(document.getElementById('contacto')) || [...document.querySelectorAll('a')].some((a) => a.getAttribute('href') === '#contacto') || /contacto\.sh/.test(body),
          verProyecto: /Ver proyecto|View project/.test(body),
          caso: [...document.querySelectorAll('a')].some((a) => /caso\/|case\/|esg-trazabilidad\.html/.test(a.getAttribute('href'))),
          demo: Boolean(document.querySelector('[data-filtro], #demo, #demo-tabla')) || /datos simulados|simulated data/i.test(body),
          disponible: (body.match(/Disponible para proyectos freelance|Available for part-time freelance/g) || []).length,
          sobreMi: document.querySelector('.cta .btn.primary').getAttribute('href'),
          verCv: document.querySelector('a[href$="CV_Angel_Saenz.pdf"]')?.innerText.replace(/\s+/g, ' '),
          tabs: [...document.querySelectorAll('.tabs a')].map((a) => a.getAttribute('href')),
          explorador: [...document.querySelectorAll('.explorer a')].map((a) => a.getAttribute('href')),
        };
      });
      const iconosBien = Object.entries(r.iconos).every(([, v]) => v && v.length >= 1 && v.every((s) => s.aria === 'true' && s.focus === 'false'));
      report.check(`${p.path}: LinkedIn, GitHub, correo y CV con icono SVG aria-hidden`, iconosBien, JSON.stringify(r.iconos));
      report.check(`${p.path}: sin sección contacto, sin «Ver proyecto», sin caso ni demo`, !r.contacto && !r.verProyecto && !r.caso && !r.demo, JSON.stringify({ c: r.contacto, vp: r.verProyecto, caso: r.caso, demo: r.demo }));
      report.check(`${p.path}: la disponibilidad aparece una sola vez`, r.disponible === 1, String(r.disponible));
      report.check(`${p.path}: el botón principal es «${en ? 'About me' : 'Sobre mí'}» y enlaza a su sección`, r.sobreMi === '#sobre-mi');
      report.check(`${p.path}: «${en ? 'View CV' : 'Ver CV'} (PDF, N KB)» con espacio`, new RegExp(`^${en ? 'View CV' : 'Ver CV'} \\(PDF, [\\d.]+ (KB|MB)\\)$`).test(r.verCv || ''), r.verCv);
      report.check(`${p.path}: pestañas y explorador sin «contacto»`, !r.tabs.includes('#contacto') && !r.explorador.includes('#contacto') && r.tabs.length === 5, r.tabs.join(','));
      await context.close();
    }

    // ── Etiquetas de stack bajo el cargo y prompt sobre «hola, soy».
    {
      const { context, page } = await open(browser, base, p.path, { viewport: VIEWPORTS.d });
      const r = await page.evaluate(() => {
        const y = (s) => document.querySelector(s).getBoundingClientRect().top;
        const tags = [...document.querySelectorAll('.stack-tags li')].map((e) => e.textContent.trim());
        return { orden: y('.prompt') < y('.mono.rise') && y('.role') < y('.stack-tags') && y('.stack-tags') < y('.lead'), tags, prompt: document.querySelector('.prompt').textContent };
      });
      report.check(`${p.path}: prompt sobre «hola, soy» (texto propio) y etiquetas de stack bajo el cargo`, r.orden && r.tags.length >= 3 && r.tags.every((x) => x.startsWith('//')) && !/whoami/.test(r.prompt), JSON.stringify(r));
      await context.close();
    }

    // ── Proyecto destacado: enlaces y propios.
    {
      const { context, page } = await open(browser, base, p.path, { viewport: VIEWPORTS.d });
      const r = await page.evaluate(() => {
        const card = document.querySelector('.project');
        const acciones = [...card.querySelectorAll('a')].map((a) => ({ href: a.href, rel: a.rel, target: a.target, label: a.getAttribute('aria-label'), texto: a.innerText.trim(), h: a.getBoundingClientRect().height }));
        return { acciones, tags: [...card.querySelectorAll('.chips-tech li')].map((x) => x.textContent), propios: [...document.querySelectorAll('.own li strong')].map((x) => x.textContent), h3: card.querySelector('h3').textContent };
      });
      const urls = r.acciones.map((a) => a.href);
      const esperadas = ['https://esg-frontend-egcf.onrender.com/', 'https://github.com/Reedsy2407/esg-trazabilidad', 'https://reedsy2407.github.io/esg-trazabilidad/'];
      report.check(`${p.path}: la tarjeta tiene Sistema real, Código y Documentación con rel y pestaña nueva`, esperadas.every((u) => urls.includes(u)) && r.acciones.every((a) => /noopener/.test(a.rel) && /noreferrer/.test(a.rel) && a.target === '_blank' && /(pestaña nueva|new tab)/.test(a.label) && a.label.startsWith(a.texto) && a.h >= 44), JSON.stringify(r.acciones.map((a) => [a.texto, a.rel, a.h])));
      report.check(`${p.path}: etiquetas de tecnologías y proyectos propios`, ['Java 21', 'Spring Boot 3.3.5', 'Angular', 'PostgreSQL'].every((t) => r.tags.includes(t)) && r.propios.join() === 'Portal Laboral,Helpcore' && r.h3 === 'esg-trazabilidad', JSON.stringify({ tags: r.tags, propios: r.propios }));
      await context.close();
    }

    // ── Explorador y pestañas: el resaltado de fondo y la barra azul siguen juntos a la sección visible.
    {
      const { context, page } = await open(browser, base, p.path, { viewport: VIEWPORTS.d });
      const malos = [];
      for (const id of ['perfil', 'sobre-mi', 'habilidades', 'experiencia', 'proyectos', 'perfil']) {
        await page.evaluate((x) => document.getElementById(x).scrollIntoView(), id);
        await page.waitForFunction((x) => document.querySelector('.explorer a[aria-current]')?.getAttribute('href') === '#' + x && document.querySelector('.tabs a[aria-current]')?.getAttribute('href') === '#' + x, id);
        // Sin esperar tiempo: en cuanto cambia el archivo actual, el fondo ya debe coincidir.
        const r = await page.evaluate(() => {
          const lista = (sel) => [...document.querySelectorAll(sel)].map((a) => ({ href: a.getAttribute('href'), actual: a.hasAttribute('aria-current'), bg: getComputedStyle(a).backgroundColor, borde: getComputedStyle(a).borderTopColor + '|' + getComputedStyle(a).borderLeftColor }));
          return { filas: lista('.explorer li a'), pestanas: lista('.tabs a') };
        });
        const resaltadas = r.filas.filter((f) => f.bg !== 'rgba(0, 0, 0, 0)');
        const pestanasConFondo = r.pestanas.filter((f) => f.bg !== 'rgba(0, 0, 0, 0)');
        if (resaltadas.length !== 1 || resaltadas[0].href !== '#' + id) malos.push(`fila ${id}: ${resaltadas.map((f) => f.href).join(',') || 'ninguna'}`);
        if (pestanasConFondo.length !== 1 || pestanasConFondo[0].href !== '#' + id) malos.push(`pestaña ${id}: ${pestanasConFondo.map((f) => f.href).join(',') || 'ninguna'}`);
      }
      report.check(`${p.path}: al recorrer cada sección solo queda resaltada la fila (y la pestaña) del archivo visible`, malos.length === 0, malos.join('; '));
      const nota = await page.evaluate(() => ({ cuerpo: document.body.innerText, nota: document.querySelector('#experiencia .mono').innerText }));
      const menciones = (nota.cuerpo.match(/cliente|client/gi) || []).length;
      const esperada = en ? "// most recent first. For confidentiality I don't name end clients." : '// de lo más reciente a lo más antiguo. Por confidencialidad no nombro a los clientes finales.';
      report.check(`${p.path}: la nota de experiencia es la única mención de clientes`, nota.nota.trim() === esperada && menciones === 1, `${menciones} menciones; «${nota.nota.trim()}»`);
      await context.close();
    }

    // ── Experiencia: línea de tiempo legible (sin puntuación de JSON, interlineado, ancho de línea, aire entre puestos).
    for (const vp of [VIEWPORTS.m, VIEWPORTS.d, VIEWPORTS.w]) {
      const { context, page } = await open(browser, base, p.path, { viewport: vp });
      const r = await page.evaluate(() => {
        const sec = document.getElementById('experiencia');
        const lh = (e) => { const c = getComputedStyle(e); return parseFloat(c.lineHeight) / parseFloat(c.fontSize); };
        const items = [...sec.querySelectorAll('.job-facts li')];
        const lineas = items.map((li) => {
          const c = getComputedStyle(li);
          const n = Math.round(li.getBoundingClientRect().height / parseFloat(c.lineHeight));
          return { chars: li.textContent.length / n, ancho: li.getBoundingClientRect().width, n };
        });
        const jobs = [...sec.querySelectorAll('.job')];
        const gaps = jobs.slice(1).map((j, i) => j.getBoundingClientRect().top - jobs[i].getBoundingClientRect().bottom);
        const probe = document.createElement('i');
        probe.style.color = 'var(--accent)';
        document.body.appendChild(probe);
        const accent = getComputedStyle(probe).color;
        probe.remove();
        return {
          texto: sec.innerText, jobs: jobs.length,
          interlineado: Math.min(...items.map(lh)), maxChars: Math.max(...lineas.map((l) => l.chars)), maxAncho: Math.max(...lineas.map((l) => l.ancho)),
          minGap: Math.min(...gaps), empresaAcento: [...sec.querySelectorAll('.job-title .co')].every((e) => getComputedStyle(e).color === accent),
          tecnologias: jobs.every((j) => j.querySelectorAll('.chips-tech li').length >= 3), fechas: jobs.every((j) => j.querySelector('.job-when').textContent.length > 5),
          bullets: Math.max(...jobs.map((j) => j.querySelectorAll('.job-facts li').length)),
          json: sec.querySelector('.json, dl, dt, dd') !== null,
        };
      });
      const sinJson = !/[{}]|":/.test(r.texto) && !r.json;
      report.check(`${p.path} ${vp.width} px: experiencia como línea de tiempo (5 puestos, sin puntuación de JSON, empresa en acento, etiquetas, fechas)`, r.jobs === 5 && sinJson && r.empresaAcento && r.tecnologias && r.fechas, JSON.stringify({ jobs: r.jobs, sinJson, acento: r.empresaAcento }));
      report.check(`${p.path} ${vp.width} px: experiencia legible (interlineado ≥ 1,6, ≤ 70 caracteres por línea, ≤ 4 viñetas, aire ≥ 32 px)`,
        r.interlineado >= 1.6 && r.maxChars <= 70 && r.bullets <= 4 && r.minGap >= 32, `interlineado ${r.interlineado.toFixed(2)}, ${r.maxChars.toFixed(0)} car., ${r.bullets} viñetas, aire ${Math.round(r.minGap)} px, ancho ${Math.round(r.maxAncho)} px`);
      await context.close();
    }
  }
}
