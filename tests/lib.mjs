// Utilidades de las pruebas: servidor estático en proceso, carga de Playwright y un registro de resultados mínimo.
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { iniciarServidor } from './front/lib/servidor.mjs';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Todas las páginas del sitio, con el idioma y el tipo que la prueba necesita saber. */
export const PAGES = [
  { path: '/index.html', lang: 'es', kind: 'home' },
  { path: '/en/index.html', lang: 'en', kind: 'home' },
  { path: '/404.html', lang: 'es', kind: '404' },
];

// El servidor de pruebas es el de la biblioteca de front del kit: aplica el _headers, responde 404.html y evita los puertos
// que Chrome bloquea (ERR_UNSAFE_PORT), que con un puerto aleatorio hacían fallar las pruebas al azar.
export { parseHeaders, PUERTOS_NO_SEGUROS } from './front/lib/servidor.mjs';

/**
 * Sirve una carpeta (por defecto la raíz del repositorio) en un puerto libre. Las rutas que no existen responden con
 * 404.html y estado 404. Con `headers` (texto de un `_headers`) aplica las cabeceras que coinciden con cada ruta.
 */
export async function startServer({ root = ROOT, headers = null } = {}) {
  const servidor = await iniciarServidor({ carpeta: root, cabeceras: headers ?? false });
  return { base: servidor.base, close: servidor.cerrar };
}

/** Playwright: `playwright-core` del proyecto, o la carpeta que indique PLAYWRIGHT_CORE. */
export function loadPlaywright() {
  const require = createRequire(import.meta.url);
  for (const id of [process.env.PLAYWRIGHT_CORE, 'playwright-core'].filter(Boolean)) {
    try { return require(id); } catch {}
  }
  throw new Error('No se encontró playwright-core: ejecuta «npm install» o define PLAYWRIGHT_CORE con su carpeta.');
}

export function launch(pw) {
  return pw.chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
}

/** Registro de resultados: cada prueba llama a check(nombre, ok, detalle). */
export function createReport() {
  const results = [];
  return {
    results,
    check(name, ok, detail = '') {
      results.push({ name, ok: Boolean(ok), detail });
    },
    info(name, detail) {
      results.push({ name, ok: true, info: true, detail });
    },
  };
}

/** Atajos de contexto: tamaños y esquemas que usan las pruebas. */
export const VIEWPORTS = { m: { width: 360, height: 740 }, t: { width: 768, height: 1024 }, d: { width: 1280, height: 800 }, w: { width: 1920, height: 1080 } };

export async function open(browser, base, path, { viewport = VIEWPORTS.d, scheme = 'dark', reduced = 'no-preference', js = true, init } = {}) {
  const context = await browser.newContext({ viewport, colorScheme: scheme, reducedMotion: reduced, javaScriptEnabled: js, locale: 'es-PE' });
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  await page.goto(base + path, { waitUntil: 'load' });
  return { context, page };
}
