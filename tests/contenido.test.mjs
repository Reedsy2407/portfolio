// Contenido: legible sin JavaScript, enlaces externos con rel correcto, aviso del sistema real, demo sin red,
// semántica básica y reglas de estilo del brief (sin degradados, sin backdrop-filter, sin emoji, solo opacity/transform).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PAGES, ROOT, VIEWPORTS, open } from './lib.mjs';

export const name = 'contenido, enlaces y semántica';

const ESPERADO = {
  es: {
    home: ['Angel Saenz', '// Backend Developer', 'Java 21', 'Spring Boot', 'Python', 'Odoo', 'AWS Lambda', 'GCP', 'Azure DevOps', 'CIBERTEC', 'EF SET', 'Scrum Fundamentals Certified', '[correo por confirmar]', 'puede tardar hasta 1 minuto en despertar (hosting gratuito)', 'cuenta demo de un clic', 'plataforma de e-commerce', 'consultora de ERP'],
    caso: ['esg-trazabilidad', 'recicladores formalizados de Lima Metropolitana', 'certificado digital en PDF', 'Spring Boot 3.3.5', 'hexagonal', 'Outbox/Inbox', 'Liquibase', 'Angular', 'Render', 'Neon', 'CloudAMQP', 'datos simulados', 'sin validez legal', 'puede tardar hasta 1 minuto en despertar (hosting gratuito)', 'R-012'],
  },
  en: {
    home: ['Angel Saenz', '// Backend Developer', 'Java 21', 'CIBERTEC', 'EF SET', 'Scrum Fundamentals Certified', '[email to be confirmed]', 'may take up to 1 minute to wake up (free hosting)', 'e-commerce platform', 'ERP consultancy'],
    caso: ['esg-trazabilidad', 'formalized recyclers in Metropolitan Lima', 'digital PDF certificate', 'Outbox/Inbox', 'simulated data', 'may take up to 1 minute to wake up (free hosting)', 'R-012'],
  },
};
const EXTERNOS = {
  home: ['https://www.linkedin.com/in/saenzdev/', 'https://github.com/Reedsy2407', 'https://esg-frontend-egcf.onrender.com'],
  caso: ['https://www.linkedin.com/in/saenzdev/', 'https://github.com/Reedsy2407', 'https://esg-frontend-egcf.onrender.com', 'https://reedsy2407.github.io/esg-trazabilidad/', 'https://github.com/Reedsy2407/esg-trazabilidad'],
};

