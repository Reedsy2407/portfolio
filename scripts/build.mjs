// Genera las páginas estáticas (ES y EN) a partir del contenido de este archivo.
// Uso: node scripts/build.mjs   (solo Node; no hay dependencias ni se ejecuta en producción)
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const URL_LINKEDIN = 'https://www.linkedin.com/in/saenzdev/';
const URL_GITHUB = 'https://github.com/Reedsy2407';
const URL_SISTEMA = 'https://esg-frontend-egcf.onrender.com';
const URL_DOCS = 'https://reedsy2407.github.io/esg-trazabilidad/';
const URL_CODIGO = 'https://github.com/Reedsy2407/esg-trazabilidad';
const NOMBRE = 'Angel Saenz';
const DISPONIBILIDAD = {
  es: 'Disponible para proyectos freelance a tiempo parcial. Respondo por correo en 24 a 48 horas. Zona horaria: Lima (UTC−5).',
  en: 'Available for part-time freelance projects. I reply by email within 24–48 hours. Time zone: Lima (UTC−5).',
};
const CORREO = 'saenzvelarde2006@gmail.com';

/* Rutas de cada página, relativas a la raíz del sitio. */
const PAGES = {
  es: { home: 'index.html', caso: 'caso/esg-trazabilidad.html' },
  en: { home: 'en/index.html', caso: 'en/case/esg-trazabilidad.html' },
};

const UI = {
  es: {
    lang: 'es', skip: 'Saltar al contenido', files: 'Archivos', themeA: 'Tema claro', themeB: 'Tema oscuro',
    langLabel: 'Idioma', explorer: 'Explorador', navFiles: 'Archivos del portafolio', tabs: 'Archivos abiertos',
    search: 'Buscar archivo (Ctrl K)', statusBar: 'Barra de estado', errors: 'errores: ', goTo: 'Ir a un archivo',
    filter: 'Filtrar archivos', type: 'escribe para filtrar',
    newTab: '(se abre en una pestaña nueva)', user: 'visitante@portafolio', todo: '[por confirmar]',
  },
  en: {
    lang: 'en', skip: 'Skip to content', files: 'Files', themeA: 'Light theme', themeB: 'Dark theme',
    langLabel: 'Language', explorer: 'Explorer', navFiles: 'Portfolio files', tabs: 'Open files',
    search: 'Find file (Ctrl K)', statusBar: 'Status bar', errors: 'errors: ', goTo: 'Go to file',
    filter: 'Filter files', type: 'type to filter',
    newTab: '(opens in a new tab)', user: 'visitor@portfolio', todo: '[to be confirmed]',
  },
};

const SYMBOLS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<symbol id="i-files" viewBox="0 0 24 24"><path d="M8 3h7l4 4v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM15 3v4h4M5 7v13a1 1 0 0 0 1 1h9"/></symbol>
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></symbol>
<symbol id="i-git" viewBox="0 0 24 24"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11v1a4 4 0 0 1-4 4H8"/></symbol>
<symbol id="i-sliders" viewBox="0 0 24 24"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></symbol>
<symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></symbol>
<symbol id="i-moon" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></symbol>
<symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>
<symbol id="i-file" viewBox="0 0 24 24"><path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v4h4"/></symbol>
<symbol id="i-folder" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></symbol>
<symbol id="i-chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></symbol>
<symbol id="i-error" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></symbol>
<symbol id="i-ext" viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></symbol>
</defs></svg>`;

const ic = (id, size, cls = '') =>
  `<svg class="ic${cls ? ' ' + cls : ''}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;

/* ── Piezas decorativas, deterministas ─────────────── */
const PARTICLES = [
  ['{', 90, 59, 20, 20, -9, 9, 0.77, 'str'], ['}', 78, 70, 23, 20, -2, 5, 0.6, 'const'],
  ['&lt;', 81, 20, 23, 35, -14, 7, 0.77, 'num'], ['&gt;', 73, 79, 24, 35, -35, 6, 0.77, 'num'],
  ['/', 85, 58, 25, 35, -14, 6, 0.74, 'const'], [';', 75, 65, 28, 35, -33, 7, 0.75, 'str'],
  ['=', 92, 52, 26, 20, -9, 8, 0.63, 'num'], ['}', 85, 53, 23, 35, -26, 5, 0.7, 'fn'],
  [null, 87, 84, 4, 25, -2, 8, 0.84, 'const'], [null, 83, 12, 4, 30, -1, 9, 0.64, 'num'],
  [null, 89, 76, 4, 35, -5, 5, 0.74, 'key'], [null, 80, 51, 4, 35, -13, 7, 0.78, 'fn'],
];
const fxHtml = () =>
  `<div class="fx" aria-hidden="true">${PARTICLES.map(([ch, x, y, s, t, d, p, o, c]) =>
    `<i${ch === null ? ' class="dot"' : ''} style="--x:${x}%;--y:${y}%;--s:${s}px;--t:${t}s;--st:${t * 5};--sf:${t};--d:${d}s;--p:${p}s;--sp:${p * 5};--o:${o};--c:var(--c-${c})"><b>${ch ?? ''}</b></i>`).join('')}</div>`;

const gutterHtml = (rows) => `<div class="gutter" aria-hidden="true">${'<i></i>'.repeat(rows)}</div>`;

const minimapHtml = () => {
  const cols = ['num', 'str', 'key', 'kw', 'fn', 'type', 'const'];
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const lines = Array.from({ length: 80 }, () => {
    const w = rnd() < 0.15 ? 0 : 25 + Math.round(rnd() * 55);
    const x = [0, 10, 20][Math.floor(rnd() * 3)];
    const c = rnd() < 0.3 ? 'ink-soft' : `c-${cols[Math.floor(rnd() * cols.length)]}`;
    return `<i style="--w:${w}%;--x:${x}%;--c:var(--${c})"></i>`;
  });
  return `<div class="minimap" aria-hidden="true"><div class="mm">${lines.join('')}<div class="mm-view"></div></div></div>`;
};

