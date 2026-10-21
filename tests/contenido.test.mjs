// Contenido: legible sin JavaScript, enlaces externos con rel correcto, aviso del sistema real, semántica básica
// y reglas de estilo del brief (sin degradados, sin backdrop-filter, sin emoji, solo opacity/transform).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PAGES, ROOT, VIEWPORTS, open } from './lib.mjs';

export const name = 'contenido, enlaces y semántica';

const DISPONIBLE = {
  es: 'Disponible para proyectos freelance a tiempo parcial. Respondo por correo en 24 a 48 horas. Zona horaria: Lima (UTC−5).',
  en: 'Available for part-time freelance projects. I reply by email within 24–48 hours. Time zone: Lima (UTC−5).',
};
const PERIODO_PROYECTO = { es: 'Proyecto propio (EFSRT, CIBERTEC) · septiembre – octubre 2026', en: 'Personal project (EFSRT, CIBERTEC) · September – October 2026' };
const AVISO = { es: 'puede tardar hasta 1 minuto en despertar (hosting gratuito)', en: 'may take up to 1 minute to wake up (free hosting)' };
const ESPERADO = {
  es: ['Angel Saenz', '// Backend Developer', 'Java 21', 'Spring Boot', 'Kubernetes', 'Azure DevOps', 'HRF GROUP S.A.C.', 'Hera Consulting SAC', 'COMPIPRO', 'plataforma de e-commerce B2B', 'sector educación', 'CRM empresarial', 'Cibertec', 'EF SET 64/100', 'Scrum Fundamentals Certified', 'saenzvelarde2006@gmail.com', 'cuenta demo de un clic', 'recicladores formalizados de Lima Metropolitana', 'certificado digital en PDF', 'Spring Boot 3.3.5', 'Outbox/Inbox', 'Liquibase'],
  en: ['Angel Saenz', '// Backend Developer', 'Java 21', 'Kubernetes', 'HRF GROUP S.A.C.', 'Hera Consulting SAC', 'COMPIPRO', 'B2B e-commerce platform', 'education sector', 'enterprise CRM', 'Cibertec', 'EF SET 64/100', 'Scrum Fundamentals Certified', 'saenzvelarde2006@gmail.com', 'formalized recyclers in Metropolitan Lima', 'digital PDF certificate', 'Outbox/Inbox'],
};
const EXTERNOS = [
  'https://www.linkedin.com/in/saenzdev/', 'https://github.com/Reedsy2407', 'https://esg-frontend-egcf.onrender.com',
  'https://reedsy2407.github.io/esg-trazabilidad/', 'https://github.com/Reedsy2407/esg-trazabilidad',
];

