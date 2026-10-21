// Prepara la carpeta de publicación dist/ (ignorada por git): genera el sitio y copia SOLO una lista permitida.
// Uso: node scripts/publish.mjs   (solo Node; no despliega nada ni usa la red)
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

/** Lo único que entra en dist/ (más el archivo de cabeceras, que se genera). */
const PERMITIDOS = ['index.html', '404.html', 'en', 'assets'];

// 1. Primero el build del sitio.
const build = spawnSync(process.execPath, [join(ROOT, 'scripts', 'build.mjs')], { stdio: 'inherit' });
if (build.status !== 0) {
  console.error('El build falló; no se toca dist/.');
  process.exit(1);
}

// 2. Limpiar y recrear dist/ y copiar la lista permitida.
if (relative(ROOT, DIST) !== 'dist') throw new Error('Ruta de dist/ inesperada');
/* Se vacía el contenido en vez de borrar la carpeta: en Windows un proceso que la tenga abierta impide borrarla. */
mkdirSync(DIST, { recursive: true });
for (const e of readdirSync(DIST)) rmSync(join(DIST, e), { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
for (const nombre of PERMITIDOS) {
  const origen = join(ROOT, nombre);
  if (!existsSync(origen)) throw new Error(`Falta «${nombre}» en el repositorio`);
  cpSync(origen, join(DIST, nombre), { recursive: true });
}

// 3. El 404 de dist/ funciona bajo cualquier ruta: rutas absolutas desde la raíz (el 404 de desarrollo no cambia).
const f404 = join(DIST, '404.html');
writeFileSync(f404, readFileSync(f404, 'utf8').replace(/\b(href|src)="(?!\/|#|https?:|mailto:|data:)([^"]*)"/g, '$1="/$2"'));

// 4. Cabeceras: la CSP autoriza por hash el script en línea de cada página.
const paginas = [];
const recorrer = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) recorrer(p);
    else if (e.name.endsWith('.html')) paginas.push(p);
  }
};
recorrer(DIST);
const hashes = new Set();
for (const p of paginas) {
  for (const [, cuerpo] of readFileSync(p, 'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    hashes.add(`'sha256-${createHash('sha256').update(cuerpo).digest('base64')}'`);
  }
}
if (!hashes.size) throw new Error('No se encontró el script en línea del <head>');
const plantilla = readFileSync(join(ROOT, 'scripts', '_headers.template'), 'utf8');
/* Sin líneas de comentario en dist/_headers: así no se depende de cómo cada plataforma interprete «#». */
const cabeceras = plantilla.replaceAll('{{SCRIPT_HASHES}}', [...hashes].join(' ')).split('\n').filter((l) => !l.startsWith('#')).join('\n').replace(/^\n+/, '');
writeFileSync(join(DIST, '_headers'), cabeceras);

// 5. Resumen: contenido exacto y tamaño total.
let total = 0;
const lista = [];
const listar = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) listar(p);
    else { const s = statSync(p).size; total += s; lista.push(`${relative(DIST, p).replaceAll('\\', '/')} (${s} B)`); }
  }
};
listar(DIST);
console.log(`dist/: ${lista.length} archivos, ${(total / 1024).toFixed(1)} KB`);
for (const l of lista) console.log(`  ${l}`);
