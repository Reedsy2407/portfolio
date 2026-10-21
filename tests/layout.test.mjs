// Maquetación: sin desborde a 360 px, objetivos de 44 px, foco de 3 px, texto ≥ 15 px y números de línea a toda la altura.
import { PAGES, VIEWPORTS, open } from './lib.mjs';

export const name = 'maquetación y accesibilidad táctil';

const OBJETIVOS = '.btn, .tag, .chip, .tabs a, .explorer a, .explorer summary, .lang a, .tool, .act:not(.off), .st-btn, .mark, dialog a';

export async function run({ browser, base, report }) {
  for (const p of PAGES) {
    for (const [scheme, viewport] of [['dark', VIEWPORTS.m], ['light', VIEWPORTS.m], ['dark', { width: 768, height: 900 }], ['dark', VIEWPORTS.d]]) {
      const { context, page } = await open(browser, base, p.path, { viewport, scheme });
      const d = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      report.check(`${p.path} ${viewport.width} px (${scheme === 'dark' ? 'oscuro' : 'claro'}): sin desborde horizontal`, d.sw <= d.cw, `${d.sw} ≤ ${d.cw}`);
      await context.close();
    }
  }

  for (const p of PAGES) {
    const { context, page } = await open(browser, base, p.path, { viewport: VIEWPORTS.m });
    await page.click('#exp-toggle'); // el menú móvil abre el explorador: sus filas también cuentan
    const chicos = await page.evaluate((sel) => [...document.querySelectorAll(sel)].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width && r.height && !e.closest('.skip') && (r.height < 43.5 || r.width < 43.5);
    }).map((e) => `${e.tagName.toLowerCase()}.${e.className || e.id} ${Math.round(e.getBoundingClientRect().width)}×${Math.round(e.getBoundingClientRect().height)}`), OBJETIVOS);
    report.check(`${p.path} 360 px: objetivos de 44 px`, chicos.length === 0, chicos.slice(0, 5).join('; '));
    await context.close();

    const w = await open(browser, base, p.path, { viewport: VIEWPORTS.d });
    const chicosD = await w.page.evaluate((sel) => [...document.querySelectorAll(sel)].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width && r.height && !e.closest('.skip') && (r.height < 43.5 || r.width < 43.5);
    }).map((e) => `${e.tagName.toLowerCase()}.${e.className || e.id}`), OBJETIVOS);
    report.check(`${p.path} 1280 px: objetivos de 44 px`, chicosD.length === 0, chicosD.slice(0, 5).join('; '));

    const minimo = await w.page.evaluate(() => {
      const bajos = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const el = n.parentElement;
        if (!n.textContent.trim() || el.closest('[aria-hidden="true"]:not(.gutter), .sr, script, style, [hidden]')) continue;
        const px = parseFloat(getComputedStyle(el).fontSize);
        if (px < 15 && el.getBoundingClientRect().width) bajos.push(`${el.tagName.toLowerCase()} ${px}px`);
      }
      return { bajos, body: getComputedStyle(document.body).fontSize };
    });
    report.check(`${p.path}: texto ≥ 15 px y base de 18 px`, minimo.bajos.length === 0 && minimo.body === '18px', minimo.bajos.slice(0, 3).join('; ') || `base ${minimo.body}`);

    // Foco de 3 px en todo lo que se puede enfocar con el teclado (se recorre con Tab).
    const sinFoco = [];
    let enfocados = 0;
    for (let i = 0; i < 90; i++) {
      await w.page.keyboard.press('Tab');
      const f = await w.page.evaluate(() => {
        const e = document.activeElement;
        if (!e || e === document.body || e.__visto) return null;
        e.__visto = true;
        const cs = getComputedStyle(e);
        return { id: e.tagName.toLowerCase() + '[' + (e.getAttribute('href') || e.id || e.className) + ']', w: cs.outlineWidth, s: cs.outlineStyle };
      });
      if (!f) continue;
      enfocados++;
      if (f.w !== '3px' || f.s === 'none') sinFoco.push(`${f.id} ${f.w} ${f.s}`);
    }
    report.check(`${p.path}: foco visible de 3 px (${enfocados} elementos)`, sinFoco.length === 0 && enfocados > 5, sinFoco.slice(0, 3).join('; '));

    // Los números de línea cubren toda la altura del documento en los anchos donde se muestran.
    if (p.kind !== '404') {
      for (const vp of [{ width: 600, height: 900 }, VIEWPORTS.d, VIEWPORTS.w]) {
        await w.page.setViewportSize(vp);
        const g = await w.page.evaluate(() => {
          const doc = document.querySelector('.doc').getBoundingClientRect().height;
          const rows = document.querySelector('.gutter').children.length;
          return { doc, rows, cubre: rows * 28 };
        });
        report.check(`${p.path} ${vp.width} px: números de línea a toda la altura`, g.cubre >= g.doc, `${g.rows} filas = ${g.cubre} px ≥ ${Math.round(g.doc)} px`);
      }
    }
    await w.context.close();
  }
}
