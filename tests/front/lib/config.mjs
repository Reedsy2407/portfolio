// Configuración de las pruebas de front por proyecto (tests/front/front.config.json). Valores por defecto razonables
// y validación estricta: un umbral mal escrito debe fallar al cargar, no pasar en silencio.
import { readFileSync } from 'node:fs';

export class ConfigInvalida extends Error {
  constructor(errores) {
    super(`front.config.json inválido:\n- ${errores.join('\n- ')}`);
    this.errores = errores;
  }
}

export const POR_DEFECTO = Object.freeze({
  version: 1,
  paginas: [{ ruta: '/index.html', tipo: 'portada' }],
  temas: ['dark', 'light'],
  origen: { carpeta: '.', url: null, cabeceras: true },
  viewports: { movil: [360, 740], tableta: [768, 1024], escritorio: [1280, 800] },
  umbrales: {
    contrasteTexto: 4.5, contrasteTextoGrande: 3, texturaAlfaMax: 0.08,
    anchosSinDesborde: [360, 768, 1280], objetivoPx: 44, focoPx: 3, textoMinimoPx: 15, textoBasePx: null,
    cicloMinimoMs: 340, pesoPortadaKB: 150, jsKB: 15, fuentesMax: 4,
    cpuLimitePct: 10, cpuObjetivoPct: 2, cpuMuestras: 3, cpuVentanaMs: 6000,
  },
  selectores: {
    objetivos: 'button, [role="button"], summary, input:not([type="hidden"]), select, textarea, nav a, header a, footer a',
    excluirObjetivos: ['.skip', '.sr-only'],
    decorativos: [],
    ignorarTexto: ['.sr-only', '[hidden]'],
  },
  contenido: { minCaracteres: 200, textoEsperado: [], externosEnPestanaNueva: false, sinEmoji: true },
  datosSensibles: { telefonos: true, patrones: [], nombresProhibidos: [], ignorar: [] },
  fuentes: { licencias: null },
  dist: { carpeta: 'dist', permitidos: ['index.html', '404.html', '_headers', 'assets/**'], prohibidos: [] },
  pruebas: { cpu: true },
});

const esObjeto = (x) => x && typeof x === 'object' && !Array.isArray(x);

function fusionar(base, extra) {
  if (!esObjeto(base) || !esObjeto(extra)) return extra === undefined ? base : extra;
  const salida = { ...base };
  for (const [k, v] of Object.entries(extra)) salida[k] = k in base && esObjeto(base[k]) ? fusionar(base[k], v) : v;
  return salida;
}

const TIPOS_PAGINA = ['portada', 'interior', '404'];