export async function run({ browser, base, report }) {
  const portadas = PAGES.filter((x) => x.kind === 'home');

  for (const p of portadas) {
    // Sin JavaScript: todo el texto del contenido está presente y a la vista.
    const { context, page } = await open(browser, base, p.path, { js: false, viewport: VIEWPORTS.d });
    const texto = await page.evaluate(() => document.querySelector('main').innerText.replace(/\s+/g, ' '));
    const faltan = [...ESPERADO[p.lang], AVISO[p.lang], DISPONIBLE[p.lang], PERIODO_PROYECTO[p.lang]].filter((x) => !texto.includes(x));
    report.check(`${p.path} sin JavaScript: el contenido se lee entero`, faltan.length === 0, faltan.join(' | '));
    const ocultos = await page.evaluate(() => [...document.querySelectorAll('main section')].filter((s) => s.getBoundingClientRect().height < 50 || getComputedStyle(s).visibility === 'hidden').map((s) => s.id));
    const marcasEs = p.lang === 'en' ? (texto.match(/(con|para|más|las|los|una|del|sin|de la)/g) || []) : [];
    report.check(`${p.path}: la traducción no deja palabras en español`, marcasEs.length === 0, marcasEs.join(', '));
    const mailtosSinJs = await page.evaluate(() => [...document.querySelectorAll('a[href^="mailto:"]')].map((a) => a.getAttribute('href')));
    report.check(`${p.path} sin JavaScript: un único correo, con enlace mailto`, mailtosSinJs.length === 1 && mailtosSinJs[0] === 'mailto:saenzvelarde2006@gmail.com', mailtosSinJs.join(', '));
    report.check(`${p.path} sin JavaScript: todas las secciones visibles`, ocultos.length === 0, ocultos.join(', '));
    await context.close();
  }

  for (const p of portadas) {
    const { context, page } = await open(browser, base, p.path, { viewport: VIEWPORTS.d });
    const info = await page.evaluate(() => {
      const ext = [...document.querySelectorAll('a[href^="http"]')].map((a) => ({ href: a.href, target: a.target, rel: a.rel, label: a.getAttribute('aria-label') || '' }));
      const sistema = document.querySelector('a[href^="https://esg-frontend"]');
      const aviso = document.getElementById('aviso-sistema');
      const visible = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
      return {
        ext,
        avisoAntes: Boolean(aviso && sistema && (aviso.compareDocumentPosition(sistema) & Node.DOCUMENT_POSITION_FOLLOWING)),
        avisoVisible: aviso ? visible(aviso) : false, describe: sistema ? sistema.getAttribute('aria-describedby') : null,
        h1: document.querySelectorAll('h1').length, landmarks: ['header', 'nav', 'main', 'footer'].every((t) => document.querySelector(t)),
        roles: document.querySelectorAll('[role=tab], [role=tablist]').length,
        ariaHiddenDeco: ['.fx', '.gutter', '.minimap', '.curline', '.lights'].every((s) => [...document.querySelectorAll(s)].every((e) => e.closest('[aria-hidden="true"]'))),
        emoji: /\p{Extended_Pictographic}/u.test(document.body.innerText),
        pendientes: [...document.querySelectorAll('.todo')].map((e) => e.textContent),
      };
    });
    const mal = info.ext.filter((a) => a.target !== '_blank' || !/noopener/.test(a.rel) || !/noreferrer/.test(a.rel));
    report.check(`${p.path}: enlaces externos con target=_blank y rel="noopener noreferrer"`, info.ext.length > 0 && mal.length === 0, mal.map((a) => a.href).join(', '));
    const faltan = EXTERNOS.filter((h) => !info.ext.some((a) => a.href === h || a.href === h + '/'));
    report.check(`${p.path}: enlaces esperados presentes`, faltan.length === 0, faltan.join(', '));
    report.check(`${p.path}: los enlaces externos avisan de la pestaña nueva`, info.ext.every((a) => /pestaña nueva|new tab/.test(a.label)), '');
    report.check(`${p.path}: aviso de despertar visible y antes del botón del sistema real`, info.avisoAntes && info.avisoVisible && info.describe === 'aviso-sistema');
    report.check(`${p.path}: un h1, landmarks, sin roles inventados, decoración aria-hidden, sin emoji`, info.h1 === 1 && info.landmarks && info.roles === 0 && info.ariaHiddenDeco && !info.emoji, JSON.stringify({ h1: info.h1, lm: info.landmarks, roles: info.roles, deco: info.ariaHiddenDeco, emoji: info.emoji }));
    report.check(`${p.path}: ningún marcador «por confirmar» visible`, info.pendientes.length === 0, info.pendientes.join(', '));
    await context.close();
  }

  // Enlaces internos: cada archivo enlazado existe y cada ancla apunta a un id presente.
  for (const p of PAGES) {
    const { context, page } = await open(browser, base, p.path, { viewport: VIEWPORTS.d });
    const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => !/^(https?|mailto|tel):/.test(h)))]);
    const rotos = [];
    for (const h of hrefs) {
      const url = new URL(h, page.url());
      if (url.pathname !== new URL(page.url()).pathname) {
        const r = await page.request.head(url.origin + url.pathname);
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
  report.check('páginas sin «Lorem ipsum» ni Co-Authored', !/lorem ipsum|co-authored/i.test(html));
  const correos = [...new Set(html.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || [])];
  report.check('el único correo publicado es el confirmado', correos.length === 1 && correos[0] === 'saenzvelarde2006@gmail.com', correos.join(', '));
  const prohibidos = ['cliente-1', 'cliente-3', 'cliente-4'].filter((n) => new RegExp(n, 'i').test(html)).concat(/\bcliente-2\b/i.test(html) ? ['cliente-2'] : []);
  report.check('ningún HTML nombra a los clientes finales (cliente-1, cliente-2, cliente-3 Schools, cliente-4)', prohibidos.length === 0, prohibidos.join(', '));
  report.check('ningún HTML enlaza teléfonos (tel:, WhatsApp, wa.me)', !/href="(tel:|sms:|https?:\/\/(wa\.me|api\.whatsapp|wa\.link))/i.test(html));
}
