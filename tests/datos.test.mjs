// Datos confirmados: el CV solo se enlaza si existe (y nunca queda un enlace roto). Los teléfonos y los clientes finales
// los comprueba la biblioteca del kit (tests/front, prueba «datos»).
// El PDF no se abre ni se modifica: solo se comprueba que existe, su tamaño y que el servidor responde.
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { PAGES, ROOT, VIEWPORTS, open } from './lib.mjs';

export const name = 'datos confirmados: CV';

const CV = join(ROOT, 'assets', 'cv', 'CV_Angel_Saenz.pdf');

export async function run({ browser, base, report }) {
  const hay = existsSync(CV);
  report.info('CV', hay ? `assets/cv/CV_Angel_Saenz.pdf existe (${(statSync(CV).size / 1024).toFixed(0)} KB)` : 'assets/cv/CV_Angel_Saenz.pdf no existe: se espera el marcador «[CV por confirmar]» sin enlace');

  for (const p of PAGES.filter((x) => x.kind === 'home')) {
    const { context, page } = await open(browser, base, p.path, { viewport: VIEWPORTS.d });
    const cv = await page.evaluate(() => {
      const enlaces = [...document.querySelectorAll('a[href*="CV_Angel_Saenz"]')].map((a) => ({
        href: a.getAttribute('href'), target: a.target, rel: a.rel, nombre: a.getAttribute('aria-label') || a.textContent,
        visible: a.getBoundingClientRect().width > 0, texto: a.textContent,
      }));
      return { enlaces, marcador: /\[CV por confirmar\]|\[CV to be confirmed\]/.test(document.querySelector('main').innerText) };
    });
    if (hay) {
      const bien = cv.enlaces.length > 0 && cv.enlaces.every((a) => a.target === '_blank' && /noopener/.test(a.rel) && /noreferrer/.test(a.rel) && /PDF/.test(a.nombre) && /(pestaña nueva|new tab)/.test(a.nombre));
      const tam = p.kind === 'home' ? cv.enlaces.some((a) => /\(PDF, [\d.]+ (KB|MB)\)/.test(a.texto)) : true;
      report.check(`${p.path}: el CV existe y se enlaza (pestaña nueva, rel, nombre accesible con PDF)`, bien && tam && !cv.marcador, JSON.stringify(cv.enlaces[0] || {}));
      const r = cv.enlaces.length ? await page.request.head(new URL(cv.enlaces[0].href, page.url()).href) : null;
      report.check(`${p.path}: el enlace al CV responde 200`, Boolean(r) && r.status() === 200, r ? String(r.status()) : 'el PDF existe pero la página no lo enlaza');
    } else {
      report.check(`${p.path}: sin CV → marcador visible y ningún enlace a él`, cv.enlaces.length === 0 && cv.marcador, `${cv.enlaces.length} enlaces; marcador ${cv.marcador}`);
    }
    await context.close();
  }
}