export function normalizarConfig(entrada = {}) {
  const errores = [];
  if (!esObjeto(entrada)) throw new ConfigInvalida(['el archivo debe ser un objeto JSON']);
  for (const sec of ['umbrales', 'selectores', 'contenido', 'datosSensibles', 'fuentes', 'dist', 'pruebas', 'origen', 'viewports'])
    if (sec in entrada && !esObjeto(entrada[sec])) errores.push(`${sec} debe ser un objeto`);
  if (errores.length) throw new ConfigInvalida(errores);
  const c = fusionar(JSON.parse(JSON.stringify(POR_DEFECTO)), entrada);
  for (const k of Object.keys(entrada)) if (k !== '_ayuda' && !(k in POR_DEFECTO)) errores.push(`clave desconocida: «${k}»`);
  for (const sec of ['umbrales', 'selectores', 'contenido', 'datosSensibles', 'fuentes', 'dist', 'pruebas', 'origen'])
    for (const k of Object.keys(entrada[sec] ?? {})) if (!(k in POR_DEFECTO[sec])) errores.push(`${sec}.${k}: clave desconocida`);
  if (c.version !== 1) errores.push('version debe ser 1');

  if (!Array.isArray(c.paginas) || !c.paginas.length) errores.push('paginas debe ser una lista con al menos una página');
  else c.paginas.forEach((p, i) => {
    if (!p || typeof p.ruta !== 'string' || !p.ruta.startsWith('/')) errores.push(`paginas[${i}].ruta debe empezar por «/»`);
    if (!TIPOS_PAGINA.includes(p?.tipo)) errores.push(`paginas[${i}].tipo debe ser uno de ${TIPOS_PAGINA.join(', ')}`);
    if (p?.clics !== undefined && !(Array.isArray(p.clics) && p.clics.every((s) => typeof s === 'string'))) errores.push(`paginas[${i}].clics debe ser una lista de selectores`);
  });
  if (!Array.isArray(c.temas) || !c.temas.length || !c.temas.every((t) => ['dark', 'light'].includes(t))) errores.push('temas debe ser una lista con «dark» y/o «light»');
  if (!esObjeto(c.viewports) || !Object.values(c.viewports).every((v) => Array.isArray(v) && v.length === 2 && v.every((n) => Number.isInteger(n) && n > 0))) errores.push('viewports debe ser { nombre: [ancho, alto] } con enteros positivos');
  if (c.origen.url !== null && !/^https?:\/\/[^\s/]+/.test(String(c.origen.url))) errores.push('origen.url debe ser una URL http(s) o null');

  const u = c.umbrales;
  for (const k of ['contrasteTexto', 'contrasteTextoGrande', 'objetivoPx', 'focoPx', 'textoMinimoPx', 'cicloMinimoMs', 'pesoPortadaKB', 'jsKB', 'fuentesMax', 'cpuLimitePct', 'cpuObjetivoPct', 'cpuMuestras', 'cpuVentanaMs'])
    if (!(typeof u[k] === 'number' && u[k] > 0)) errores.push(`umbrales.${k} debe ser un número positivo`);
  if (!(typeof u.texturaAlfaMax === 'number' && u.texturaAlfaMax >= 0 && u.texturaAlfaMax <= 1)) errores.push('umbrales.texturaAlfaMax debe estar entre 0 y 1');
  if (u.textoBasePx !== null && !(typeof u.textoBasePx === 'number' && u.textoBasePx > 0)) errores.push('umbrales.textoBasePx debe ser un número positivo o null');
  if (!Array.isArray(u.anchosSinDesborde) || !u.anchosSinDesborde.every((n) => Number.isInteger(n) && n > 0)) errores.push('umbrales.anchosSinDesborde debe ser una lista de enteros positivos');

  const s = c.selectores;
  if (typeof s.objetivos !== 'string') errores.push('selectores.objetivos debe ser un selector CSS (texto)');
  for (const k of ['excluirObjetivos', 'decorativos', 'ignorarTexto']) if (!(Array.isArray(s[k]) && s[k].every((x) => typeof x === 'string'))) errores.push(`selectores.${k} debe ser una lista de selectores`);

  const d = c.datosSensibles;
  for (const [i, p] of d.patrones.entries()) {
    if (!p || typeof p.nombre !== 'string' || typeof p.regex !== 'string') { errores.push(`datosSensibles.patrones[${i}] necesita nombre y regex (texto)`); continue; }
    try { new RegExp(p.regex, p.flags ?? 'i'); } catch { errores.push(`datosSensibles.patrones[${i}].regex no es una expresión válida`); }
  }
  for (const [i, r] of d.ignorar.entries()) { try { new RegExp(r, 'i'); } catch { errores.push(`datosSensibles.ignorar[${i}] no es una expresión válida`); } }
  if (!(Array.isArray(d.nombresProhibidos) && d.nombresProhibidos.every((x) => typeof x === 'string' && x))) errores.push('datosSensibles.nombresProhibidos debe ser una lista de textos');

  if (!(Array.isArray(c.dist.permitidos) && c.dist.permitidos.every((x) => typeof x === 'string'))) errores.push('dist.permitidos debe ser una lista de patrones');
  if (!(Array.isArray(c.dist.prohibidos) && c.dist.prohibidos.every((x) => typeof x === 'string'))) errores.push('dist.prohibidos debe ser una lista de patrones');
  if (errores.length) throw new ConfigInvalida(errores);
  return c;
}

export function cargarConfig(archivo) {
  let datos;
  try { datos = JSON.parse(readFileSync(archivo, 'utf8')); } catch (e) { throw new ConfigInvalida([`no pude leer ${archivo}: ${e.message}`]); }
  return normalizarConfig(datos);
}

export const paginasDe = (config, ...tipos) => config.paginas.filter((p) => !tipos.length || tipos.includes(p.tipo));
