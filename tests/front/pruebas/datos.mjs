// Datos sensibles: patrones configurables (teléfonos, nombres que no se publican, lo que el proyecto añada) buscados
// en el texto visible, en los atributos href/src/alt/title y en el código fuente de cada página.
import { abrir } from '../lib/navegador.mjs';
import { paginasDe } from '../lib/config.mjs';

export const id = 'datos';
export const nombre = 'datos sensibles';

// Siete o más dígitos seguidos (con espacios, puntos, guiones o paréntesis) se leen como un teléfono.
export const TELEFONO = /(?:\+?\d[\s().-]?){7,}/;

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Los patrones que aplican, ya como expresiones: [{ nombre, re }]. */
export function patronesDe(config, { telefonos = true } = {}) {
  const d = config.datosSensibles;
  const lista = [];
  if (d.telefonos && telefonos) lista.push({ nombre: 'teléfono', re: TELEFONO });
  for (const p of d.patrones) lista.push({ nombre: p.nombre, re: new RegExp(p.regex, p.flags ?? 'i') });
  for (const n of d.nombresProhibidos) lista.push({ nombre: `nombre prohibido «${n}»`, re: new RegExp(escapar(n), 'i') });
  return lista;
}

/** Coincidencias en un texto, descartando lo que el proyecto marca como inocuo (años, versiones…). */
export function buscarDatos(texto, config, opciones) {
  const ignorar = config.datosSensibles.ignorar.map((r) => new RegExp(r, 'i'));
  /* Las fechas ISO (2026-10-21) no son teléfonos. */
  const sinFechas = texto.replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ');
  const limpio = ignorar.reduce((t, re) => t.replace(new RegExp(re.source, 'gi'), ' '), sinFechas);
  const hallazgos = [];
  for (const { nombre: n, re } of patronesDe(config, opciones)) {
    const m = limpio.match(re);
    if (m) hallazgos.push(`${n}: «${m[0].trim().slice(0, 30)}»`);
  }
  return hallazgos;
}

export async function run({ browser, base, report, config }) {
  const hay = patronesDe(config);
  report.check('hay patrones de datos sensibles configurados', hay.length > 0, hay.map((x) => x.nombre).join(', '));
  if (config.datosSensibles.telefonos) {
    report.check('el patrón de teléfonos detecta «+51 999 888 777» y «(01) 234-5678»', TELEFONO.test('+51 999 888 777') && TELEFONO.test('(01) 234-5678'));
    report.check('el patrón de teléfonos deja pasar años, versiones y cifras comunes', !['abril 2026 – actualidad', 'versión 3.3.5', '2023 – 2025', '64/100'].some((s) => TELEFONO.test(s)));
  }
  for (const p of paginasDe(config)) {
    const { context, page } = await abrir(browser, base, p.ruta);
    const fuentes = await page.evaluate(() => ({
      visible: document.body.innerText,
      atributos: [...document.querySelectorAll('[href],[src],[alt],[title],[aria-label]')].flatMap((e) => ['href', 'src', 'alt', 'title', 'aria-label'].map((a) => e.getAttribute(a)).filter(Boolean)).join('\n'),
      codigo: document.documentElement.outerHTML,
    }));
    for (const [donde, texto] of Object.entries(fuentes)) {
      /* Los números de teléfono solo se buscan en el texto visible (en atributos y código hay rutas, fechas y trazados con muchos dígitos); allí solo los enlaces tel: y de mensajería. */
      const encontrados = buscarDatos(texto, config, { telefonos: donde === 'visible' });
      if (config.datosSensibles.telefonos && donde === 'atributos' && /^(tel:|sms:|https?:\/\/(wa\.me|api\.whatsapp\.com))/im.test(texto)) encontrados.push('enlace de teléfono o mensajería');
      report.check(`${p.ruta}: sin datos sensibles en ${donde === 'visible' ? 'el texto visible' : donde === 'atributos' ? 'los atributos' : 'el código fuente'}`, encontrados.length === 0, encontrados.join('; '));
    }
    await context.close();
  }
}
