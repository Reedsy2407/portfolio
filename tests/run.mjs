// Corre todas las pruebas del sitio: node tests/run.mjs [filtro]
// Cada archivo de tests/*.test.mjs exporta `name` y `run({ browser, base, report })`.
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createReport, launch, loadPlaywright, startServer } from './lib.mjs';

const dir = dirname(fileURLToPath(import.meta.url));
const filtro = process.argv[2];
const archivos = readdirSync(dir).filter((f) => f.endsWith('.test.mjs') && (!filtro || f.includes(filtro))).sort();

const server = await startServer();
const browser = await launch(loadPlaywright());
let fallos = 0;
let total = 0;
try {
  for (const f of archivos) {
    const mod = await import(pathToFileURL(join(dir, f)).href);
    const report = createReport();
    try {
      await mod.run({ browser, base: server.base, report });
    } catch (e) {
      report.check('la prueba termina sin excepción', false, String(e && e.stack ? e.stack : e));
    }
    console.log(`\n# ${mod.name}`);
    for (const r of report.results) {
      total += r.info ? 0 : 1;
      if (!r.ok) fallos++;
      console.log(`  ${r.info ? 'i' : r.ok ? '✓' : '✗'} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
    }
  }
} finally {
  await browser.close();
  await server.close();
}
console.log(`\n${total - fallos}/${total} comprobaciones correctas${fallos ? `; ${fallos} fallan` : ''}`);
process.exit(fallos ? 1 : 0);
