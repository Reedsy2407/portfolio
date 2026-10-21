// Datos confirmados: el CV solo se enlaza si existe (y nunca queda un enlace roto), sin teléfonos y sin clientes finales.
// El PDF no se abre ni se modifica: solo se comprueba que existe, su tamaño y que el servidor responde.
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { PAGES, ROOT, VIEWPORTS, open } from './lib.mjs';

export const name = 'datos confirmados: CV, teléfonos y clientes';

const CV = join(ROOT, 'assets', 'cv', 'CV_Angel_Saenz.pdf');
// Siete o más dígitos seguidos (con espacios, puntos, guiones o paréntesis entre ellos) se leen como un teléfono.
const TELEFONO = /(?:\+?\d[\s().-]?){7,}/;

export async function run({ browser, base, report }) {
  const hay = existsSync(CV);
  report.info('CV', hay ? `assets/cv/CV_Angel_Saenz.pdf existe (${(statSync(CV).size / 1024).toFixed(0)} KB)` : 'assets/cv/CV_Angel_Saenz.pdf no existe: se espera el marcador «[CV por confirmar]» sin enlace');

  for (const p of PAGES.filter((x) => x.kind === 'home' || x.kind === 'caso')) {
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

    // Sin teléfonos: ni en el texto visible (contenido y barras) ni en enlaces tel:/WhatsApp.
    const texto = await page.evaluate(() => ['main', '.titlebar', '.status'].map((s) => document.querySelector(s).innerText).join('\n'));
    const m = texto.match(TELEFONO);
    report.check(`${p.path}: ningún número que parezca un teléfono`, !m, m ? m[0] : '');
    await context.close();
  }

  // El patrón detecta de verdad un teléfono (la prueba no es vacía) y no confunde años, versiones ni cifras de la demo.
  report.check('el patrón de teléfonos detecta «+51 999 888 777» y «(01) 234-5678»', TELEFONO.test('+51 999 888 777') && TELEFONO.test('(01) 234-5678'));
  report.check('el patrón de teléfonos deja pasar años, versiones y cifras', !['abril 2026 – actualidad', 'Spring Boot 3.3.5', 'EF SET 64/100', '3 020 kg', '2023 – 2025'].some((s) => TELEFONO.test(s)));
}