const faviconSvg = () => {
  const A = ['.#.', '#.#', '###', '#.#', '#.#'];
  const S = ['###', '#..', '###', '..#', '###'];
  const glyph = (rows, ox, fill) => rows.flatMap((r, y) => [...r].map((c, x) => (c === '#'
    ? `<rect x="${ox + x * 4}" y="${6 + y * 4}" width="4" height="4" fill="${fill}"/>` : ''))).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#12151b"/>${glyph(A, 3, '#61afef')}${glyph(S, 17, '#d7dae0')}</svg>\n`;
};

/* ── Marco: barra de título, explorador, pestañas, estado, paleta ── */
const t = (lang, es, en) => (lang === 'en' ? en : es);

function frame({ lang, file, root, title, desc, tabs, tree, sections, gutterRows, langLinks, modo }) {
  const u = UI[lang];
  const rel = (to) => posix.relative(posix.dirname(file) || '.', to) || posix.basename(to);
  const tabsHtml = tabs.map((x) => `<li><a href="${x.href}"><i class="dot t-${x.type}"></i>${x.name}</a></li>`).join('');
  const treeHtml = tree.map((g) => `<details open><summary>${ic('i-chev', 16, 'chev')}${ic('i-folder', 18, 't-dir')}${g.dir}</summary><ul>${g.items.map((x) =>
    `<li><a href="${x.href}">${ic('i-file', 18, 't-' + x.type)}${x.name}</a></li>`).join('')}</ul></details>`).join('');
  const dialogItems = tree.flatMap((g) => g.items).map((x) => `<li><a href="${x.href}">${x.name}</a></li>`).join('');
  const langHtml = langLinks
    ? `<ul class="lang" aria-label="${u.langLabel}">${['es', 'en'].map((l) =>
      `<li><a href="${langLinks[l]}" lang="${l}" hreflang="${l}"${l === lang ? ' aria-current="true"' : ''}>${l.toUpperCase()}</a></li>`).join('')}</ul>`
    : '';
  const homeHref = rel(PAGES[lang].home);
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<script>var d=document.documentElement;try{var th=localStorage.getItem('tema');if(th==='claro'||th==='oscuro')d.dataset.theme=th;}catch(e){}d.classList.add('js');window.__e=0;addEventListener('error',function(){window.__e++},true)</script>
<link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="${root}assets/fonts/instrument-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${root}assets/fonts/pixelify-sans-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${root}assets/css/site.css">
<script src="${root}assets/js/site.js" defer></script>
</head>
<body>
${SYMBOLS}
<a class="skip" href="#main">${u.skip}</a>
<header class="titlebar">
  <div class="left">
    <span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>
    <button class="tool exp-toggle" id="exp-toggle" type="button" aria-expanded="false" aria-controls="explorador" hidden>${ic('i-menu', 20)}<span class="lbl">${u.files}</span></button>
  </div>
  <a class="mark" href="${homeHref}" aria-label="AS, ${t(lang, 'inicio', 'home')}"><b>A</b>S</a>
  <div class="right">
    <button class="tool" data-theme-toggle type="button" hidden><span class="i-sun">${ic('i-sun', 20)}</span><span class="i-moon">${ic('i-moon', 20)}</span><span class="lbl lbl-a">${u.themeA}</span><span class="lbl lbl-b">${u.themeB}</span></button>
    ${langHtml}
  </div>
</header>

<div class="shell">
  <div class="activity">
    <div class="grp">
      <button class="act" id="act-exp" type="button" aria-pressed="true" aria-controls="explorador" hidden>${ic('i-files', 22)}<span class="sr">${u.explorer}</span></button>
      <button class="act" id="act-search" type="button" hidden>${ic('i-search', 22)}<span class="sr">${u.search}</span></button>
      <span class="act off" aria-hidden="true">${ic('i-git', 22)}</span>
    </div>
    <div class="grp">
      <button class="act" data-theme-toggle type="button" hidden>${ic('i-sliders', 22)}<span class="sr lbl-a">${u.themeA}</span><span class="sr lbl-b">${u.themeB}</span></button>
    </div>
  </div>

  <nav class="explorer" id="explorador" aria-label="${u.navFiles}">
    <p class="exp-title">${u.explorer}</p>
    ${treeHtml}
  </nav>

  <div class="editor">
    <nav class="tabs" aria-label="${u.tabs}"><ul>${tabsHtml}</ul></nav>
    <div class="doc">
      <div class="curline" aria-hidden="true"></div>
      ${fxHtml()}
      ${gutterHtml(gutterRows)}
      <main id="main">
${sections.join('\n')}
      </main>
      ${minimapHtml()}
    </div>
  </div>
</div>

<footer class="status" aria-label="${u.statusBar}">
  <span>${ic('i-git', 16)}main</span>
  <span id="m-err" hidden>${ic('i-error', 16)}<span class="sr">${u.errors}</span><span id="m-errn">0</span></span>
  <span class="push opt" id="m-lang">${modo || 'Markdown'}</span>
  <span class="opt" id="m-enc">UTF-8</span>
  <span id="m-pos">Ln 1, Col 1</span>
  <span class="opt" id="m-carga"></span>
  <span class="opt" id="m-lcp"></span>
</footer>

<dialog id="cmd" aria-labelledby="cmd-t">
  <h2 id="cmd-t">${u.goTo}</h2>
  <input type="search" aria-label="${u.filter}" placeholder="${u.type}">
  <ul>${dialogItems}</ul>
</dialog>
</body>
</html>
`;
}

/* ── Piezas de contenido ───────────────────────────── */
const fileHead = (lang, id, name, type, label) =>
  `  <p class="file-name" data-file="${name}">${ic('i-file', 18, 't-' + type)}<b>${name}</b> · ${label}</p>`;
const section = (id, name, type, mode, label, labelledby, body, cls = '') =>
  `<section class="file${cls ? ' ' + cls : ''}" id="${id}" data-lang="${mode}" aria-labelledby="${labelledby}">\n${fileHead('', id, name, type, label)}\n${body}\n</section>`;
const win = (name, inner, wide = true, extraBar = '') =>
  `<figure class="win${wide ? ' wide' : ''}"><figcaption class="win-bar"><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span><span>${name}</span>${extraBar}</figcaption><div class="win-body">${inner}</div></figure>`;
const ext = (href, label, text, lang, cls = '') =>
  `<a${cls ? ` class="${cls}"` : ''} href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label} ${UI[lang].newTab}">${text}</a>`;