export async function run({ browser, base, report }) {
  for (const p of PAGES.filter((x) => x.kind !== '404')) {
    // Sin JavaScript: todo el texto del contenido está presente y a la vista.
    const { context, page } = await open(browser, base, p.path, { js: false, viewport: VIEWPORTS.d });
    const texto = await page.evaluate(() => document.querySelector('main').innerText.replace(/\s+/g, ' '));
    const faltan = ESPERADO[p.lang][p.kind].filter((x) => !texto.includes(x));
    report.check(`${p.path} sin JavaScript: el contenido se lee entero`, faltan.length === 0, faltan.join(' | '));
    const ocultos = await page.evaluate(() => [...document.querySelectorAll('main section')].filter((s) => s.getBoundingClientRect().height < 50 || getComputedStyle(s).visibility === 'hidden').map((s) => s.id));
    report.check(`${p.path} sin JavaScript: todas las secciones visibles`, ocultos.length === 0, ocultos.join(', '));
    if (p.kind === 'caso') {
      const filas = await page.evaluate(() => [...document.querySelectorAll('#demo-tabla tbody tr')].filter((r) => r.getBoundingClientRect().height > 0).length);
      report.check(`${p.path} sin JavaScript: la demo muestra sus 12 filas`, filas === 12, String(filas));
    }
    await context.close();
  }

  for (const p of PAGES.filter((x) => x.kind !== '404')) {
    const { context, page } = await open(browser, base, p.path, { viewport: VIEWPORTS.d });
    const info = await page.evaluate(() => {
      const ext = [...document.querySelectorAll('a[href^="http"]')].map((a) => ({ href: a.href, target: a.target, rel: a.rel, label: a.getAttribute('aria-label') || '' }));
      const sistema = document.querySelector('a[href^="https://esg-frontend-egcf"]');
      const aviso = document.getElementById('aviso-sistema');
      const visible = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
      return {
        ext, mailto: document.querySelectorAll('a[href^="mailto:"]').length,
        avisoAntes: Boolean(aviso && sistema && (aviso.compareDocumentPosition(sistema) & Node.DOCUMENT_POSITION_FOLLOWING)),
        avisoVisible: aviso ? visible(aviso) : false, describe: sistema ? sistema.getAttribute('aria-describedby') : null,
        h1: document.querySelectorAll('h1').length, landmarks: ['header', 'nav', 'main', 'footer'].every((t) => document.querySelector(t)),
        roles: document.querySelectorAll('[role=tab], [role=tablist]').length, ariaHiddenDeco: ['.fx', '.gutter', '.minimap', '.curline', '.lights'].every((s) => [...document.querySelectorAll(s)].every((e) => e.closest('[aria-hidden="true"]'))),
        correoEnlace: [...document.querySelectorAll('a')].some((a) => /correo|email/i.test(a.textContent) && !/LinkedIn/.test(a.textContent)),
        emoji: /\p{Extended_Pictographic}/u.test(document.body.innerText), lang: document.documentElement.lang,
      };
    });
    const mal = info.ext.filter((a) => a.target !== '_blank' || !/noopener/.test(a.rel) || !/noreferrer/.test(a.rel));
    report.check(`${p.path}: enlaces externos con target=_blank y rel="noopener noreferrer"`, info.ext.length > 0 && mal.length === 0, mal.map((a) => a.href).join(', '));
    const faltan = EXTERNOS[p.kind].filter((h) => !info.ext.some((a) => a.href === h || a.href === h + '/'));
    report.check(`${p.path}: enlaces esperados presentes`, faltan.length === 0, faltan.join(', '));
    report.check(`${p.path}: los enlaces externos avisan de la pestaña nueva`, info.ext.every((a) => /pestaña nueva|new tab/.test(a.label)), '');
    report.check(`${p.path}: aviso de despertar visible y antes del botón del sistema real`, info.avisoAntes && info.avisoVisible && info.describe === 'aviso-sistema');
    report.check(`${p.path}: correo como marcador, sin enlace`, info.mailto === 0 && !info.correoEnlace);
    report.check(`${p.path}: un h1, landmarks, sin roles inventados, decoración aria-hidden, sin emoji`, info.h1 === 1 && info.landmarks && info.roles === 0 && info.ariaHiddenDeco && !info.emoji, JSON.stringify({ h1: info.h1, lm: info.landmarks, roles: info.roles, deco: info.ariaHiddenDeco, emoji: info.emoji }));

    // Sin peticiones de calentamiento ni de red desde la demo: cero peticiones tras la carga, aun usando los filtros.
    if (p.kind === 'caso') {
      await page.waitForLoadState('networkidle');
      const nuevas = [];
      page.on('request', (r) => nuevas.push(r.url()));
      for (const f of ['programado', 'certificado', 'todos']) await page.click(`[data-filtro="${f}"]`);
      const resumen = await page.textContent('#demo-resumen');
      const filas = await page.evaluate(() => [...document.querySelectorAll('#demo-tabla tbody tr')].filter((r) => !r.hidden).length);
      report.check(`${p.path}: la demo filtra sin red y recalcula el resumen`, nuevas.length === 0 && filas === 12 && /12/.test(resumen), `${nuevas.length} peticiones; ${resumen}`);
      await page.click('[data-filtro="recogido"]');
      const r2 = await page.evaluate(() => ({ filas: [...document.querySelectorAll('#demo-tabla tbody tr')].filter((r) => !r.hidden).length, txt: document.getElementById('demo-resumen').textContent }));
      report.check(`${p.path}: el filtro «recogido» deja 3 filas y 1 162 kg`, r2.filas === 3 && /1 162/.test(r2.txt) && nuevas.length === 0, `${r2.filas} filas; ${r2.txt}`);
      const tabla = await page.evaluate(() => { const w = document.getElementById('demo-tabla'); return { tab: w.tabIndex, role: w.getAttribute('role'), lbl: w.getAttribute('aria-labelledby') }; });
      report.check(`${p.path}: tabla en región con foco de teclado y nombre`, tabla.tab === 0 && tabla.role === 'region' && Boolean(tabla.lbl));
    }
    await context.close();
  }

  // Enlaces internos: cada archivo enlazado existe y cada ancla apunta a un id presente.
  for (const p of PAGES) {
    const { context, page } = await open(browser, base, p.path, { viewport: VIEWPORTS.d });
    const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => !/^https?:/.test(h)))]);
    const rotos = [];
    for (const h of hrefs) {
      const url = new URL(h, page.url());
      if (url.pathname !== new URL(page.url()).pathname) {
        const r = await page.request.get(url.origin + url.pathname);
        if (r.status() !== 200) rotos.push(h);
      } else if (url.hash && !(await page.evaluate((id) => Boolean(document.getElementById(id)), url.hash.slice(1)))) rotos.push(h);
    }
    report.check(`${p.path}: enlaces internos y anclas válidos (${hrefs.length})`, rotos.length === 0, rotos.join(', '));
    await context.close();
  }

  // 404 real: una ruta que no existe responde 404 con la página 404.
  {
    const { context, page } = await open(browser, base, '/no-existe.html', { viewport: VIEWPORTS.d });
    report.check('una ruta inexistente muestra la página 404', (await page.textContent('h1')).trim() === '404');
    await context.close();
  }

  // Reglas de estilo del brief sobre el CSS.
  const css = readFileSync(join(ROOT, 'assets/css/site.css'), 'utf8');
  report.check('CSS sin degradados ni backdrop-filter', !/gradient\(/i.test(css) && !/backdrop-filter/i.test(css));
  const keyframes = [...css.matchAll(/@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g)];
  const props = new Set();
  for (const [, , cuerpo] of keyframes) for (const m of cuerpo.matchAll(/([\w-]+)\s*:/g)) props.add(m[1]);
  const permitidas = new Set(['opacity', 'transform', '--n']);
  const otras = [...props].filter((x) => !permitidas.has(x));
  report.check('@keyframes: solo opacity, transform y el contador --n', otras.length === 0 && keyframes.length >= 6, otras.join(', ') || `${keyframes.length} animaciones`);
  report.check('CSS sin fuentes prohibidas (Inter, Roboto, Arial como voz)', !/font-family:[^;]*\b(Inter|Roboto)\b/.test(css));
  const html = PAGES.map((p) => readFileSync(join(ROOT, p.path), 'utf8')).join('');
  report.check('páginas sin «Lorem ipsum», sin Co-Authored y sin correos', !/lorem ipsum|co-authored|@\w+\.\w+/i.test(html.replace(/ci@/g, '')));
}
