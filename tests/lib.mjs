// Utilidades de las pruebas: servidor estático en proceso, carga de Playwright y un registro de resultados mínimo.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Todas las páginas del sitio, con el idioma y el tipo que la prueba necesita saber. */
export const PAGES = [
  { path: '/index.html', lang: 'es', kind: 'home' },
  { path: '/caso/esg-trazabilidad.html', lang: 'es', kind: 'caso' },
  { path: '/en/index.html', lang: 'en', kind: 'home' },
  { path: '/en/case/esg-trazabilidad.html', lang: 'en', kind: 'caso' },
  { path: '/404.html', lang: 'es', kind: '404' },
];

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};

/** Sirve la raíz del repositorio en un puerto libre. Las rutas que no existen responden con 404.html y estado 404. */
export function startServer() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let rel = decodeURIComponent(url.pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const file = normalize(join(ROOT, rel));
    const dentro = file.startsWith(ROOT + sep);
    try {
      if (!dentro || !(await stat(file)).isFile()) throw new Error('no');
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404, { 'content-type': MIME['.html'] });
      res.end(await readFile(join(ROOT, '404.html')));
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({
      base: `http://127.0.0.1:${server.address().port}`,
      close: () => new Promise((r) => server.close(r)),
    }));
  });
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
export const VIEWPORTS = { m: { width: 360, height: 740 }, d: { width: 1280, height: 800 }, w: { width: 1920, height: 1080 } };

export async function open(browser, base, path, { viewport = VIEWPORTS.d, scheme = 'dark', reduced = 'no-preference', js = true, init } = {}) {
  const context = await browser.newContext({ viewport, colorScheme: scheme, reducedMotion: reduced, javaScriptEnabled: js, locale: 'es-PE' });
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  await page.goto(base + path, { waitUntil: 'load' });
  return { context, page };
}