const chip = (href, name, label, lang) =>
  ext(href, `${label} ${t(lang, 'de', 'of')} ${NOMBRE}`, `${name}${ic('i-ext', 16)}`, lang, 'tag');
const todo = (lang) => `<span class="todo">${UI[lang].todo}</span>`;
const row = (g, v) => `<li><span class="g"><span class="cm" aria-hidden="true">// </span>${g}</span><span class="v">${v}</span></li>`;

/* Entradas del proyecto: demo instantánea y sistema real, con el aviso antes del botón. */
function entradas(lang, demoHref) {
  const sistemaLabel = t(lang, 'Abrir el sistema real', 'Open the real system');
  const aviso = t(lang,
    '<b>Aviso:</b> puede tardar hasta 1 minuto en despertar (hosting gratuito). El propio sistema ofrece una cuenta demo de un clic para entrar sin registrarte. Mientras tanto, la demo instantánea abre al momento.',
    '<b>Notice:</b> it may take up to 1 minute to wake up (free hosting). The system itself offers a one-click demo account so you can sign in without registering. Meanwhile, the instant demo opens right away.');
  return win('entradas.sh', `<div class="entry"><div><h3>demo-instantanea</h3><p>${t(lang, 'Vista simulada dentro de este sitio, con datos simulados y sin llamadas de red.', 'A simulated view inside this site, with simulated data and no network calls.')}</p></div><a class="btn primary" href="${demoHref}">${t(lang, 'Abrir la demo', 'Open the demo')}</a></div>
    <div class="entry stack"><div><h3>sistema-real</h3><p>${t(lang, 'El sistema desplegado, en una pestaña nueva.', 'The deployed system, in a new tab.')}</p></div><p class="notice" id="aviso-sistema">${aviso}</p>${ext(URL_SISTEMA, sistemaLabel, sistemaLabel + ic('i-ext', 16), lang, 'btn').replace('<a ', '<a aria-describedby="aviso-sistema" ')}</div>`, false);
}

const PROJECT_TEXT = {
  es: 'Plataforma de trazabilidad ESG para recicladores formalizados de Lima Metropolitana. Conecta a vecinos y empresas con asociaciones de recicladores y emite un certificado digital en PDF.',
  en: 'An ESG traceability platform for formalized recyclers in Metropolitan Lima. It connects neighbors and companies with recycler associations and issues a digital PDF certificate.',
};

const CONTACTO_LEAD = { es: '¿Tienes un servicio por construir o un equipo que reforzar?', en: 'Have a service to build or a team to reinforce?' };

/* CV: se enlaza solo si el archivo existe al generar el sitio; si no, queda el marcador y ningún enlace. */
const CV_RUTA = 'assets/cv/CV_Angel_Saenz.pdf';
const CV_BYTES = existsSync(join(ROOT, CV_RUTA)) ? statSync(join(ROOT, CV_RUTA)).size : null;
const cvTamano = () => (CV_BYTES < 1024 * 1024 ? `${Math.max(1, Math.round(CV_BYTES / 1024))} KB` : `${(CV_BYTES / 1024 / 1024).toFixed(1)} MB`);
const cvLink = (lang, root, cls) => {
  /* El nombre accesible empieza por el texto visible (WCAG 2.5.3). */
  const aria = t(lang, `Ver CV (PDF, ${CV_BYTES === null ? '' : cvTamano()}) de ${NOMBRE} ${UI[lang].newTab}`,
    `View CV (PDF, ${CV_BYTES === null ? '' : cvTamano()}) by ${NOMBRE} ${UI[lang].newTab}`);
  return `<a class="${cls}" href="${root}${CV_RUTA}" target="_blank" rel="noopener noreferrer" aria-label="${aria}">${t(lang, 'Ver CV', 'View CV')} <span class="sz">(PDF, ${cvTamano()})</span>${ic('i-ext', 16)}</a>`;
};
const cvTodo = (lang) => `<span class="todo">${t(lang, '[CV por confirmar]', '[CV to be confirmed]')}</span>`;
const mailChip = () => `<a class="tag" href="mailto:${CORREO}">${CORREO}</a>`;

function contacto(lang, root) {
  const nombreLi = (href, text, label) => `<p class="mono"><span class="cmd">open</span> ${ext(href, label, text, lang)}</p>`;
  return section('contacto', 'contacto.sh', 'sh', 'Shell', 'shell', 'f-con', `  <h2 class="title-px" id="f-con">${t(lang, '¿Hablamos?', 'Shall we talk?')}</h2>
  <p class="mono"><span class="cm">#!/bin/sh</span></p>
  <p class="lead">${CONTACTO_LEAD[lang]}</p>
  <p>${DISPONIBILIDAD[lang]}</p>
  <p class="mono"><span class="cmd">echo</span> <span class="st">"${t(lang, 'correo', 'email')}: </span><a href="mailto:${CORREO}">${CORREO}</a><span class="st">"</span></p>
  <p class="mono"><span class="cmd">echo</span> <span class="st">"cv: </span>${CV_BYTES === null ? cvTodo(lang) : `<a href="${root}${CV_RUTA}" target="_blank" rel="noopener noreferrer" aria-label="CV_Angel_Saenz.pdf (PDF, ${cvTamano()}) ${UI[lang].newTab}">CV_Angel_Saenz.pdf (PDF, ${cvTamano()})</a>`}<span class="st">"</span></p>
  ${nombreLi(URL_LINKEDIN, 'linkedin.com/in/saenzdev', `LinkedIn ${t(lang, 'de', 'of')} ${NOMBRE}`)}
  ${nombreLi(URL_GITHUB, 'github.com/Reedsy2407', `GitHub ${t(lang, 'de', 'of')} ${NOMBRE}`)}
  <div class="cta"><a class="btn primary" href="mailto:${CORREO}">${t(lang, 'Escribir por correo', 'Write by email')}</a>${ext(URL_LINKEDIN, t(lang, 'Escribir por LinkedIn', 'Write on LinkedIn'), t(lang, 'Escribir por LinkedIn', 'Write on LinkedIn'), lang, 'btn')}${CV_BYTES === null ? '' : cvLink(lang, root, 'btn')}</div>`, 'sh');
}

