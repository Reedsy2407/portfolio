# DESIGN-BRIEF — portfolio

Única fuente de verdad del diseño. Ninguna herramienta ni skill la sustituye: si discrepan, gana este archivo. Las secciones vacías se rellenan en la primera maqueta, antes de escribir la primera pantalla (ver «Proceso»).

- **Audiencia:** _(quién lo usa, con qué frecuencia, en qué dispositivo)_
- **Tres adjetivos:** _(…, …, …)_
- **Personalidad y mundo del público:** _(el objeto, el material o el oficio del que sale la estética; no un sitio web concreto)_
- **Dirección vigente:** _(nombre, fecha y quién la eligió, tras comparar tres maquetas)_
- **Elemento firma:** _(uno solo, sutil y consistente; nunca repetido en todo a la vez)_

## Identidad y logo
_(Colores de marca muestreados del logo oficial, no a ojo; el logo redibujado en SVG propio y comparado superpuesto con el original.)_

Reglas de uso, ya fijadas:
- Versiones: color, monocromo y símbolo solo. No se estira, no se recolorea, no se le añade sombra ni degradado.
- Espacio libre mínimo alrededor del símbolo y tamaño mínimo de 24 px de lado.
- `alt` informativo cuando el logo es la única identificación; `alt=""` si va junto al nombre en texto o es decorativo.
- Lugares obligatorios: barra superior, acceso/login, pantalla de carga, documentos exportados (en vectores si la librería no soporta SVG), favicon e íconos de la app, página 404 y pie.

## Paleta (contraste AA calculado; tokens en `design/styles.css`)
| Token | Valor | Uso | Contraste |
|---|---|---|---|
| | | | |

_(Cada color nuevo se añade primero como token y aquí, con su contraste calculado. Los colores de estado no se usan como colores de interfaz.)_

## Tipografía
_(Familias, pesos y respaldo con métricas ajustadas para que el cambio de fuente no mueva la maquetación. Cifras tabulares si hay datos. Nunca Inter, Roboto, Arial ni la fuente del sistema como voz.)_

Escala, ya fijada: texto base de 18 px y piso de 15 px (nada de 10 a 12 px); saltos de 3x o más entre cuerpo y título; las cifras son protagonistas.

## Forma, iconos y movimiento
_(Esquinas, bordes, textura, densidad. Un solo juego de iconos.)_

Reglas ya fijadas:
- Movimiento solo en CSS: una entrada orquestada con elementos escalonados, cifras que cuentan hacia arriba, hover con intención y View Transitions entre rutas si el framework lo permite sin dependencias. Sin rebotes ni elásticos y sin transiciones de propiedades de layout. `prefers-reduced-motion` respetado y probado.
- Pantalla de carga con la marca, de 1,2 s como máximo y estática con movimiento reducido.

## Reglas visuales mínimas (valen para cualquier proyecto con interfaz)
- **Aprovechar el ancho:** a 1280 y 1920 px, un layout con propósito (columna principal más panel de cifras grandes, o una cuadrícula con sentido), sin una columna estrecha flotando sobre un fondo vacío. En 360 px se apila con el dato clave en la primera pantalla.
- **Tipografía:** texto base de 18 px, piso de 15 px, saltos de 3x o más entre título y cuerpo.
- **Accesibilidad:** áreas táctiles de 44 px como mínimo, contraste AA calculado (no a ojo), foco visible y el color nunca como único canal.
- **Un solo foco por pantalla.** Sin tarjetas idénticas en rejilla, sin tarjetas anidadas, sin degradados decorativos y sin fuentes sobreusadas (Inter, Roboto, Arial).
- **Un elemento firma** sutil y consistente, nunca repetido en todo a la vez.
- **Datos de demostración** de 10 filas o más, no dos, y marcados como demostración.

## Contenido
_(Idioma y registro. Datos plausibles del lugar. Formato de fechas y cifras. Estados vacíos con una acción concreta. Nunca «Lorem ipsum», «John Doe» ni saludos genéricos.)_

## Prohibido
Degradados morado/azul y texto con degradado. Glassmorphism y `backdrop-blur`. Cuadrículas de tarjetas idénticas con icono + título + frase. Paneles de 3-4 KPI con iconos en la portada. Esquinas muy redondeadas con sombra grande en todo. Héroe con formas flotantes. Emojis como iconografía. Numeración decorativa 01/02/03. Avatares de relleno y gráficos inventados. Modo oscuro neón. Centrar todo. Dejar el tema por defecto de una librería de componentes.

## Proceso de diseño (desde el primer módulo con interfaz)
Antes de escribir la primera pantalla:
1. **Brief completo:** audiencia, tres adjetivos, mundo del público, las reglas visuales mínimas de arriba, la identidad desde el logo, tokens, movimiento y accesibilidad.
2. **Exploración de tres direcciones** maquetadas en HTML y CSS estático, con datos de ejemplo marcados como demostración, distintas entre sí (una conservadora, una editorial y una propia), en las pantallas clave y en 360, 1280 y 1920 px, con hoja comparativa, costo S/M/L, tokens y dependencias nuevas, y una recomendación razonada. La ambición se decide aquí, no después.
3. **La elección de la dirección es del humano** y es una parada legítima. Se elige mirando las capturas.
4. **El brief se actualiza** con la dirección elegida y cada pantalla se implementa con la skill `revision-visual`. Antes de pedir cada merge se responde: «¿se ve plano o genérico?». Si sí, se rehace.
5. **Auditoría de solo lectura** al cerrar un módulo o un hito (capturas en cuatro anchos con estados vacío y de error, detección manual de patrones genéricos, crítica aislada de un subagente, lista P0/P1/P2 con evidencia). Mide defectos, no ambición.
6. **Un rediseño** solo si lo pide el humano o la auditoría lo justifica; vuelve al paso 2.

### Referencias sin copiar
Las páginas admiradas se guardan solo como material de estudio en un directorio local ignorado por git (`design/refs/`) y de ellas se extraen **decisiones** (familia y escala tipográfica, relación de contraste, ritmo de espaciado, forma, densidad, tratamiento de estados), no píxeles. Se anota aquí la decisión y su razón, no la fuente. No se copian marcas, logotipos, ilustraciones, textos ni composiciones protegidas.

## Revisión anti-genérico (antes de dar una pantalla por buena)
1. Prueba de intercambio: con solo cambiar el logo, ¿serviría para otro sistema? Si sí, falta carácter.
2. Prueba de escala de grises: sin color, ¿se entiende la jerarquía?
3. Capturas a 360, 768 y 1280 px.
4. Accesibilidad automática sin violaciones, contraste AA, teclado completo, movimiento reducido respetado.
5. Revisión humana contra este brief.

## Datos reales del dominio
_(Las maquetas solo pueden usar las entidades y campos reales del producto. Una tabla por pantalla: fuente y campos. Nada inventado.)_
