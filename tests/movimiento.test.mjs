// Efectos: partículas, glitch, líneas, interruptor «Efectos», prefers-reduced-motion y botón de tema.
import { VIEWPORTS, open } from './lib.mjs';

export const name = 'movimiento, efectos y tema';

const ANIM = `() => {
  const permitidas = new Set(['offset', 'easing', 'composite', 'computedOffset', 'opacity', 'transform', '--n']);
  /* Las transiciones de 120 ms de color y sombra al pasar el puntero son la excepción acotada del brief. */
  const as = document.getAnimations().filter((a) => a instanceof CSSAnimation);
  const fuera = [];
  let infinitas = 0;
  let minCiclo = Infinity;
  for (const a of as) {
    const t = a.effect.getComputedTiming();
    if (t.iterations === Infinity && a.playState === 'running') { infinitas++; minCiclo = Math.min(minCiclo, t.duration); }
    for (const k of a.effect.getKeyframes()) for (const p of Object.keys(k)) if (!permitidas.has(p)) fuera.push(a.animationName + ':' + p);
  }
  return { total: as.length, infinitas, minCiclo, fuera: [...new Set(fuera)] };
}`;

export async function run({ browser, base, report }) {
  // Con efectos: 12 partículas decorativas, solo transform/opacity, sin ciclos < 0,34 s, glitch único de ≤ 0,3 s.
  {
    const { context, page } = await open(browser, base, '/index.html', { viewport: VIEWPORTS.d });
    const fx = await page.evaluate(() => {
      const box = document.querySelector('.fx');
      const col = document.querySelector('.file > .lead').getBoundingClientRect();
      const cs = getComputedStyle(box);
      const xs = [...box.children].map((i) => i.getBoundingClientRect().left);
      const nm = getComputedStyle(document.querySelector('.nm'), '::before');
      return {
        n: box.children.length, aria: box.getAttribute('aria-hidden'), pe: cs.pointerEvents, disp: cs.display,
        izq: Math.min(...xs), derecha: col.right, glitchN: nm.animationIterationCount, glitchD: nm.animationDuration,
      };
    });
    report.check('1280 px: 12 partículas, decorativas (aria-hidden, sin eventos)', fx.n === 12 && fx.aria === 'true' && fx.pe === 'none' && fx.disp === 'block', `${fx.n} partículas`);
    report.check('1280 px: las partículas quedan a la derecha de la columna de lectura', fx.izq >= fx.derecha, `${Math.round(fx.izq)} ≥ ${Math.round(fx.derecha)}`);
    report.check('glitch del nombre: una vez y ≤ 0,3 s', fx.glitchN === '1' && parseFloat(fx.glitchD) <= 0.3, `${fx.glitchN} × ${fx.glitchD}`);
    const an = await page.evaluate(`(${ANIM})()`);
    report.check('animaciones: solo opacity y transform (más el contador --n)', an.fuera.length === 0, an.fuera.join(', '));
    report.check('animaciones infinitas con ciclo ≥ 0,34 s', an.infinitas > 0 && an.minCiclo >= 340, `${an.infinitas} infinitas, mínimo ${an.minCiclo} ms`);
    const lineas = await page.evaluate(() => ['--scan', '--scan-name'].map((v) => Number(getComputedStyle(document.documentElement).getPropertyValue(v).match(/fill-opacity='([.\d]+)'/)[1])));
    report.check('líneas de escaneo ≤ 8 % (oscuro)', lineas.every((a) => a <= 0.08), lineas.join(' y '));
    await context.close();
    const m = await open(browser, base, '/index.html', { viewport: VIEWPORTS.m });
    report.check('360 px: sin partículas', await m.page.evaluate(() => getComputedStyle(document.querySelector('.fx')).display === 'none'));
    await m.context.close();
    const c = await open(browser, base, '/index.html', { scheme: 'light' });
    const lc = await c.page.evaluate(() => ['--scan', '--scan-name'].map((v) => Number(getComputedStyle(document.documentElement).getPropertyValue(v).match(/fill-opacity='([.\d]+)'/)[1])));
    report.check('líneas de escaneo ≤ 8 % (claro)', lc.every((a) => a <= 0.08), lc.join(' y '));
    await c.context.close();
  }

  // prefers-reduced-motion: todo quieto y el contenido visible.
  {
    const { context, page } = await open(browser, base, '/index.html', { viewport: VIEWPORTS.d, reduced: 'reduce' });
    const r = await page.evaluate(`(() => {
      const a = (${ANIM})();
      const g = (sel, pseudo) => getComputedStyle(document.querySelector(sel), pseudo);
      return { a, fx: g('.fx').display, glitch: g('.nm', '::before').display, caret: g('.caret').animationName, rise: g('.rise').animationName, typed: g('.typed', '::after').display,
        lead: Number(g('.lead').opacity), h1: Number(g('h1').opacity) };
    })()`);
    report.check('movimiento reducido: sin animaciones infinitas', r.a.infinitas === 0, `${r.a.infinitas}`);
    report.check('movimiento reducido: sin partículas, glitch, tecleo, cursor parpadeante ni entrada escalonada',
      r.fx === 'none' && r.glitch === 'none' && r.typed === 'none' && r.caret === 'none' && r.rise === 'none', JSON.stringify({ fx: r.fx, glitch: r.glitch, typed: r.typed, caret: r.caret, rise: r.rise }));
    report.check('movimiento reducido: el contenido se ve entero desde el primer cuadro', r.lead === 1 && r.h1 === 1);
    await context.close();
    const cc = await open(browser, base, '/caso/esg-trazabilidad.html', { reduced: 'reduce' });
    report.check('movimiento reducido: en la demo no queda ninguna animación en curso', (await cc.page.evaluate(`(${ANIM})()`)).infinitas === 0);
    await cc.context.close();
  }

  // Interruptor «Efectos»: apaga partículas, brillo y glitch; se recuerda; sobrevive a un localStorage roto.
  {
    const { context, page } = await open(browser, base, '/index.html', { viewport: VIEWPORTS.d });
    const estado = () => page.evaluate(() => {
      const b = document.getElementById('fx-toggle');
      return {
        visible: !b.hidden && b.getBoundingClientRect().height >= 44, pressed: b.getAttribute('aria-pressed'), texto: b.textContent.trim(),
        fx: getComputedStyle(document.querySelector('.fx')).display, glitch: getComputedStyle(document.querySelector('.nm'), '::before').display,
        glow: getComputedStyle(document.querySelector('.name')).textShadow, guardado: localStorage.getItem('efectos'),
      };
    });
    const on = await estado();
    report.check('«Efectos» visible en la barra de estado, activado por defecto', on.visible && on.pressed === 'true' && on.texto === 'Efectos: sí' && on.fx === 'block' && on.glow !== 'none', JSON.stringify(on));
    await page.click('#fx-toggle');
    const off = await estado();
    report.check('«Efectos» apagado: sin partículas, glitch ni brillo', off.pressed === 'false' && off.texto === 'Efectos: no' && off.fx === 'none' && off.glitch === 'none' && /rgba\(0, 0, 0, 0\)/.test(off.glow), JSON.stringify(off));
    report.check('«Efectos» recuerda la preferencia (localStorage)', off.guardado === 'no');
    await page.reload({ waitUntil: 'load' });
    const rec = await estado();
    report.check('«Efectos» sigue apagado tras recargar', rec.pressed === 'false' && rec.fx === 'none', JSON.stringify(rec));
    await page.click('#fx-toggle');
    report.check('«Efectos» se vuelve a activar', (await estado()).fx === 'block');
    await context.close();

    const roto = await open(browser, base, '/index.html', {
      viewport: VIEWPORTS.d,
      init: () => { Storage.prototype.getItem = () => { throw new Error('bloqueado'); }; Storage.prototype.setItem = () => { throw new Error('bloqueado'); }; },
    });
    const errores = [];
    roto.page.on('pageerror', (e) => errores.push(e.message));
    await roto.page.click('#fx-toggle');
    await roto.page.click('[data-theme-toggle]');
    report.check('con localStorage bloqueado el interruptor y el tema siguen funcionando sin errores',
      errores.length === 0 && (await roto.page.evaluate(() => document.documentElement.dataset.fx === 'off' && document.documentElement.dataset.theme === 'claro')), errores.join('; '));
    await roto.context.close();
  }

  // Botón de tema: dice la acción, no es un interruptor, se recuerda.
  {
    const { context, page } = await open(browser, base, '/index.html', { viewport: VIEWPORTS.d, scheme: 'dark' });
    const lab = () => page.evaluate(() => {
      const b = document.querySelector('.tool[data-theme-toggle]');
      return { texto: [...b.querySelectorAll('.lbl')].filter((s) => getComputedStyle(s).display !== 'none').map((s) => s.textContent).join(''), pressed: b.hasAttribute('aria-pressed'), tema: document.documentElement.dataset.theme || '', guardado: localStorage.getItem('tema') };
    });
    const oscuro = await lab();
    await page.click('.tool[data-theme-toggle]');
    const claro = await lab();
    report.check('tema oscuro: el botón dice «Tema claro»; en claro, «Tema oscuro»; sin aria-pressed', oscuro.texto === 'Tema claro' && claro.texto === 'Tema oscuro' && !oscuro.pressed && !claro.pressed, `${oscuro.texto} → ${claro.texto}`);
    report.check('el tema elegido se recuerda', claro.guardado === 'claro');
    await page.reload({ waitUntil: 'load' });
    report.check('el tema claro persiste al recargar', (await lab()).tema === 'claro');
    await page.evaluate(() => window.scrollTo(0, 600));
    report.check('el scroll es el nativo (sin secuestro)', (await page.evaluate(() => Math.round(window.scrollY))) === 600);
    await context.close();
  }
}