/* ── Portada ───────────────────────────────────────── */
const EXPERIENCIA = [
  {
    empresa: 'HRF GROUP S.A.C.',
    cargo: ['Desarrollador backend Java', 'Java backend developer'],
    periodo: ['abril 2026 – actualidad (remoto)', 'April 2026 – present (remote)'],
    contexto: ['plataforma de e-commerce B2B', 'B2B e-commerce platform'],
    hechos: [
      ['Microservicios en Java 21 y Spring Boot 3.x con arquitectura hexagonal.', 'Microservices on Java 21 and Spring Boot 3.x with hexagonal architecture.'],
      ['Corrección de errores de cálculo de precios y promociones, rastreando la causa raíz entre capas.', 'Fixed pricing and promotion calculation bugs by tracing the root cause across layers.'],
      ['Endpoints batch para consulta masiva de stock entre microservicios.', 'Batch endpoints for bulk stock queries between microservices.'],
      ['PostgreSQL multi-schema y Liquibase.', 'Multi-schema PostgreSQL and Liquibase.'],
      ['Despliegues a QA en Kubernetes con ArgoCD y hotfixes controlados.', 'QA deployments on Kubernetes with ArgoCD and controlled hotfixes.'],
      ['Monitoreo con Dynatrace, Azure DevOps y revisiones de código.', 'Monitoring with Dynatrace, Azure DevOps and code reviews.'],
    ],
  },
  {
    empresa: 'HRF GROUP S.A.C.',
    cargo: ['Desarrollador backend Java en AWS', 'Java backend developer on AWS'],
    periodo: ['dic 2025 – mar 2026', 'Dec 2025 – Mar 2026'],
    contexto: ['sector educación', 'education sector'],
    hechos: [
      ['Lambdas en Java 21 con arquitectura hexagonal.', 'Lambdas in Java 21 with hexagonal architecture.'],
      ['S3 con enlaces de descarga seguros.', 'S3 with secure download links.'],
      ['Step Functions con registro de ejecuciones en DynamoDB.', 'Step Functions with execution logging in DynamoDB.'],
      ['Cambios en MySQL.', 'MySQL changes.'],
    ],
  },
  {
    empresa: 'HRF GROUP S.A.C.',
    cargo: ['Desarrollador backend', 'Backend developer'],
    periodo: ['sep – dic 2025', 'Sep – Dec 2025'],
    contexto: ['CRM empresarial', 'enterprise CRM'],
    hechos: [
      ['.NET Core y Python.', '.NET Core and Python.'],
      ['APIs REST y GraphQL.', 'REST and GraphQL APIs.'],
      ['Procesamiento masivo de CSV.', 'Bulk CSV processing.'],
      ['Repository y Unit of Work con Entity Framework.', 'Repository and Unit of Work with Entity Framework.'],
    ],
  },
  {
    empresa: 'Hera Consulting SAC',
    cargo: ['Analista programador Java junior', 'Junior Java programmer analyst'],
    periodo: ['julio 2025 – actualidad (jornada parcial)', 'July 2025 – present (part-time)'],
    hechos: [
      ['Aplicaciones empresariales en Java y Python (Spring MVC, JSP, Servlets).', 'Enterprise applications in Java and Python (Spring MVC, JSP, Servlets).'],
      ['Módulos de Odoo con integraciones de WhatsApp e IA.', 'Odoo modules with WhatsApp and AI integrations.'],
      ['Oracle y PostgreSQL.', 'Oracle and PostgreSQL.'],
      ['Angular y TypeScript.', 'Angular and TypeScript.'],
    ],
  },
  {
    empresa: 'COMPIPRO',
    cargo: ['Prácticas', 'Internship'],
    periodo: ['feb – may 2025', 'Feb – May 2025'],
    hechos: [
      ['Módulos de logística, asistencias y CRM.', 'Logistics, attendance and CRM modules.'],
      ['Chat en tiempo real con WebSockets (Workerman).', 'Real-time chat with WebSockets (Workerman).'],
      ['PHP, JavaScript y MVC.', 'PHP, JavaScript and MVC.'],
    ],
  },
];

