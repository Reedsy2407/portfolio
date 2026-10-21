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
  es: { home: 'index.html' },
  en: { home: 'en/index.html' },
};

const UI = {
  es: {
    lang: 'es', skip: 'Saltar al contenido', files: 'Archivos', themeA: 'Tema claro', themeB: 'Tema oscuro',
    langLabel: 'Idioma', explorer: 'Explorador', navFiles: 'Archivos del portafolio', tabs: 'Archivos abiertos',
    search: 'Buscar archivo (Ctrl K)', statusBar: 'Barra de estado', errors: 'errores: ', goTo: 'Ir a un archivo',
    filter: 'Filtrar archivos', type: 'escribe para filtrar',
    newTab: '(se abre en una pestaña nueva)', user: 'visitante@portafolio',
  },
  en: {
    lang: 'en', skip: 'Skip to content', files: 'Files', themeA: 'Light theme', themeB: 'Dark theme',
    langLabel: 'Language', explorer: 'Explorer', navFiles: 'Portfolio files', tabs: 'Open files',
    search: 'Find file (Ctrl K)', statusBar: 'Status bar', errors: 'errors: ', goTo: 'Go to file',
    filter: 'Filter files', type: 'type to filter',
    newTab: '(opens in a new tab)', user: 'visitor@portfolio',
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
<symbol id="i-linkedin" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 11v6M8 7.5v.5M12 17v-6M12 13.5a3 3 0 0 1 6 0V17"/></symbol>
<symbol id="i-github" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8.6 8.4L8 6.4l2.2 1.3h3.6L16 6.4l-.6 2a3.6 3.6 0 0 1 .7 2.2c0 2.2-1.7 3.4-4.1 3.4s-4.1-1.2-4.1-3.4c0-.8.2-1.6.7-2.2zM10 18v-2.5M14 18v-2.5"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7.5L12 13l8.5-5.5"/></symbol>
<symbol id="i-cv" viewBox="0 0 24 24"><path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v4h4M9 12h6M9 16h4"/></symbol>
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
const fileHead = (name, type, label) =>
  `  <p class="file-name" data-file="${name}">${ic('i-file', 18, 't-' + type)}<b>${name}</b> · ${label}</p>`;
const section = (id, name, type, mode, label, labelledby, body, cls = '') =>
  `<section class="file${cls ? ' ' + cls : ''}" id="${id}" data-lang="${mode}" aria-labelledby="${labelledby}">\n${fileHead(name, type, label)}\n${body}\n</section>`;
const win = (name, inner, wide = true) =>
  `<figure class="win${wide ? ' wide' : ''}"><figcaption class="win-bar"><span class="lights" aria-hidden="true"><i></i><i></i><i></i></span><span>${name}</span></figcaption><div class="win-body">${inner}</div></figure>`;
/* Enlace externo: pestaña nueva y nombre accesible que empieza por el texto visible (WCAG 2.5.3). */
const ext = (href, label, inner, lang, cls = '', extra = '') =>
  `<a${cls ? ` class="${cls}"` : ''} href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label} ${UI[lang].newTab}"${extra}>${inner}</a>`;
const row = (g, v) => `<li><span class="g"><span class="cm" aria-hidden="true">// </span>${g}</span><span class="v">${v}</span></li>`;
const tagList = (items, label) => `<ul class="chips-tech" aria-label="${label}">${items.map((x) => `<li>${x}</li>`).join('')}</ul>`;

/* CV: se enlaza solo si el archivo existe al generar el sitio; si no, queda el marcador y ningún enlace. */
const CV_RUTA = 'assets/cv/CV_Angel_Saenz.pdf';
const CV_BYTES = existsSync(join(ROOT, CV_RUTA)) ? statSync(join(ROOT, CV_RUTA)).size : null;
const cvTamano = () => (CV_BYTES < 1024 * 1024 ? `${Math.max(1, Math.round(CV_BYTES / 1024))} KB` : `${(CV_BYTES / 1024 / 1024).toFixed(1)} MB`);
const cvTodo = (lang) => `<span class="todo">${t(lang, '[CV por confirmar]', '[CV to be confirmed]')}</span>`;
const cvButton = (lang, root) => {
  const visible = `${t(lang, 'Ver CV', 'View CV')} (PDF, ${cvTamano()})`;
  const aria = `${visible} ${t(lang, 'de', 'by')} ${NOMBRE} ${UI[lang].newTab}`;
  return `<a class="btn" href="${root}${CV_RUTA}" target="_blank" rel="noopener noreferrer" aria-label="${aria}">${ic('i-cv', 18)}<span>${t(lang, 'Ver CV', 'View CV')} <span class="sz">(PDF, ${cvTamano()})</span></span></a>`;
};

const PROJECT_TEXT = {
  es: 'Plataforma de trazabilidad ESG para recicladores formalizados de Lima Metropolitana. Conecta a vecinos y empresas con asociaciones de recicladores y emite un certificado digital en PDF. Son cuatro servicios en Java 21 y Spring Boot 3.3.5 con arquitectura hexagonal, patrón Outbox/Inbox y Liquibase, más un frontend en Angular.',
  en: 'An ESG traceability platform for formalized recyclers in Metropolitan Lima. It connects neighbors and companies with recycler associations and issues a digital PDF certificate. It has four services on Java 21 and Spring Boot 3.3.5 with hexagonal architecture, the Outbox/Inbox pattern and Liquibase, plus an Angular frontend.',
};

/* ── Portada ───────────────────────────────────────── */
const EXPERIENCIA = [
  {
    empresa: 'HRF GROUP S.A.C.',
    cargo: ['Desarrollador backend Java', 'Java backend developer'],
    periodo: ['abril 2026 – actualidad · remoto', 'April 2026 – present · remote'],
    contexto: ['plataforma de e-commerce B2B', 'B2B e-commerce platform'],
    hechos: [
      ['Microservicios en Java 21 y Spring Boot 3.x con arquitectura hexagonal.', 'Microservices on Java 21 and Spring Boot 3.x with hexagonal architecture.'],
      ['Corrección de errores de precios y promociones, rastreando la causa raíz entre capas.', 'Fixed pricing and promotion bugs by tracing the root cause across layers.'],
      ['Endpoints batch para consulta masiva de stock entre microservicios.', 'Batch endpoints for bulk stock queries between microservices.'],
      ['Despliegues a QA con ArgoCD, hotfixes controlados y monitoreo con Dynatrace.', 'QA deployments with ArgoCD, controlled hotfixes and Dynatrace monitoring.'],
    ],
    tec: ['Java 21', 'Spring Boot 3.x', 'PostgreSQL', 'Liquibase', 'Kubernetes', 'ArgoCD', 'Dynatrace', 'Azure DevOps'],
  },
  {
    empresa: 'HRF GROUP S.A.C.',
    cargo: ['Desarrollador backend Java en AWS', 'Java backend developer on AWS'],
    periodo: ['dic 2025 – mar 2026', 'Dec 2025 – Mar 2026'],
    contexto: ['sector educación', 'education sector'],
    hechos: [
      ['Lambdas en Java 21 con arquitectura hexagonal.', 'Lambdas in Java 21 with hexagonal architecture.'],
      ['S3 con enlaces de descarga seguros.', 'S3 with secure download links.'],
      ['Step Functions con registro de ejecuciones en DynamoDB y cambios en MySQL.', 'Step Functions with execution logging in DynamoDB, and MySQL changes.'],
    ],
    tec: ['Java 21', 'AWS Lambda', 'S3', 'Step Functions', 'DynamoDB', 'MySQL'],
  },
  {
    empresa: 'HRF GROUP S.A.C.',
    cargo: ['Desarrollador backend', 'Backend developer'],
    periodo: ['sep – dic 2025', 'Sep – Dec 2025'],
    contexto: ['CRM empresarial', 'enterprise CRM'],
    hechos: [
      ['APIs REST y GraphQL en .NET Core y Python.', 'REST and GraphQL APIs in .NET Core and Python.'],
      ['Procesamiento masivo de CSV.', 'Bulk CSV processing.'],
      ['Repository y Unit of Work con Entity Framework.', 'Repository and Unit of Work with Entity Framework.'],
    ],
    tec: ['.NET Core', 'Python', 'REST', 'GraphQL', 'Entity Framework'],
  },
  {
    empresa: 'Hera Consulting SAC',
    cargo: ['Analista programador Java junior', 'Junior Java programmer analyst'],
    periodo: ['julio 2025 – actualidad · jornada parcial', 'July 2025 – present · part-time'],
    hechos: [
      ['Aplicaciones empresariales en Java y Python (Spring MVC, JSP, Servlets).', 'Enterprise applications in Java and Python (Spring MVC, JSP, Servlets).'],
      ['Módulos de Odoo con integraciones de WhatsApp e IA.', 'Odoo modules with WhatsApp and AI integrations.'],
    ],
    tec: ['Java', 'Python', 'Spring MVC', 'Odoo', 'Oracle', 'PostgreSQL', 'Angular', 'TypeScript'],
  },
  {
    empresa: 'COMPIPRO',
    cargo: ['Prácticas', 'Internship'],
    periodo: ['feb – may 2025', 'Feb – May 2025'],
    hechos: [
      ['Módulos de logística, asistencias y CRM.', 'Logistics, attendance and CRM modules.'],
      ['Chat en tiempo real con WebSockets (Workerman).', 'Real-time chat with WebSockets (Workerman).'],
    ],
    tec: ['PHP', 'JavaScript', 'MVC', 'WebSockets'],
  },
];

function homeSections(lang, root) {
  const u = UI[lang];
  const copiarLabel = `${t(lang, 'Copiar correo', 'Copy email')} ${CORREO}`;
  const chipLabel = (nombre) => `${nombre} ${t(lang, 'de', 'of')} ${NOMBRE}`;
  const perfil = section('perfil', t(lang, 'perfil.md', 'profile.md'), 'md', 'Markdown', 'markdown', 'f-perfil', `  <p class="prompt"><span class="ps">${u.user}</span><span class="punc">:~$</span> <span class="typed" style="--ch:${t(lang, 14, 16)}">${t(lang, 'cat saludo.txt', 'cat greeting.txt')}</span><i class="caret" aria-hidden="true"></i></p>
  <p class="mono rise" style="--i:1"><span class="cm">${t(lang, '// hola, soy', "// hi, I'm")}</span></p>
  <h1 class="name" id="f-perfil"><span class="nm" data-text="${NOMBRE}">${NOMBRE}</span></h1>
  <p class="role rise" style="--i:2">// Backend Developer</p>
  <ul class="stack-tags rise" style="--i:2" aria-label="${t(lang, 'Stack principal', 'Main stack')}">${['Java / Spring Boot', 'AWS', 'Kubernetes', 'Angular', 'PostgreSQL'].map((x) => `<li><span aria-hidden="true">// </span>${x}</li>`).join('')}</ul>
  <p class="lead">${t(lang,
    'Desarrollador backend en Lima. Construyo microservicios con Java y Spring Boot, trabajo con servicios de AWS y despliego en Kubernetes y Azure DevOps.',
    'Backend developer based in Lima. I build microservices with Java and Spring Boot, work with AWS services and deploy on Kubernetes and Azure DevOps.')}</p>
  <div class="cta rise" style="--i:3">
    <a class="btn primary" href="#sobre-mi">${t(lang, 'Sobre mí', 'About me')}</a>
    ${CV_BYTES === null ? '' : cvButton(lang, root)}
  </div>
  <div class="links rise" style="--i:4">
    ${ext(URL_LINKEDIN, chipLabel('LinkedIn'), `${ic('i-linkedin', 18)}LinkedIn`, lang, 'tag')}
    ${ext(URL_GITHUB, chipLabel('GitHub'), `${ic('i-github', 18)}GitHub`, lang, 'tag')}
    <a class="tag" id="copiar-correo" href="mailto:${CORREO}" data-label="${copiarLabel}" data-ok="${t(lang, 'Copiado', 'Copied')}" data-fail="${t(lang, 'No se pudo copiar', 'Could not copy')}">${ic('i-mail', 18)}<span>${CORREO}</span></a>
    <a class="tag js-only" href="mailto:${CORREO}">${t(lang, 'Escribir', 'Write')}</a>
    <span class="copiado" id="copiado" aria-live="polite"></span>
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

  const job = (e) => `<li class="job">
      <p class="job-when">${t(lang, ...e.periodo)}</p>
      <h3 class="job-title">${t(lang, ...e.cargo)} <span class="sep" aria-hidden="true">·</span> <span class="co">${e.empresa}</span></h3>
      ${e.contexto ? `<p class="job-ctx">${t(lang, ...e.contexto)}</p>` : ''}
      <ul class="job-facts">${e.hechos.map((h) => `<li>${t(lang, ...h)}</li>`).join('')}</ul>
      ${tagList(e.tec, t(lang, 'Tecnologías', 'Technologies'))}
    </li>`;
  const exp = section('experiencia', t(lang, 'experiencia.md', 'experience.md'), 'md', 'Markdown', t(lang, 'línea de tiempo', 'timeline'), 'f-exp', `  <h2 class="title-px" id="f-exp">${t(lang, 'Experiencia', 'Experience')}</h2>
  <p class="mono"><span class="cm">${t(lang, '// de lo más reciente a lo más antiguo. Por confidencialidad no nombro a los clientes finales.', "// most recent first. For confidentiality I don't name end clients.")}</span></p>
  <ol class="timeline">
    ${EXPERIENCIA.map(job).join('\n    ')}
  </ol>`);

  const proyectos = section('proyectos', t(lang, 'proyectos.md', 'projects.md'), 'md', 'Markdown', t(lang, 'proyecto destacado y propios', 'featured and personal projects'), 'f-pro', `  <h2 class="title-px" id="f-pro">${t(lang, 'Proyectos', 'Projects')}</h2>
  <article class="project wide" aria-labelledby="p-esg">
    <h3 id="p-esg">esg-trazabilidad</h3>
    <p class="project-meta">${t(lang, 'Proyecto académico (EFSRT, CIBERTEC) · septiembre – octubre 2026', 'Academic project (EFSRT, CIBERTEC) · September – October 2026')}</p>
    <p>${PROJECT_TEXT[lang]}</p>
    ${tagList(['Java 21', 'Spring Boot 3.3.5', 'Angular', 'PostgreSQL', 'Liquibase', 'Render', 'Neon', 'CloudAMQP'], t(lang, 'Tecnologías', 'Technologies'))}
    <p class="notice" id="aviso-sistema"><b>${t(lang, 'Aviso:', 'Notice:')}</b> ${t(lang,
      'puede tardar hasta 1 minuto en despertar (hosting gratuito). El propio sistema ofrece una cuenta demo de un clic para entrar sin registrarte.',
      'it may take up to 1 minute to wake up (free hosting). The system itself offers a one-click demo account so you can sign in without registering.')}</p>
    <div class="cta">
      ${ext(URL_SISTEMA, `${t(lang, 'Abrir el sistema real', 'Open the real system')} ${t(lang, 'de', 'of')} esg-trazabilidad`, `${t(lang, 'Abrir el sistema real', 'Open the real system')}${ic('i-ext', 16)}`, lang, 'btn primary', ' aria-describedby="aviso-sistema"')}
      ${ext(URL_CODIGO, `${t(lang, 'Código', 'Code')} ${t(lang, 'de', 'of')} esg-trazabilidad`, `${ic('i-github', 18)}${t(lang, 'Código', 'Code')}`, lang, 'btn')}
      ${ext(URL_DOCS, `${t(lang, 'Documentación', 'Documentation')} ${t(lang, 'de', 'of')} esg-trazabilidad`, `${ic('i-file', 18)}${t(lang, 'Documentación', 'Documentation')}`, lang, 'btn')}
    </div>
  </article>
  <h3 class="sub">${t(lang, 'Proyectos propios', 'Personal projects')}</h3>
  <ul class="plain dec own">
    <li><strong>Portal Laboral</strong>${t(lang, 'Spring Boot, Spring Security con JWT, Angular y MySQL.', 'Spring Boot, Spring Security with JWT, Angular and MySQL.')}</li>
    <li><strong>Helpcore</strong>${t(lang, 'Microservicios con API Gateway, autenticación, config server y notificaciones con Redis.', 'Microservices with API Gateway, authentication, config server and Redis notifications.')}</li>
  </ul>`);

  return [perfil, sobre, hab, exp, proyectos];
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
  const file = PAGES[lang].home;
  const root = '../'.repeat(file.split('/').length - 1);
  const sections = homeSections(lang, root);
  const tabs = [['perfil', t(lang, 'perfil.md', 'profile.md'), 'md'], ['sobre-mi', t(lang, 'sobre-mi.md', 'about.md'), 'md'], ['habilidades', t(lang, 'habilidades.ts', 'skills.ts'), 'ts'],
    ['experiencia', t(lang, 'experiencia.md', 'experience.md'), 'md'], ['proyectos', t(lang, 'proyectos.md', 'projects.md'), 'md']]
    .map(([id, name, type]) => ({ href: `#${id}`, name, type }));
  const rel = (to) => posix.relative(posix.dirname(file), to) || posix.basename(to);
  const langLinks = { es: lang === 'es' ? posix.basename(file) : rel(PAGES.es.home), en: lang === 'en' ? posix.basename(file) : rel(PAGES.en.home) };
  pages.push({
    file,
    html: frame({
      lang, file, root, title: `${NOMBRE} — Backend Developer`,
      desc: t(lang, 'Portafolio de Angel Saenz, desarrollador backend en Lima: Java, Spring Boot, AWS, Kubernetes y el proyecto esg-trazabilidad.',
        'Portfolio of Angel Saenz, backend developer in Lima: Java, Spring Boot, AWS, Kubernetes and the esg-trazabilidad project.'),
      tabs, tree: [{ dir: 'portafolio', items: tabs }], sections, gutterRows: 250, langLinks, modo: 'Markdown',
    }),
  });
}
/* 404: bilingüe, en la raíz; sin interruptor de idioma. */
pages.push({
  file: '404.html',
  html: frame({
    lang: 'es', file: '404.html', root: '', title: `404 — ${NOMBRE}`, desc: 'Página no encontrada.',
    tabs: [{ href: '#error', name: '404.log', type: 'sh' }],
    tree: [{ dir: 'portafolio', items: [{ href: 'index.html', name: 'perfil.md', type: 'md' }] }],
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
