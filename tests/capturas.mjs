// Capturas locales del sitio (360, 1280 y 1920 px; tema oscuro y claro) en design/refs/sitio/, que git ignora.
// Uso: node tests/capturas.mjs [ruta ...]   (sin argumentos: la portada y el caso, en español)
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, VIEWPORTS, launch, loadPlaywright, open, startServer } from './lib.mjs';

const OUT = join(ROOT, 'design', 'refs', 'sitio');
mkdirSync(OUT, { recursive: true });
const rutas = process.argv.slice(2);
const paginas = rutas.length ? rutas : ['/index.html', '/caso/esg-trazabilidad.html'];

const server = await startServer();
const browser = await launch(loadPlaywright());
try {
  for (const path of paginas) {
    for (const [tam, viewport] of Object.entries(VIEWPORTS)) {
      for (const scheme of ['dark', 'light']) {
        const { context, page } = await open(browser, server.base, path, { viewport, scheme });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() => document.getAnimations().every((a) => a.effect.getComputedTiming().iterations === Infinity || a.playState === 'finished'));
        const nombre = `${path.replace(/^\//, '').replace(/[/.]/g, '-').replace(/-html$/, '')}-${viewport.width}-${scheme === 'dark' ? 'oscuro' : 'claro'}.png`;
        await page.screenshot({ path: join(OUT, nombre) });
        // Página completa: el documento largo del editor.
        await page.screenshot({ path: join(OUT, nombre.replace('.png', '-completa.png')), fullPage: true });
        await context.close();
        console.log(nombre);
      }
    }
  }
} finally {
  await browser.close();
  await server.close();
}