function homeSections(lang, hrefs, root) {
  const u = UI[lang];
  const perfil = section('perfil', t(lang, 'perfil.md', 'profile.md'), 'md', 'Markdown', 'markdown', 'f-perfil', `  <p class="prompt"><span class="ps">${u.user}</span><span class="punc">:~$</span> <span class="typed">whoami</span><i class="caret" aria-hidden="true"></i></p>
  <p class="mono rise" style="--i:1"><span class="cm">${t(lang, '// hola, soy', "// hi, I'm")}</span></p>
  <h1 class="name" id="f-perfil"><span class="nm" data-text="${NOMBRE}">${NOMBRE}</span></h1>
  <p class="role rise" style="--i:2">// Backend Developer</p>
  <p class="lead">${t(lang,
    'Desarrollador backend en Lima. Construyo microservicios con Java y Spring Boot, trabajo con servicios de AWS y despliego en Kubernetes y Azure DevOps.',
    'Backend developer based in Lima. I build microservices with Java and Spring Boot, work with AWS services and deploy on Kubernetes and Azure DevOps.')}</p>
  <div class="cta rise" style="--i:3">
    <a class="btn primary" href="#contacto">${t(lang, 'Contactar', 'Get in touch')}</a>
    <a class="btn" href="${hrefs.caso}">${t(lang, 'Ver proyecto', 'View project')}</a>
    ${CV_BYTES === null ? '' : cvLink(lang, root, 'btn')}
  </div>
  <div class="links rise" style="--i:4">
    ${chip(URL_LINKEDIN, 'LinkedIn', 'LinkedIn', lang)}
    ${chip(URL_GITHUB, 'GitHub', 'GitHub', lang)}
    ${mailChip()}
  </div>
  ${CV_BYTES === null ? `<p class="note">CV: ${cvTodo(lang)}</p>` : ''}
  <div class="fm rise" style="--i:5">
    <p aria-hidden="true">---</p>
    <dl>
      <dt>${t(lang, 'nombre', 'name')}:</dt><dd>${NOMBRE}</dd>
      <dt>${t(lang, 'rol', 'role')}:</dt><dd>backend developer</dd>
      <dt>${t(lang, 'ciudad', 'city')}:</dt><dd>Lima, ${t(lang, 'Perú', 'Peru')}</dd>
      <dt>${t(lang, 'disponible', 'available')}:</dt><dd>${DISPONIBILIDAD[lang]}</dd>
    </dl>
    <p aria-hidden="true">---</p>
  </div>`);

  const sobre = section('sobre-mi', t(lang, 'sobre-mi.md', 'about.md'), 'md', 'Markdown', 'markdown', 'f-sob', `  <h2 class="title-px" id="f-sob">${t(lang, 'Sobre mí', 'About me')}</h2>
  <p class="lead">${t(lang,
    'Soy desarrollador backend en Lima. Trabajo con Java y Spring Boot, microservicios y arquitectura hexagonal, con servicios de AWS y despliegues en Kubernetes y Azure DevOps.',
    'I am a backend developer in Lima. I work with Java and Spring Boot, microservices and hexagonal architecture, with AWS services and deployments on Kubernetes and Azure DevOps.')}</p>
  <p>${t(lang,
    'He pasado por proyectos de e-commerce B2B, educación, logística y CRM: APIs, automatización de procesos y trabajo en equipos ágiles. Me interesan el código limpio y las buenas prácticas.',
    'I have worked on B2B e-commerce, education, logistics and CRM projects: APIs, process automation and agile teamwork. I care about clean code and good practices.')}</p>
  ${win(t(lang, 'formacion.ts', 'education.ts'), `<ul class="tags">
      ${row(t(lang, 'estudios', 'studies'), t(lang, 'Ingeniería de Sistemas · Cibertec · julio 2026 – actualidad', 'Systems Engineering · Cibertec · July 2026 – present'))}
      ${row(t(lang, 'técnica', 'technical'), t(lang, 'Técnica en Computación e Informática · Cibertec · 2023 – 2025', 'Technical degree in Computing and Informatics · Cibertec · 2023 – 2025'))}
      ${row(t(lang, 'idiomas', 'languages'), t(lang, 'español nativo · inglés intermedio-avanzado (EF SET 64/100, C1 Advanced)', 'native Spanish · upper-intermediate to advanced English (EF SET 64/100, C1 Advanced)'))}
      ${row(t(lang, 'certificado', 'certified'), 'Scrum Fundamentals Certified (SFC)')}
    </ul>`)}`);

  const hab = section('habilidades', t(lang, 'habilidades.ts', 'skills.ts'), 'ts', 'TypeScript', 'typescript', 'f-hab', `  <h2 class="title-px" id="f-hab">${t(lang, 'Habilidades', 'Skills')}</h2>
  <p class="mono"><span class="cm">${t(lang, '// el color indica el rol: clave y valor', '// color shows the role: key and value')}</span></p>
  ${win('stack.ts', `<ul class="tags">
      ${row('backend java', t(lang, 'Java 21 · Spring Boot / MVC / Security · JPA/Hibernate · Maven · hexagonal · microservicios', 'Java 21 · Spring Boot / MVC / Security · JPA/Hibernate · Maven · hexagonal · microservices'))}
      ${row('aws', 'Lambda · S3 · Step Functions · API Gateway · DynamoDB · CloudWatch · Cognito')}
      ${row(t(lang, 'otros backend', 'other backend'), '.NET Core · Python · Node.js · REST · GraphQL · Odoo')}
      ${row('frontend', 'Angular 15+ · TypeScript · JavaScript · HTML5 · CSS3')}
      ${row(t(lang, 'bases de datos', 'databases'), 'PostgreSQL multi-schema · MySQL · Oracle PL/SQL · SQL Server · MongoDB')}
      ${row('devops', 'Kubernetes · ArgoCD · Azure DevOps · Liquibase · Dynatrace · GCP Pub/Sub')}
      ${row(t(lang, 'herramientas', 'tools'), 'Git · Swagger/OpenAPI · Postman · Scrum')}
    </ul>`)}`);

  const pair = (k, v) => `<dt>${k}</dt><dd>${v}</dd>`;
  const entrada = (e, last) => `<li><span class="punc" aria-hidden="true">{</span><dl>${pair(t(lang, 'empresa', 'company'), e.empresa)}${pair(t(lang, 'cargo', 'role'), t(lang, ...e.cargo))}${pair(t(lang, 'periodo', 'period'), t(lang, ...e.periodo))}${e.contexto ? pair(t(lang, 'contexto', 'context'), t(lang, ...e.contexto)) : ''}${pair(t(lang, 'hechos', 'work'), `<ul class="facts">${e.hechos.map((h) => `<li>${t(lang, ...h)}</li>`).join('')}</ul>`)}</dl><span class="punc" aria-hidden="true">}${last ? '' : ','}</span></li>`;
  const exp = section('experiencia', t(lang, 'experiencia.json', 'experience.json'), 'json', 'JSON', 'json', 'f-exp', `  <h2 class="title-px" id="f-exp">${t(lang, 'Experiencia', 'Experience')}</h2>
  <p class="mono"><span class="cm">${t(lang, '// de la más reciente a la más antigua; los clientes finales no se nombran', '// most recent first; end clients are not named')}</span></p>
  <div class="json wide">
    <p class="mono"><span class="punc" aria-hidden="true">[</span></p>
    <ol>
      ${EXPERIENCIA.map((e, i) => entrada(e, i === EXPERIENCIA.length - 1)).join('\n      ')}
    </ol>
    <p class="mono"><span class="punc" aria-hidden="true">]</span></p>
  </div>`);

  const proyecto = section('proyecto', 'esg-trazabilidad.md', 'md', 'Markdown', t(lang, 'proyecto destacado', 'featured project'), 'f-pro', `  <h2 class="title-px" id="f-pro">${t(lang, 'Proyecto destacado', 'Featured project')}</h2>
  <p class="mono"><span class="cm"># esg-trazabilidad</span></p>
  <p class="lead">${PROJECT_TEXT[lang]}</p>
  ${entradas(lang, hrefs.demo)}
  <p><a href="${hrefs.caso}">${t(lang, 'Leer el caso de estudio', 'Read the case study')}</a></p>
  <p class="mono"><span class="cm">${t(lang, '// otros proyectos propios', '// other personal projects')}</span></p>
  ${win(t(lang, 'otros-proyectos.ts', 'other-projects.ts'), `<ul class="tags">
      ${row('Portal Laboral', 'Spring Boot · Spring Security con JWT · Angular · MySQL')}
      ${row('Helpcore', t(lang, 'microservicios con API Gateway, autenticación, config server y notificaciones con Redis', 'microservices with API Gateway, authentication, config server and Redis notifications'))}
    </ul>`)}`);

  return [perfil, sobre, hab, exp, proyecto, contacto(lang, root)];
}

