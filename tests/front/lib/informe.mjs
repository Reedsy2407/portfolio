// Registro de resultados: cada prueba llama a check(nombre, ok, detalle) o info(nombre, detalle).
export function crearInforme() {
  const resultados = [];
  return {
    resultados,
    check(nombre, ok, detalle = '') { resultados.push({ nombre, ok: Boolean(ok), detalle }); },
    info(nombre, detalle) { resultados.push({ nombre, ok: true, info: true, detalle }); },
  };
}

export function resumen(informes) {
  let total = 0;
  let fallos = 0;
  for (const r of informes.flatMap((i) => i.resultados)) { if (!r.info) total += 1; if (!r.ok) fallos += 1; }
  return { total, fallos };
}

export function formatear(nombre, informe) {
  const lineas = [`\n# ${nombre}`];
  for (const r of informe.resultados) lineas.push(`  ${r.info ? 'i' : r.ok ? '✓' : '✗'} ${r.nombre}${r.detalle ? ` — ${r.detalle}` : ''}`);
  return lineas.join('\n');
}
