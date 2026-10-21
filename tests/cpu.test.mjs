// CPU en reposo: tiempo de CPU de todos los procesos del navegador (navegador, renderizador y GPU) durante una
// ventana de medición, como porcentaje de un núcleo. Objetivo ≈ 2 %. Se reporta el número tal cual; solo falla
// por encima del 10 %, que sería una regresión clara. Es un navegador sin interfaz con rasterizado por software:
// no sustituye a una medición con GPU real.
import { VIEWPORTS, open } from './lib.mjs';

export const name = 'CPU en reposo (portada, 1280 px)';

const VENTANA_MS = 8000; // ventana de medición: el consumo se promedia en tiempo, no es una espera de sincronización
const LIMITE = 10;

async function cpuTotal(cdp) {
  const { processInfo } = await cdp.send('SystemInfo.getProcessInfo');
  return processInfo.reduce((n, p) => n + p.cpuTime, 0);
}

async function medir(browser, base, opts) {
  const { context, page } = await open(browser, base, '/index.html', { viewport: VIEWPORTS.d, ...opts });
  await page.evaluate(() => document.fonts.ready);
  // En reposo: las animaciones finitas (entrada, tecleo, glitch) ya terminaron.
  await page.waitForFunction(() => document.getAnimations().every((a) => a.effect.getComputedTiming().iterations === Infinity || a.playState === 'finished'));
  const cdp = await browser.newBrowserCDPSession();
  const t0 = Date.now();
  const c0 = await cpuTotal(cdp);
  await page.waitForTimeout(VENTANA_MS);
  const c1 = await cpuTotal(cdp);
  const pct = ((c1 - c0) / ((Date.now() - t0) / 1000)) * 100;
  await cdp.detach();
  await context.close();
  return pct;
}

export async function run({ browser, base, report }) {
  const conEfectos = await medir(browser, base, {});
  const sinEfectos = await medir(browser, base, { init: () => { try { localStorage.setItem('efectos', 'no'); } catch {} } });
  const reducido = await medir(browser, base, { reduced: 'reduce' });
  report.info('CPU en reposo con efectos', `${conEfectos.toFixed(1)} % de un núcleo (objetivo ≈ 2 %)`);
  report.info('CPU en reposo con «Efectos» apagado', `${sinEfectos.toFixed(1)} %`);
  report.info('CPU en reposo con movimiento reducido', `${reducido.toFixed(1)} %`);
  report.check(`CPU en reposo con efectos por debajo del ${LIMITE} %`, conEfectos < LIMITE, `${conEfectos.toFixed(1)} %`);
}
