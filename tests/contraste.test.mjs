// Contraste AA calculado contra el peor caso, en ambos temas y en todas las páginas.
// Cada texto visible se mide sobre su fondo efectivo; si lleva resplandor (text-shadow) el fondo se mezcla con la alfa
// entera del brillo, y las líneas de escaneo oscurecen el fondo con la alfa máxima del tema. Se toma el peor caso.
import { PAGES, open } from './lib.mjs';

export const name = 'contraste AA (peor caso)';

const medir = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  };
  const over = (top, bot) => ({
    r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1,
  });
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const alphaOf = (prop) => {
    const m = getComputedStyle(document.documentElement).getPropertyValue(prop).match(/fill-opacity='([.d]+)'/);
    return m ? Number(m[1]) : 0;
  };
  const scanDoc = alphaOf('--scan');
  const scanName = alphaOf('--scan-name');
  /* Las líneas solo existen donde hay textura: el editor, la columna de números, los botones primarios y el nombre. */
  const scanOf = (el) => {
    if (el.closest('.name')) return Math.max(scanName, scanDoc);
    for (let e = el; e; e = e.parentElement) if (getComputedStyle(e).backgroundImage.includes('data:image/svg')) return scanDoc;
    return 0;
  };
  const glowAlpha = (() => {
    const g = parse(getComputedStyle(document.documentElement).getPropertyValue('--glow-c').trim());
    return g ? g.a : 0;
  })();
  const glowRgb = parse(getComputedStyle(document.documentElement).getPropertyValue('--glow-c').trim());
  const bgOf = (el) => {
    const stack = [];
    for (let e = el; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) { stack.push(c); if (c.a === 1) break; }
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (const c of stack.reverse()) base = over(c, base);
    return base;
  };
  const worst = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || seen.has(el)) continue;
    seen.add(el);
    if (el.closest('[aria-hidden="true"]:not(.gutter)') || el.closest('.sr, script, style, dialog:not([open]), [hidden]')) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    const bg0 = bgOf(el);
    const px = parseFloat(cs.fontSize);
    const large = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
    const glow = cs.textShadow !== 'none' && glowAlpha > 0;
    const bgs = [bg0];
    if (glow && glowRgb) bgs.push(over({ ...glowRgb, a: glowAlpha }, bg0));
    const sa = scanOf(el);
    const scanned = bgs.map((b) => over({ r: 0, g: 0, b: 0, a: sa }, b));
    let min = Infinity;
    for (const b of [...bgs, ...scanned]) {
      const f = fg.a < 1 ? over(fg, b) : fg;
      min = Math.min(min, ratio(f, b));
    }
    worst.push({ text: n.textContent.trim().slice(0, 28), ratio: min, need: large ? 3 : 4.5, tag: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '') });
  }
  return worst;
};

export async function run({ browser, base, report }) {
  for (const p of PAGES) {
    for (const scheme of ['dark', 'light']) {
      const { context, page } = await open(browser, base, p.path, { scheme });
      await page.evaluate(() => document.fonts.ready);
      const res = await page.evaluate(medir);
      const peor = res.reduce((a, b) => (b.ratio - b.need < a.ratio - a.need ? b : a));
      const fallan = res.filter((r) => r.ratio < r.need);
      report.check(`${p.path} (${scheme === 'dark' ? 'oscuro' : 'claro'}): ${res.length} textos ≥ AA`, fallan.length === 0,
        fallan.length ? fallan.slice(0, 4).map((r) => `«${r.text}» ${r.tag} ${r.ratio.toFixed(2)}<${r.need}`).join('; ') : `peor ${peor.ratio.toFixed(2)}:1 «${peor.text}»`);
      await context.close();
    }
  }
}
