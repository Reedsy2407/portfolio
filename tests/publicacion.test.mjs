// Publicación: genera dist/ con scripts/publish.mjs y comprueba su contenido exacto, sus enlaces, el CV, el teléfono,
// las cabeceras de seguridad y que la CSP aplicada de verdad no rompe nada (cero violaciones ni errores de consola).
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT, VIEWPORTS, parseHeaders, startServer } from './lib.mjs';

export const name = 'publicación: dist/ y cabeceras';

const DIST = join(ROOT, 'dist');
const TELEFONO = /(?:\+?\d[\s().-]?){7,}/;
const PROHIBIDOS = ['design', 'kit', 'tests', '.claude', 'CLAUDE.md', 'HANDOFF.md', 'package.json', 'package-lock.json', 'node_modules', 'scripts', 'tasks', '.git', 'README.md'];

const archivos = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? archivos(join(dir, e.name)) : [join(dir, e.name)]));
const rel = (p) => relative(DIST, p).replaceAll('\\', '/');

export async function run({ browser, base: _base, report }) {
  const pub = spawnSync(process.execPath, [join(ROOT, 'scripts', 'publish.mjs')], { encoding: 'utf8', timeout: 120000 });
  report.check('scripts/publish.mjs termina bien', pub.status === 0, (pub.stderr || '').slice(0, 200));
  if (pub.status !== 0) return;

  // ── Contenido exacto de dist/.
  const todos = archivos(DIST).map(rel).sort();
  const permitido = (f) => f === 'index.html' || f === '404.html' || f === '_headers' || f === 'en/index.html' || f.startsWith('assets/');
  const fuera = todos.filter((f) => !permitido(f));
  const topes = [...new Set(todos.map((f) => f.split('/')[0]))].sort();
  report.check('dist/ contiene solo la lista permitida (index.html, 404.html, en/, assets/ y _headers)', fuera.length === 0 && topes.join() === '404.html,_headers,assets,en,index.html', `${topes.join(', ')}${fuera.length ? ' · fuera: ' + fuera.join(', ') : ''}`);
  const colados = todos.filter((f) => PROHIBIDOS.some((x) => f === x || f.startsWith(x + '/')) || /\.(png|jpe?g|gif|webp)$/i.test(f) || /(^|\/)\.[^/]/.test(f));
  report.check('dist/ no contiene design/, kit/, tests/, .claude/, CLAUDE.md, HANDOFF.md, package*.json, node_modules, scripts/ ni capturas', colados.length === 0, colados.join(', '));
  const faltan = ['index.html', '404.html', '_headers', 'en/index.html', 'assets/css/site.css', 'assets/js/site.js', 'assets/favicon.svg'].filter((f) => !todos.includes(f));
  report.check('dist/ trae lo imprescindible', faltan.length === 0, faltan.join(', '));
  const total = archivos(DIST).reduce((n, p) => n + statSync(p).size, 0);
  report.info('dist/', `${todos.length} archivos, ${(total / 1024).toFixed(1)} KB`);

  // ── El 404 de dist/ usa rutas absolutas; el de desarrollo no cambia.
  const d404 = readFileSync(join(DIST, '404.html'), 'utf8');
  const dev404 = readFileSync(join(ROOT, '404.html'), 'utf8');
  const relativasEnDist = [...d404.matchAll(/\b(?:href|src)="(?!\/|#|https?:|mailto:|data:)([^"]*)"/g)].map((m) => m[1]);
  report.check('404.html de dist/ solo usa rutas absolutas (/assets/…, /index.html)', relativasEnDist.length === 0 && d404.includes('href="/assets/css/site.css"') && d404.includes('src="/assets/js/site.js"'), relativasEnDist.join(', '));
  report.check('el 404.html de desarrollo sigue con rutas relativas', dev404.includes('href="assets/css/site.css"') && !dev404.includes('href="/assets/css/site.css"'));

  // ── Cabeceras (_headers).
  const texto = readFileSync(join(DIST, '_headers'), 'utf8');
  const reglas = parseHeaders(texto);
  const todasLasCabeceras = Object.fromEntries(reglas.find((r) => r.ruta === '/*').cabeceras);
  const csp = todasLasCabeceras['Content-Security-Policy'] || '';
  const directiva = (n) => (csp.split(';').map((s) => s.trim()).find((s) => s.startsWith(n + ' ')) || '').split(/\s+/).slice(1);
  report.check('cabeceras: nosniff, Referrer-Policy, X-Frame-Options DENY', todasLasCabeceras['X-Content-Type-Options'] === 'nosniff' && todasLasCabeceras['Referrer-Policy'] === 'strict-origin-when-cross-origin' && todasLasCabeceras['X-Frame-Options'] === 'DENY');
  const pp = todasLasCabeceras['Permissions-Policy'] || '';
  report.check('Permissions-Policy sin cámara, micrófono ni geolocalización', /camera=\(\)/.test(pp) && /microphone=\(\)/.test(pp) && /geolocation=\(\)/.test(pp), pp);
  const hashesCsp = directiva('script-src').filter((x) => x.startsWith("'sha256-"));
  const hashesReales = new Set();
  for (const f of todos.filter((x) => x.endsWith('.html'))) {
    for (const [, c] of readFileSync(join(DIST, f), 'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)) hashesReales.add(`'sha256-${createHash('sha256').update(c).digest('base64')}'`);
  }
  report.check("CSP: default-src 'none'; scripts solo 'self' y el hash del script en línea (sin 'unsafe-inline')", directiva('default-src').join(' ') === "'none'" && directiva('script-src').includes("'self'") && !directiva('script-src').includes("'unsafe-inline'") && hashesCsp.length === hashesReales.size && hashesCsp.every((h) => hashesReales.has(h)), directiva('script-src').join(' '));
  report.check("CSP: estilos, fuentes e imágenes solo del mismo origen (img-src añade data: para las texturas SVG)", directiva('style-src').join() === "'self'" && directiva('font-src').join() === "'self'" && directiva('img-src').join(' ') === "'self' data:" && !/(^|\s)\*(\s|;|$)|https?:/.test(csp), csp);
  report.check("CSP: sin frames, objetos, base ni formularios (frame-ancestors, object-src, base-uri, form-action)", ['frame-ancestors', 'object-src', 'base-uri', 'form-action'].every((d) => directiva(d).join() === "'none'"));
  const cacheAssets = reglas.filter((r) => r.ruta.startsWith('/assets')).flatMap((r) => r.cabeceras).filter(([k]) => k === 'Cache-Control').map(([, v]) => v);
  const conHash = todos.filter((f) => f.startsWith('assets/')).every((f) => /[.-][0-9a-f]{8,}\.[a-z0-9]+$/.test(f));
  report.check('caché: sin hash en los nombres de assets no hay «immutable» (caché corta con revalidación)', cacheAssets.length > 0 && (conHash || cacheAssets.every((v) => !/immutable/.test(v) && /must-revalidate/.test(v) && /max-age=\d{1,5}\b/.test(v))), cacheAssets.join(' | '));

  // ── Servidor de dist/ con las cabeceras aplicadas de verdad.
  const srv = await startServer({ root: DIST, headers: texto });
  try {
    const rutasHtml = ['/index.html', '/en/index.html', '/una/ruta/inexistente'];

    // Enlaces internos de dist/ y recursos cargados.
    const ctx0 = await browser.newContext({ viewport: VIEWPORTS.d });
    for (const ruta of ['/index.html', '/en/index.html', '/404.html']) {
      const page = await ctx0.newPage();
      const malas = [];
      page.on('response', (r) => { if (r.url().startsWith(srv.base) && r.status() >= 400 && !r.url().endsWith(ruta)) malas.push(`${r.status()} ${r.url().slice(srv.base.length)}`); });
      await page.goto(srv.base + ruta, { waitUntil: 'networkidle' });
      const hrefs = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => !/^(https?|mailto|tel):/.test(h)))]);
      const rotos = [];
      for (const h of hrefs) {
        const url = new URL(h, page.url());
        if (url.pathname !== new URL(page.url()).pathname) {
          const r = await page.request.head(url.origin + url.pathname);
          if (r.status() !== 200) rotos.push(h);
        } else if (url.hash && !(await page.evaluate((id) => Boolean(document.getElementById(id)), url.hash.slice(1)))) rotos.push(h);
      }
      report.check(`dist${ruta}: enlaces internos válidos (${hrefs.length}) y todos sus recursos cargan`, rotos.length === 0 && malas.length === 0, [...rotos, ...malas].join(', '));
      await page.close();
    }
    await ctx0.close();

    // CV en dist/.
    const cvOrigen = join(ROOT, 'assets', 'cv', 'CV_Angel_Saenz.pdf');
    const cv = await fetch(srv.base + '/assets/cv/CV_Angel_Saenz.pdf');
    const cuerpo = Buffer.from(await cv.arrayBuffer());
    report.check('el PDF del CV responde 200 en dist/ y pesa lo mismo que el original', cv.status === 200 && /pdf/.test(cv.headers.get('content-type')) && existsSync(cvOrigen) && cuerpo.length === statSync(cvOrigen).size, `${cv.status} ${cuerpo.length} B`);

    // Cabeceras realmente servidas.
    const r = await fetch(srv.base + '/index.html');
    const ra = await fetch(srv.base + '/assets/css/site.css');
    report.check('el servidor entrega las cabeceras de seguridad en el HTML y la caché corta en assets', r.headers.get('x-content-type-options') === 'nosniff' && r.headers.get('x-frame-options') === 'DENY' && Boolean(r.headers.get('content-security-policy')) && /max-age=3600/.test(ra.headers.get('cache-control') || '') && !/immutable/.test(ra.headers.get('cache-control') || ''));

    // Teléfono y clientes ausentes en el HTML de dist/ (texto visible y enlaces).
    const html = todos.filter((f) => f.endsWith('.html')).map((f) => readFileSync(join(DIST, f), 'utf8')).join('\n');
    const ctx1 = await browser.newContext({ viewport: VIEWPORTS.d });
    const tel = [];
    for (const ruta of rutasHtml) {
      const page = await ctx1.newPage();
      await page.goto(srv.base + ruta);
      const visible = await page.evaluate(() => ['main', '.titlebar', '.status'].map((s) => document.querySelector(s).innerText).join('\n'));
      const m = visible.match(TELEFONO);
      if (m) tel.push(`${ruta}: ${m[0]}`);
      await page.close();
    }
    await ctx1.close();
    report.check('ningún HTML de dist/ muestra o enlaza un teléfono', tel.length === 0 && !/href="(tel:|sms:|https?:\/\/(wa\.me|api\.whatsapp|wa\.link))/i.test(html), tel.join('; '));
    report.check('ningún HTML de dist/ nombra a los clientes finales', !/cliente-1|cliente-3|cliente-4|\bcliente-2\b/i.test(html));

    // CSP aplicada: cero violaciones y cero errores de consola, incluido copiar el correo.
    const problemas = [];
    for (const esquema of ['dark', 'light']) {
      for (const ruta of rutasHtml) {
        const ctx = await browser.newContext({ viewport: VIEWPORTS.d, colorScheme: esquema, permissions: ['clipboard-read', 'clipboard-write'] });
        await ctx.addInitScript(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`)); });
        const page = await ctx.newPage();
        const consola = [];
        // El propio documento 404 se registra como «Failed to load resource … 404»: es la respuesta esperada, no un fallo (los recursos se vigilan aparte).
        page.on('console', (m) => { if (['error', 'warning'].includes(m.type()) && !(ruta.includes('inexistente') && /status of 404/.test(m.text()))) consola.push(`${m.type()}: ${m.text()}`); });
        page.on('pageerror', (e) => consola.push(`pageerror: ${e.message}`));
        page.on('requestfailed', (q) => consola.push(`requestfailed: ${q.url()}`));
        await page.goto(srv.base + ruta, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        const esHome = !ruta.includes('inexistente');
        // Uso real: tema, paleta de comandos, scroll por las secciones y copiar el correo.
        await page.click('.tool[data-theme-toggle]');
        await page.keyboard.press('Control+k');
        await page.keyboard.press('Escape');
        if (esHome) {
          for (const id of ['sobre-mi', 'habilidades', 'experiencia', 'proyectos']) await page.evaluate((x) => document.getElementById(x).scrollIntoView(), id);
          await page.click('#copiar-correo');
          await page.waitForFunction(() => document.getElementById('copiado').textContent.length > 0);
          const copiado = await page.evaluate(() => navigator.clipboard.readText());
          if (copiado !== 'saenzvelarde2006@gmail.com') problemas.push(`${ruta}: no copió el correo`);
        }
        const violaciones = await page.evaluate(() => window.__csp);
        if (violaciones.length || consola.length) problemas.push(`${ruta} (${esquema}): ${[...violaciones, ...consola].slice(0, 3).join(' | ')}`);
        await ctx.close();
      }
    }
    report.check('con la CSP aplicada, cero violaciones y cero errores de consola (tema, paleta, scroll, copiar correo; ES, EN y 404; ambos temas)', problemas.length === 0, problemas.join(' || '));

    // La CSP muerde de verdad: un script en línea inyectado se bloquea (la prueba no es vacía).
    {
      const ctx = await browser.newContext({ viewport: VIEWPORTS.d });
      await ctx.addInitScript(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(e.violatedDirective)); });
      const page = await ctx.newPage();
      await page.goto(srv.base + '/index.html');
      const r2 = await page.evaluate(async () => {
        window.__ejecutado = false;
        const s = document.createElement('script');
        s.textContent = 'window.__ejecutado = true';
        document.head.appendChild(s);
        await new Promise((ok) => { const t0 = () => (window.__csp.length ? ok() : requestAnimationFrame(t0)); t0(); });
        return { ejecutado: window.__ejecutado, v: window.__csp };
      });
      report.check('la CSP bloquea un script en línea inyectado (la prueba de CSP no es vacía)', !r2.ejecutado && r2.v.some((d) => d.startsWith('script-src')), JSON.stringify(r2));
      await ctx.close();
    }

    // 404 bajo una ruta profunda: se ve bien (hoja de estilos, fuente y marco cargados) y responde 404.
    mkdirSync(join(ROOT, 'design', 'refs', 'sitio'), { recursive: true });
    for (const esquema of ['dark', 'light']) {
      const ctx = await browser.newContext({ viewport: VIEWPORTS.d, colorScheme: esquema });
      const page = await ctx.newPage();
      const fallos = [];
      page.on('response', (q) => { if (q.url().startsWith(srv.base) && q.status() >= 400 && new URL(q.url()).pathname.startsWith('/assets')) fallos.push(`${q.status()} ${q.url()}`); });
      const resp = await page.goto(srv.base + '/una/ruta/inexistente', { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => document.getAnimations().every((a) => a.effect.getComputedTiming().iterations === Infinity || a.playState === 'finished'));
      const v = await page.evaluate(() => ({
        h1: document.querySelector('h1').textContent.trim(), fuente: document.fonts.check('700 40px "Pixelify Sans"'),
        marco: getComputedStyle(document.querySelector('.titlebar')).backgroundColor !== 'rgba(0, 0, 0, 0)', familia: getComputedStyle(document.querySelector('.name')).fontFamily.includes('Pixelify'),
        scrollX: document.documentElement.scrollWidth <= document.documentElement.clientWidth, enlaces: [...document.querySelectorAll('.cta a')].map((a) => a.getAttribute('href')),
      }));
      report.check(`404 en /una/ruta/inexistente (${esquema === 'dark' ? 'oscuro' : 'claro'}): estado 404, hojas y fuente cargadas, marco con estilo y enlaces de vuelta absolutos`, resp.status() === 404 && v.h1 === '404' && v.fuente && v.marco && v.familia && v.scrollX && fallos.length === 0 && v.enlaces.join() === '/index.html,/en/index.html', JSON.stringify({ s: resp.status(), ...v, fallos }));
      await page.screenshot({ path: join(ROOT, 'design', 'refs', 'sitio', `404-subruta-${esquema === 'dark' ? 'oscuro' : 'claro'}.png`) });
      await ctx.close();
    }
  } finally {
    await srv.close();
  }
}