/* ── Caso de estudio ───────────────────────────────── */
const DEMO_ROWS = [
  ['Vecino', 1, 'A', 'Plástico', 18, 'certificado'], ['Empresa', 1, 'B', 'Cartón', 240, 'certificado'],
  ['Vecino', 2, 'A', 'Vidrio', 22, 'recogido'], ['Empresa', 2, 'C', 'Papel', 180, 'recogido'],
  ['Vecino', 3, 'B', 'Metal', 9, 'programado'], ['Empresa', 3, 'A', 'Plástico', 310, 'programado'],
  ['Vecino', 4, 'C', 'Cartón', 14, 'solicitado'], ['Empresa', 4, 'B', 'Vidrio', 120, 'solicitado'],
  ['Vecino', 5, 'A', 'Papel', 11, 'certificado'], ['Empresa', 5, 'C', 'Metal', 960, 'recogido'],
  ['Vecino', 6, 'B', 'Plástico', 16, 'programado'], ['Empresa', 6, 'A', 'Cartón', 1120, 'certificado'],
];
const MAT_EN = { Plástico: 'Plastic', Cartón: 'Cardboard', Vidrio: 'Glass', Papel: 'Paper', Metal: 'Metal' };
const ESTADOS = {
  todos: ['Todos', 'All'], solicitado: ['Solicitado', 'Requested'], programado: ['Programado', 'Scheduled'],
  recogido: ['Recogido', 'Collected'], certificado: ['Certificado', 'Certified'],
};
const thin = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function demoHtml(lang) {
  const tr = DEMO_ROWS.map(([who, n, assoc, mat, kg, est], i) => {
    const num = String(n).padStart(2, '0');
    const solic = `${t(lang, who, who === 'Vecino' ? 'Neighbor' : 'Company')} ${num}`;
    return `<tr data-estado="${est}" data-kg="${kg}"><td>R-${String(i + 1).padStart(3, '0')}</td><td>${solic}</td><td>${t(lang, 'Asociación', 'Association')} ${assoc}</td><td>${t(lang, mat, MAT_EN[mat])}</td><td>${thin(kg)}</td><td>${t(lang, ESTADOS[est][0], ESTADOS[est][1])}</td></tr>`;
  }).join('\n        ');
  const total = DEMO_ROWS.reduce((s, r) => s + r[4], 0);
  const tpl = t(lang, 'Resumen simulado: {n} recojos · {kg} kg', 'Simulated summary: {n} pickups · {kg} kg');
  const chips = Object.entries(ESTADOS).map(([k, v], i) =>
    `<li><button class="chip" type="button" data-filtro="${k}" aria-pressed="${i === 0}">${t(lang, v[0], v[1])}</button></li>`).join('');
  const sim = `<span class="sim">${t(lang, 'datos simulados', 'simulated data')}</span>`;
  return win('demo.csv', `<ul class="chips" id="demo-filtros" aria-label="${t(lang, 'Filtrar por estado', 'Filter by status')}" hidden>${chips}</ul>
      <div class="table-wrap" id="demo-tabla" role="region" aria-labelledby="f-demo" tabindex="0"><table>
      <thead><tr><th>${t(lang, 'Recojo', 'Pickup')}</th><th>${t(lang, 'Solicitante', 'Requester')}</th><th>${t(lang, 'Asociación', 'Association')}</th><th>Material</th><th>kg</th><th>${t(lang, 'Estado', 'Status')}</th></tr></thead>
      <tbody>
        ${tr}
      </tbody></table></div>
      <p class="cert" id="demo-resumen" data-tpl="${tpl}">${tpl.replace('{n}', DEMO_ROWS.length).replace('{kg}', thin(total))}</p>`, true, sim);
}

