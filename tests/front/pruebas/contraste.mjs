// Contraste AA calculado contra el peor caso, en cada tema y página. Cada texto visible se mide sobre su fondo efectivo;
// si lleva resplandor (text-shadow) el fondo se mezcla también con el color del resplandor, y si él o un ancestro tiene
// una imagen de fondo (textura de líneas, puntos) se mide además con esa capa oscureciendo y aclarando hasta
// `umbrales.texturaAlfaMax`. Se toma el peor caso. No depende de nombres de clase: solo de estilos calculados.
import { abrir, esperarEstable, nombreTema } from '../lib/navegador.mjs';
import { colorFactory } from '../lib/color.mjs';
import { paginasDe } from '../lib/config.mjs';

export const id = 'contraste';
export const nombre = 'contraste AA (peor caso)';

function medir({ texturaAlfa, ignorar }, fabricaColor) {
  const { parse, over, ratio } = fabricaColor();
  const bgOf = (el) => {
    const capas = [];
    for (let e = el; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) { capas.push(c); if (c.a === 1) break; }
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (const c of capas.reverse()) base = over(c, base);
    return base;
  };
  const conTextura = (el) => {
    for (let e = el; e; e = e.parentElement) if (/url\(/.test(getComputedStyle(e).backgroundImage)) return true;
    return false;
  };
  const resultados = [];
  const visto = new Set();
  const recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = recorrido.nextNode(); n; n = recorrido.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || visto.has(el)) continue;
    visto.add(el);
    if (el.closest('[aria-hidden="true"], script, style, noscript, dialog:not([open]), [hidden]') || (ignorar.length && el.closest(ignorar.join(',')))) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const fg = parse(cs.color);
    if (!fg) continue;
    const bg = bgOf(el);
    const px = parseFloat(cs.fontSize);
    const grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
    const fondos = [bg];
    if (cs.textShadow !== 'none') {
      const brillo = parse(cs.textShadow);
      if (brillo && brillo.a > 0) fondos.push(over(brillo, bg));
    }
    const todos = [...fondos];
    if (texturaAlfa > 0 && conTextura(el)) for (const b of fondos) for (const k of [0, 255]) todos.push(over({ r: k, g: k, b: k, a: texturaAlfa }, b));
    let min = Infinity;
    for (const b of todos) min = Math.min(min, ratio(fg.a < 1 ? over(fg, b) : fg, b));
    resultados.push({ texto: n.textContent.trim().slice(0, 28), ratio: min, grande, etiqueta: el.tagName.toLowerCase() });
  }
  return resultados;
}

export async function run({ browser, base, report, config }) {
  const u = config.umbrales;
  /* La función y la fábrica de colores viajan como texto: una sola fuente de la aritmética (lib/color.mjs). */
  const fuente = `(${medir})(${JSON.stringify({ texturaAlfa: u.texturaAlfaMax, ignorar: config.selectores.ignorarTexto })}, ${colorFactory})`;
  for (const p of paginasDe(config)) {
    for (const tema of config.temas) {
      const { context, page } = await abrir(browser, base, p.ruta, { tema });
      await esperarEstable(page);
      const res = await page.evaluate(fuente);
      const fallan = res.filter((r) => r.ratio < (r.grande ? u.contrasteTextoGrande : u.contrasteTexto));
      const peor = res.length ? res.reduce((a, b) => (b.ratio < a.ratio ? b : a)) : null;
      report.check(`${p.ruta} (${nombreTema(tema)}): ${res.length} textos ≥ AA contra el peor caso`, res.length > 0 && fallan.length === 0,
        fallan.length ? fallan.slice(0, 4).map((r) => `«${r.texto}» ${r.etiqueta} ${r.ratio.toFixed(2)}`).join('; ') : res.length ? `peor ${peor.ratio.toFixed(2)}:1 «${peor.texto}»` : 'no se encontró texto visible');
      await context.close();
    }
  }
}
