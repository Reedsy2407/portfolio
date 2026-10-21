// CPU en reposo: tiempo de CPU de todos los procesos del navegador (navegador, renderizador y GPU) durante una
// ventana de medición, como porcentaje de un núcleo. Objetivo ≈ 2 %. Se reporta el número tal cual; solo falla
// por encima del 10 %, que sería una regresión clara. Es un navegador sin interfaz con rasterizado por software:
// no sustituye a una medición con GPU real.
import { VIEWPORTS, open } from './lib.mjs';

export const name = 'CPU en reposo (portada, 1280 px)';

const VENTANA_MS = 6000;
/* El consumo varía con la carga de la máquina: se informa la mediana y el rango de 3 muestras. */
const MUESTRAS = 3;
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

const mediana = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const resumen = (xs) => `mediana ${mediana(xs).toFixed(1)} % (rango ${Math.min(...xs).toFixed(1)}–${Math.max(...xs).toFixed(1)} %, ${xs.length} muestras)`;

async function muestras(browser, base, opts) {
  const xs = [];
  for (let i = 0; i < MUESTRAS; i++) xs.push(await medir(browser, base, opts));
  return xs;
}

export async function run({ browser, base, report }) {
  const conEfectos = await muestras(browser, base, {});
  const reducido = await muestras(browser, base, { reduced: 'reduce' });
  report.info('CPU en reposo con efectos (objetivo ≈ 2 % de un núcleo)', resumen(conEfectos));
  report.info('CPU en reposo con movimiento reducido', resumen(reducido));
  report.check(`CPU en reposo con efectos por debajo del ${LIMITE} % (mediana)`, mediana(conEfectos) < LIMITE, `${mediana(conEfectos).toFixed(1)} %`);
}