function casoSections(lang, hrefs, root) {
  const u = UI[lang];
  const resumen = section('resumen', t(lang, 'resumen.md', 'summary.md'), 'md', 'Markdown', t(lang, 'caso de estudio', 'case study'), 'f-res0', `  <p class="prompt"><span class="ps">${u.user}</span><span class="punc">:~$</span> <span class="typed" style="--ch:8">${t(lang, 'cat caso', 'cat case')}</span><i class="caret" aria-hidden="true"></i></p>
  <p class="mono rise" style="--i:1"><span class="cm">${t(lang, '// proyecto destacado', '// featured project')}</span></p>
  <h1 class="name" id="f-res0"><span class="nm" data-text="esg-trazabilidad">esg-trazabilidad</span></h1>
  <p class="lead">${PROJECT_TEXT[lang]}</p>
  <p class="note">${t(lang, 'Proyecto académico, sin validez legal.', 'Academic project, with no legal validity.')}</p>
  <div class="cta rise" style="--i:3">
    <a class="btn primary" href="#demo">${t(lang, 'Ver demo instantánea', 'View instant demo')}</a>
    <a class="btn" href="#entradas">${t(lang, 'Abrir sistema real', 'Open real system')}</a>
  </div>
  <div class="fm rise" style="--i:4">
    <p aria-hidden="true">---</p>
    <dl>
      <dt>stack:</dt><dd>Java 21, Spring Boot 3.3.5, Angular</dd>
      <dt>${t(lang, 'contexto', 'context')}:</dt><dd>${t(lang, 'Proyecto académico (EFSRT, CIBERTEC) · septiembre – octubre 2026', 'Academic project (EFSRT, CIBERTEC) · September – October 2026')}</dd>
    </dl>
    <p aria-hidden="true">---</p>
  </div>`);

  const ent = section('entradas', 'entradas.sh', 'sh', 'Shell', t(lang, 'dos formas de verlo', 'two ways to see it'), 'f-ent', `  <h2 class="title-px" id="f-ent">${t(lang, 'Dos entradas', 'Two entry points')}</h2>
  <p class="mono"><span class="cm">${t(lang, '// la demo es instantánea; el sistema real puede tardar', '// the demo is instant; the real system may take a while')}</span></p>
  ${entradas(lang, '#demo')}`, 'sh');

  const demo = section('demo', 'demo.csv', 'csv', 'CSV', t(lang, 'datos simulados', 'simulated data'), 'f-demo', `  <h2 class="title-px" id="f-demo">${t(lang, 'Demo instantánea', 'Instant demo')}</h2>
  <p class="mono"><span class="cm">${t(lang, '// datos simulados · sin llamadas de red', '// simulated data · no network calls')}</span></p>
  <p>${t(lang,
    'Esta vista vive en el propio sitio: los recojos son <b>datos simulados</b>, no vienen del sistema real.',
    'This view lives in the site itself: the pickups are <b>simulated data</b> and do not come from the real system.')}</p>
  ${demoHtml(lang)}`);

  const nodos = [['auth', 'Java 21 · Spring Boot 3.3.5'], ['recycler', 'Java 21 · Spring Boot 3.3.5'], ['collection', 'Java 21 · Spring Boot 3.3.5'], ['reporting', 'Java 21 · Spring Boot 3.3.5'], ['frontend', 'Angular']];
  const arq = section('arquitectura', t(lang, 'arquitectura.md', 'architecture.md'), 'ts', 'Markdown', t(lang, 'servicios y despliegue', 'services and deployment'), 'f-arq', `  <h2 class="title-px" id="f-arq">${t(lang, 'Arquitectura', 'Architecture')}</h2>
  <p class="lead">${t(lang, 'Cuatro servicios en Java 21 y Spring Boot 3.3.5, con un frontend en Angular.', 'Four services on Java 21 and Spring Boot 3.3.5, with an Angular frontend.')}</p>
  ${win('servicios.ts', `<ul class="node-grid">${nodos.map(([n, s]) => `<li class="node"><strong>${n}</strong><span>${s}</span></li>`).join('')}</ul>
    <p class="pillars">${t(lang, 'arquitectura hexagonal · patrón Outbox/Inbox · Liquibase', 'hexagonal architecture · Outbox/Inbox pattern · Liquibase')}</p>
    <p class="pillars">${t(lang, 'despliegue', 'deployment')}: Render · Neon · CloudAMQP</p>`)}`);

  const dec = section('decisiones', t(lang, 'decisiones.md', 'decisions.md'), 'md', 'Markdown', t(lang, 'y su porqué', 'and why'), 'f-dec', `  <h2 class="title-px" id="f-dec">${t(lang, 'Decisiones', 'Decisions')}</h2>
  <ul class="plain dec">
    <li><strong>${t(lang, 'Arquitectura hexagonal', 'Hexagonal architecture')}</strong>${t(lang, 'El dominio de cada servicio queda aislado de la entrada y la salida.', "Each service's domain stays isolated from its inputs and outputs.")}</li>
    <li><strong>${t(lang, 'Patrón Outbox/Inbox', 'Outbox/Inbox pattern')}</strong>${t(lang, 'Los eventos entre servicios se registran antes de enviarse o procesarse.', 'Events between services are recorded before they are sent or processed.')}</li>
    <li><strong>Liquibase</strong>${t(lang, 'El esquema de datos se versiona con migraciones.', 'The data schema is versioned with migrations.')}</li>
    <li><strong>${t(lang, 'Origen de los patrones', 'Where the patterns come from')}</strong>${t(lang, 'Tomados del concepto de un sistema profesional, sin datos ni código de ninguna empresa.', "Taken from the concept of a professional system, with no company's data or code.")}</li>
  </ul>`);

  const enl = section('enlaces', t(lang, 'enlaces.md', 'links.md'), 'md', 'Markdown', t(lang, 'documentación y código', 'documentation and code'), 'f-enl', `  <h2 class="title-px" id="f-enl">${t(lang, 'Documentación y código', 'Docs and code')}</h2>
  <div class="links">
    ${ext(URL_DOCS, t(lang, 'Portal de documentación de esg-trazabilidad', 'esg-trazabilidad documentation portal'), `${t(lang, 'Documentación', 'Docs')}${ic('i-ext', 16)}`, lang, 'tag')}
    ${ext(URL_CODIGO, t(lang, 'Código de esg-trazabilidad', 'esg-trazabilidad source code'), `${t(lang, 'Código', 'Code')}${ic('i-ext', 16)}`, lang, 'tag')}
  </div>`);

  const resultados = section('resultados', t(lang, 'resultados.json', 'results.json'), 'json', 'JSON', 'json', 'f-resu', `  <h2 class="title-px" id="f-resu">${t(lang, 'Resultados', 'Results')}</h2>
  <div class="json">
    <p class="mono"><span class="punc" aria-hidden="true">{</span></p>
    <ol><li><dl><dt>${t(lang, 'cifras', 'figures')}</dt><dd>${todo(lang)}</dd><dt>${t(lang, 'capturas', 'screenshots')}</dt><dd>${todo(lang)}</dd></dl></li></ol>
    <p class="mono"><span class="punc" aria-hidden="true">}</span></p>
  </div>`);

  return [resumen, ent, demo, arq, dec, enl, resultados, contacto(lang, root)];
}

