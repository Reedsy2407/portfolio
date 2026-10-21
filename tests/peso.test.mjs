// Presupuesto: portada ≤ 150 KB, JS ≤ 15 KB, cero dependencias externas, máximo cuatro fuentes.
import { PAGES } from './lib.mjs';

export const name = 'peso y dependencias';

export async function run({ browser, base, report }) {
  for (const p of PAGES) {
    const sizes = [];
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    const externos = [];
    page.on('response', async (r) => {
      const url = r.url();
      if (!url.startsWith(base)) { externos.push(url); return; }
      const body = await r.body().catch(() => Buffer.alloc(0));
      sizes.push({ url: url.slice(base.length), type: r.headers()['content-type'] || '', bytes: body.length });
    });
    await page.goto(base + p.path, { waitUntil: 'networkidle' });
    const inlineJs = await page.evaluate(() => [...document.scripts].filter((s) => !s.src).reduce((n, s) => n + new Blob([s.textContent]).size, 0));
    await ctx.close();
    const total = sizes.reduce((n, s) => n + s.bytes, 0);
    const js = sizes.filter((s) => s.type.includes('javascript')).reduce((n, s) => n + s.bytes, 0) + inlineJs;
    const fuentes = sizes.filter((s) => s.url.endsWith('.woff2')).length;
    const kb = (n) => (n / 1024).toFixed(1) + ' KB';
    if (p.kind === 'home') {
      report.check(`${p.path}: portada ≤ 150 KB`, total <= 150 * 1024, kb(total));
      report.check(`${p.path}: JS ≤ 15 KB`, js <= 15 * 1024, kb(js));
    } else {
      report.info(`${p.path}: peso total`, `${kb(total)} (JS ${kb(js)})`);
      report.check(`${p.path}: JS ≤ 15 KB`, js <= 15 * 1024, kb(js));
    }
    report.check(`${p.path}: sin peticiones a otros orígenes`, externos.length === 0, externos.join(', '));
    report.check(`${p.path}: máximo cuatro archivos de fuente`, fuentes <= 4, String(fuentes));
  }
}