/* ── 404 ───────────────────────────────────────────── */
function notFoundSections() {
  return [section('error', '404.log', 'sh', 'Log', 'error', 'f-404', `  <p class="prompt"><span class="ps">visitante@portafolio</span><span class="punc">:~$</span> <span class="typed" style="--ch:7">cat 404</span><i class="caret" aria-hidden="true"></i></p>
  <h1 class="name" id="f-404"><span class="nm" data-text="404">404</span></h1>
  <p class="lead">No encontré esa página. / I couldn't find that page.</p>
  <div class="cta">
    <a class="btn primary" href="index.html" lang="es">Volver al inicio</a>
    <a class="btn" href="en/index.html" lang="en">Back to the home page</a>
  </div>`, 'sh')];
}

/* ── Montaje ───────────────────────────────────────── */
const pages = [];
for (const lang of ['es', 'en']) {
  const u = UI[lang];
  for (const kind of ['home', 'caso']) {
    const file = PAGES[lang][kind];
    const root = '../'.repeat(file.split('/').length - 1);
    const rel = (to) => posix.relative(posix.dirname(file), to) || posix.basename(to);
    const hrefs = { home: rel(PAGES[lang].home), caso: rel(PAGES[lang].caso), demo: `${rel(PAGES[lang].caso)}#demo` };
    const langLinks = {};
    langLinks.es = lang === 'es' ? posix.basename(file) : rel(PAGES.es[kind]);
    langLinks.en = lang === 'en' ? posix.basename(file) : rel(PAGES.en[kind]);
    let tabs;
    let tree;
    let sections;
    let gutterRows;
    let title;
    let desc;
    if (kind === 'home') {
      sections = homeSections(lang, hrefs, root);
      tabs = [['perfil', t(lang, 'perfil.md', 'profile.md'), 'md'], ['sobre-mi', t(lang, 'sobre-mi.md', 'about.md'), 'md'], ['habilidades', t(lang, 'habilidades.ts', 'skills.ts'), 'ts'],
        ['experiencia', t(lang, 'experiencia.json', 'experience.json'), 'json'], ['proyecto', 'esg-trazabilidad.md', 'md'], ['contacto', 'contacto.sh', 'sh']]
        .map(([id, name, type]) => ({ href: `#${id}`, name, type }));
      tree = [{ dir: 'portafolio', items: tabs }, { dir: t(lang, 'proyectos', 'projects'), items: [{ href: hrefs.caso, name: 'esg-trazabilidad/', type: 'md' }] }];
      gutterRows = 290;
      title = `${NOMBRE} — Backend Developer`;
      desc = t(lang, 'Portafolio de Angel Saenz, desarrollador backend en Lima: Java, Spring Boot, Python, Odoo y nube. Caso de estudio: esg-trazabilidad.',
        'Portfolio of Angel Saenz, backend developer in Lima: Java, Spring Boot, Python, Odoo and cloud. Case study: esg-trazabilidad.');
    } else {
      sections = casoSections(lang, hrefs, root);
      tabs = [['resumen', t(lang, 'resumen.md', 'summary.md'), 'md'], ['entradas', 'entradas.sh', 'sh'], ['demo', 'demo.csv', 'csv'], ['arquitectura', t(lang, 'arquitectura.md', 'architecture.md'), 'ts'],
        ['decisiones', t(lang, 'decisiones.md', 'decisions.md'), 'md'], ['enlaces', t(lang, 'enlaces.md', 'links.md'), 'md'], ['resultados', t(lang, 'resultados.json', 'results.json'), 'json'], ['contacto', 'contacto.sh', 'sh']]
        .map(([id, name, type]) => ({ href: `#${id}`, name, type }));
      tree = [{ dir: 'esg-trazabilidad', items: tabs }, { dir: 'portafolio', items: [{ href: hrefs.home, name: t(lang, '← inicio', '← home'), type: 'md' }] }];
      gutterRows = 230;
      title = `esg-trazabilidad — ${NOMBRE}`;
      desc = t(lang, 'Caso de estudio esg-trazabilidad: demo instantánea con datos simulados y acceso al sistema real.', 'Case study esg-trazabilidad: instant demo with simulated data and access to the real system.');
    }
    pages.push({ file, html: frame({ lang, file, root, title, desc, tabs, tree, sections, gutterRows, langLinks, modo: 'Markdown' }) });
  }
}
/* 404: bilingüe, en la raíz; sin interruptor de idioma. */
pages.push({
  file: '404.html',
  html: frame({
    lang: 'es', file: '404.html', root: '', title: `404 — ${NOMBRE}`, desc: 'Página no encontrada.',
    tabs: [{ href: '#error', name: '404.log', type: 'sh' }],
    tree: [{ dir: 'portafolio', items: [{ href: 'index.html', name: 'perfil.md', type: 'md' }, { href: 'caso/esg-trazabilidad.html', name: 'esg-trazabilidad/', type: 'md' }] }],
    sections: notFoundSections(), gutterRows: 60, langLinks: null, modo: 'Log',
  }),
});

for (const p of pages) {
  const out = join(ROOT, p.file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, p.html);
}
writeFileSync(join(ROOT, 'assets/favicon.svg'), faviconSvg());
console.log(`generadas ${pages.length} páginas`);
