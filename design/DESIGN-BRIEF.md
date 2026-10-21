# DESIGN-BRIEF — portfolio

Única fuente de verdad del diseño. Ninguna herramienta ni skill la sustituye: si discrepan, gana este archivo. Las secciones vacías se rellenan en la primera maqueta, antes de escribir la primera pantalla (ver «Proceso»).

- **Audiencia:** dos públicos a la vez. (1) Reclutadores y equipos técnicos de empresas: llegan desde una oferta o un perfil profesional, miran 1–3 minutos, sobre todo en portátil y a veces en móvil; buscan stack, evidencia y el CV. (2) Clientes freelance: llegan por recomendación o búsqueda, miran menos y deciden por confianza y claridad; buscan cómo contactar. Visitas únicas, casi nunca recurrentes. Idioma principal: español (una versión en inglés queda como etapa posterior).
- **Tres adjetivos:** técnico, moderno, cercano.
- **Personalidad y mundo del público:** el oficio de quien construye servicios que otros no ven, visto desde su herramienta: el editor de código. Lo «técnico» sale del marco de IDE (explorador, pestañas, números de línea, barra de estado con datos reales medidos) y de la información de oficio (respuestas, tiempos, errores contados). Lo «moderno» sale de la paleta clásica, el aire y el cuidado de los dos temas. Lo «cercano» sale del texto en primera persona y de la vida del conjunto (brillo suave, partículas de código, tecleo), nunca de adornos ajenos al oficio.
- **Dirección vigente:** **D3 «Editor»** (D2 refinada con más vida), elegida por el humano el 20 oct 2026 tras comparar seis direcciones (A, B, C, D, D2 y D3). Ver «Dirección D3» abajo.
- **Elemento firma:** el marco de editor completo, con el nombre en tipografía pixel que brilla y entra con un pulso de glitch (una vez, ≤ 0,3 s) y la barra de estado con datos reales. Las partículas, el brillo y las líneas son ambiente, no firma.

## Dirección D3 «Editor»
**Qué es.** Un portafolio con forma de IDE: barra de título con tres botones de ventana decorativos, barra de actividad, explorador con árbol de archivos, pestañas con punto de color, editor con números de línea a toda la altura, línea actual que sigue al scroll, minimapa y barra de estado. Un documento largo con scroll normal; cada sección es un «archivo» (`perfil.md`, `habilidades.ts`, `experiencia.json`, `esg-trazabilidad.md`, `contacto.sh`); el explorador y las pestañas son navegación con scrollspy.

**Por qué.** El género del IDE y su marco de editor encajan con «técnico»; la paleta clásica y los dos temas lo hacen «moderno»; y el humano la prefirió sobre las direcciones sobrias (A, B, C) por su **vida y su brillo sin parecer una copia**: tema, tipografía, partículas, textos y nombres de archivo propios, y ninguna pantalla de la referencia reproducida.

**Fuente de diseño versionada:** `design/direccion-d3/` (HTML, CSS, JS y fuentes con su licencia). Es la maqueta de referencia, no el sitio: la construcción real es otra etapa y debe reproducir esta dirección con sus pruebas. Las demás direcciones exploradas (A, B, C, D, D2) quedan solo en local.

**Proporciones medidas del marco (1280 px)** (adaptadas de las del género, ajustadas a 44 px táctiles y 15 px de texto):
| Pieza | Medida |
|---|---|
| Barra de título | 44 px; botones de ventana de 12 px (8 px en móvil) |
| Barra de actividad | 48 px (solo con JavaScript) |
| Explorador | 280 px; filas de 44 px |
| Pestañas | 44 px; filete superior de 4 px en la activa |
| Números de línea | 56 px, filas de 28 px, texto de 15 px, a toda la altura del documento |
| Minimapa | 96 px, solo ≥ 1100 px |
| Barra de estado | 32 px; texto de 15 px |
| Contenido | **48 px entre el borde de los números de línea y el inicio del contenido a 1280 px; ≈ 318 px a 1920 px** (bloque de 900 px centrado, relleno izquierdo de 48 px; la referencia medida: 48 y 330 px) |
| Lectura | columna estrecha de 560 px a la izquierda del bloque, con aire a la derecha; ventanas y tablas hasta 760 px |
| Ritmo vertical | 64 px arriba y abajo de cada archivo; 32 px entre bloques |
| Móvil (360 px) | título de 44 px + pestañas de 44 px = 90 px antes del contenido; el explorador es un menú; la barra de estado no corta texto |

**Composición.** El contenido va pegado a la izquierda del editor y la columna de lectura es estrecha: el espacio libre a la derecha es parte del diseño (y el lugar de las partículas). Los datos cortos son etiquetas tipo comentario (`// backend  Java 21 · Spring Boot`), no cajas; la «ficha» del perfil es el frontmatter del archivo; el contenido se agrupa, cuando conviene, en ventanas pequeñas con sus tres botones y el nombre del archivo.

**Perfil «expresivo».** Para este portafolio sustituye a la guía de «sobriedad y movimiento mínimo» del kit. Está permitido el brillo suave, las partículas de código, las líneas de escaneo, el tecleo, el cursor, el glitch único del nombre, las cifras que cuentan y el hover con intención, **siempre** bajo las reglas de efectos y de accesibilidad de abajo. Siguen siendo normas: la accesibilidad, el contraste AA calculado, el movimiento reducido y el presupuesto.

### Efectos: reglas
- **Decorativos:** todo efecto es `aria-hidden`, sin `pointer-events` y sin llevar información; el contenido se lee sin movimiento y sin JavaScript.
- **Solo `opacity` y `transform`** se animan en los efectos; nunca propiedades de layout. Excepciones acotadas, que no afectan al layout: el contador de las cifras (una propiedad personalizada entera con `@property`) y las transiciones de 120 ms de color, fondo, borde y sombra al pasar el puntero. No se secuestra el scroll.
- **Partículas:** 16–24 (en D3, 20: 14 símbolos de código `{ } < > / ; =` y 6 puntos), solo ≥ 1280 px, en la franja libre a la derecha del texto (nunca bajo una línea de lectura), ciclos de 20–35 s en pasos de 0,2 s alineados, pulso de 5–9 s. Pausadas con `visibilitychange`, apagadas con `prefers-reduced-motion`, ausentes en móvil. En claro, con menos opacidad. Nada de estrellas ni círculos pastel.
- **Líneas de escaneo:** baldosa SVG de 1 px cada 4 px, **opacidad ≤ 8 %** (3,5 % en claro), fijas, en el fondo del editor, en la columna de números y dentro de los botones primarios. Sin degradados. El texto del nombre lleva una capa propia de líneas algo más marcada (10 % en oscuro y 7 % en claro) que oscurece el texto, no el fondo: solo mejora el contraste.
- **Brillo:** `text-shadow` y `box-shadow` en nombre, títulos, botón primario, pestaña y línea activas, cursor, enfoque y barra de estado; alfa 0,38 en oscuro y 0,20 en claro. El texto de color de acento no lleva resplandor.
- **Sin parpadeo ni destellos (WCAG 2.3.1):** ninguna animación infinita con ciclo menor de 0,34 s; el cursor parpadea a 1 Hz.
- **Glitch del nombre:** ≤ 0,3 s, una sola vez, con dos copias desplazadas 3 px; apagado con movimiento reducido.
- **Contraste AA contra el peor caso:** el texto se calcula sobre el fondo más claro o más oscuro que pueda quedar bajo él, es decir, con la alfa entera del resplandor y con las líneas de escaneo al máximo de la alfa del tema.
- **Movimiento reducido:** apaga partículas, glitch, cursor parpadeante, tecleo, entrada escalonada y cifras que cuentan (se muestra el valor final); las líneas quedan fijas. Se prueba.

### Presupuesto
- **Portada ≤ 150 KB** (D3: ≈ 124 KB) y **JS ≤ 15 KB** (D3: 8,1 KB), cero dependencias, máximo cuatro archivos de fuente.
- **CPU en reposo: objetivo ≈ 2 %.** D3 midió ≈ 4,1 % de un núcleo (renderizador + GPU; ≈ +1,6 % sobre D2 sin efectos; ≈ 0,5 % con movimiento reducido) **con rasterizado por software, en un navegador sin interfaz y sin medir con GPU real**. La cifra definitiva se mide con el sitio real.
- Carga y LCP medidos en local: ≈ 88 ms y 100–170 ms (no sustituye a Lighthouse).

### Requisitos para el sitio real
1. **Interruptor «Efectos»** visible en la barra de estado (activa o apaga partículas, brillo y glitch), además de respetar `prefers-reduced-motion`; su estado se recuerda.
2. Considerar **bajar las partículas de 20 a ≈ 12** si el consumo molesta en equipos reales.
3. **Pruebas pendientes:** lector de pantalla real, Safari, Firefox (`light-dark()` y `@property` exigen navegadores de 2024 en adelante), dispositivo táctil real, Lighthouse y rendimiento con GPU real y en gama baja.
4. Reproducir en el sitio real las comprobaciones automáticas de la maqueta (contraste contra el peor caso, orden y solapes, partículas, glitch, movimiento reducido, sin JS). Las cifras de este brief (contraste del peor caso, CPU, KB de la portada y del JS) salen de pruebas locales con Playwright que **no están versionadas**; en el sitio real se convierten en pruebas del proyecto.
5. La maqueta tiene enlaces de demostración que se apuntan a sí mismos (**Ver CV**, las entradas de demo y el selector **EN**): en el sitio real apuntan al CV, a la demo, al sistema real y a la versión en inglés. Los enlaces de texto dentro de un párrafo quedan fuera de la exigencia de 44 px (como permite WCAG); los botones, etiquetas y la navegación la cumplen.

### Defectos de D2 ya corregidos en D3
- La etiqueta del botón de tema era siempre la misma y usaba `aria-pressed`: ahora dice la acción («Tema claro» en oscuro, «Tema oscuro» en claro) y no usa `aria-pressed`.
- La línea actual del modo claro era un amarillo fuerte (`#fff8c5`): ahora es `#fffceb`.
- El contenido quedaba demasiado a la derecha (120 px a 1280 y 440 px a 1920 de los números de línea): ahora 48 y ≈ 318 px.

## Contenido y alcance del sitio
Portafolio estático de carga instantánea, sin backend propio. Contenido: perfil y habilidades, y **un solo proyecto destacado** (esg-trazabilidad) como caso de estudio con problema, arquitectura, decisiones, resultados y capturas. El proyecto ofrece dos entradas: **demo instantánea** con datos simulados (estática) y **sistema real**, con aviso de que puede tardar hasta un minuto en despertar y con su cuenta de demostración de un clic. Dos llamadas a la acción siempre visibles: **Contactar** (cliente) y **Ver CV / Ver proyecto** (reclutador). Gasto cero: sin dominio propio ni planes de pago.

## Identidad y logo
Hoy no hay logo oficial, así que no hay colores muestreados: la marca es **tipográfica**.
- **Marca:** el nombre en Pixelify Sans 700 más un monograma de dos letras, **AS**, en la misma fuente, centrado en la barra de título (la «A» en el color de acción). Para el favicon y los íconos se dibuja como SVG propio. Nunca como imagen decorativa.
- **Colores de marca:** el color de acción de la dirección elegida (`#61afef` en oscuro, `#0969da` en claro) y la tinta.
- Cuando exista un logo real, sustituye a esta propuesta y se muestrea el color con una herramienta, no a ojo.

Reglas de uso, ya fijadas:
- Versiones: color, monocromo y símbolo solo. No se estira, no se recolorea, no se le añade sombra ni degradado.
- Espacio libre mínimo alrededor del símbolo y tamaño mínimo de 24 px de lado.
- `alt` informativo cuando el logo es la única identificación; `alt=""` si va junto al nombre en texto o es decorativo.
- Lugares obligatorios: barra superior, acceso/login, pantalla de carga, documentos exportados (en vectores si la librería no soporta SVG), favicon e íconos de la app, página 404 y pie.

## Paleta (contraste AA calculado; tokens en `design/direccion-d3/d3.css`)
Dos temas con el mismo diseño, hechos con `light-dark()`: **oscuro** con fondos de azul grafito propios y acentos de «One Dark» (Atom / One Dark Pro, licencia **MIT**), y **claro** con «GitHub Light» (GitHub Primer primitives, licencia **MIT**). Solo se toman valores de color; los comentarios y el texto secundario se ajustaron para pasar AA.

| Token | Oscuro | Claro | Uso | Contraste (oscuro / claro) |
|---|---|---|---|---|
| `--bg` | `#1a1e26` | `#ffffff` | fondo del editor | — |
| `--bg-chrome` | `#12151b` | `#f6f8fa` | barra de título, actividad, pestañas, cabecera de ventanas | — |
| `--bg-side` / `--bg-gutter` | `#161920` / `#14171d` | `#f6f8fa` | explorador y columna de números | — |
| `--bg-line` | `#222733` | `#fffceb` | línea actual | — |
| `--sel` / `--hover` | `#2a3140` / `#20252f` | `#ddf4ff` / `#eaeef2` | selección y hover | — |
| `--ink` | `#abb2bf` | `#1f2328` | texto | 7.8 / 15.8 |
| `--ink-strong` | `#d7dae0` | `#1f2328` | títulos y énfasis | 11.9 / 15.8 |
| `--ink-soft` | `#9aa3b2` | `#57606a` | texto secundario | 6.6 / 6.4 |
| `--ln` | `#7d8595` | `#59636e` | números de línea (sobre su columna) | 4.8 / 5.7 |
| `--line-ctl` | `#8b93a4` | `#6e7781` | bordes de controles | 5.4 / 4.55 |
| `--line` | `#2b313c` | `#d0d7de` | filetes decorativos (fuera de la exigencia AA) | — |
| `--accent` | `#61afef` | `#0969da` | acción, enlaces, barra de estado | 7.1 / 5.2 |
| `--accent-ink` | `#12151b` | `#ffffff` | texto sobre el acento | 7.7 / 5.2 |
| `--c-cm` | `#8b93a4` | `#59636e` | comentarios | 5.4 / 6.1 |
| `--c-kw` | `#c678dd` | `#cf222e` | palabras reservadas | 5.7 / 5.4 |
| `--c-key` | `#e06c75` | `#0550ae` | claves | 5.2 / 7.6 |
| `--c-str` | `#98c379` | `#116329` | valores | 8.3 / 7.4 |
| `--c-num` | `#d19a66` | `#953800` | números | 6.8 / 7.4 |
| `--c-type` | `#e5c07b` | `#8250df` | tipos | 9.7 / 5.1 |
| `--c-fn` | `#61afef` | `#0969da` | funciones y títulos de entrada | 7.1 / 5.2 |
| `--c-const` | `#56b6c2` | `#0550ae` | constantes | 7.1 / 7.6 |
| `--c-todo` | `#e5c07b` | `#8f5f00` | «[por confirmar]» (con subrayado punteado) | 9.7 / 5.1 |
| `--glow-c` | `rgba(97,175,239,.38)` | `rgba(9,105,218,.20)` | brillo | peor caso: 5.6 / 11.9 sobre el nombre |

Botones de ventana (decorativos): `#ff5f57`, `#febc2e` y `#28c840`. En claro, el peor caso con las líneas de escaneo al 3,5 %: ≥ 4.67:1 en todo el texto. Cada color nuevo se añade primero como token y aquí, con su contraste calculado. Los colores de estado no se usan como colores de interfaz y el color nunca es el único canal (los pendientes llevan además corchetes y subrayado).

## Tipografía
Tres voces, **cuatro archivos woff2** (≈ 55 KB), todas con licencia **SIL Open Font License 1.1**; los archivos de licencia van junto a las fuentes en `design/direccion-d3/fonts/`:
- **Pixelify Sans 700** (© 2021 The Pixelify Sans Project Authors): solo el nombre y los títulos de sección. Cobertura latina verificada con los acentos y «¿» del contenido.
- **Geist Mono 400 y 700**: código, etiquetas, metadatos, cifras y énfasis (negrita real, nunca sintética).
- **Instrument Sans 400**: texto de lectura.

Reglas:
- Fuentes autoalojadas en woff2, subconjunto latino (cubre el español), `font-display: swap`, **máximo cuatro archivos**.
- Respaldo local con `size-adjust`, `ascent-override` y `descent-override`; los valores se miden con el sitio real, no a ojo.
- Cifras tabulares solo donde hay cifras (tablas, resultados, tiempos): en algunas familias `tabular-nums` ensancha la puntuación del texto corrido.
- Nunca Inter, Roboto, Arial ni la fuente del sistema como voz.

Escala: texto de lectura de 24 px en el párrafo principal y de 18 px en el resto, código de 16 px, piso de 15 px (nada de 10 a 12 px); nombre de 40 a 60 px y títulos de sección de 28 a 36 px; las cifras (44–64 px) son protagonistas.

## Forma, iconos y movimiento
Perfil **expresivo** (ver «Dirección D3»). Esquinas de 8 px en ventanas y botones y de 22 px en las etiquetas de perfil; filetes de 1 px (`--hair`) y de 2 px (`--rule`); brillo suave y texturas de líneas solo bajo las reglas de efectos. Ritmo de espaciado de 4 px. Un único juego propio de iconos SVG de trazo (explorador, búsqueda, control de versiones, ajustes, tema, carpeta, archivo, error, enlace externo), siempre con texto o nombre accesible; los iconos de color por tipo de archivo son decorativos. Sin emojis ni logotipos de marcas.

Reglas ya fijadas:
- Movimiento solo en CSS y solo con `opacity` y `transform`: entrada escalonada (≤ 1,2 s en total; el título y el párrafo principal no se animan, para no retrasar el LCP), tecleo con `steps()`, cursor, cifras que cuentan hacia arriba, hover con intención, partículas y glitch único del nombre. Sin rebotes ni elásticos y sin transiciones de propiedades de layout. `prefers-reduced-motion` respetado y probado.
- Pantalla de carga con la marca, de 1,2 s como máximo y estática con movimiento reducido.

## Reglas visuales mínimas (valen para cualquier proyecto con interfaz)
- **Aprovechar el ancho:** a 1280 y 1920 px, un layout con propósito. En este portafolio es el marco de editor completo (actividad, explorador, pestañas, números, minimapa y barra de estado) con una columna de lectura estrecha pegada a la izquierda del bloque de contenido; el espacio libre a la derecha es intencional (lo ocupan las partículas) y nunca una columna sola flotando sobre un fondo vacío. En 360 px se apila con el dato clave en la primera pantalla.
- **Tipografía:** texto base de 18 px, piso de 15 px, saltos de 3x o más entre título y cuerpo.
- **Accesibilidad:** áreas táctiles de 44 px como mínimo, contraste AA calculado (no a ojo), foco visible y el color nunca como único canal.
- **Un solo foco por pantalla.** Sin tarjetas idénticas en rejilla, sin tarjetas anidadas, sin degradados decorativos y sin fuentes sobreusadas (Inter, Roboto, Arial).
- **Un elemento firma** consistente (el marco de editor con el nombre pixel), nunca repetido en todo a la vez; el brillo, las partículas y las líneas son ambiente y se rigen por las reglas de efectos.
- **Datos de demostración** de 10 filas o más, no dos, y marcados como demostración.

## Contenido
- Español, registro cercano y directo, primera persona. Decisión de estilo (no norma local): fecha `20 oct 2026`, miles con espacio fino (`1 240`), decimales con coma.
- **No se publican** nombres de empleadores o clientes, correos ni teléfonos mientras no estén confirmados: se escribe «[por confirmar]». Todo texto o cifra de ejemplo se marca como demostración.
- Estados con una acción concreta: el sistema real dice cuánto puede tardar en despertar y ofrece la demo instantánea mientras tanto.
- Nunca «Lorem ipsum», «John Doe» ni saludos genéricos.

## Prohibido
Degradados morado/azul y texto con degradado (las texturas de líneas se hacen con SVG, no con degradados). Glassmorphism y `backdrop-blur`. Cuadrículas de tarjetas idénticas con icono + título + frase. Paneles de 3-4 KPI con iconos en la portada. Esquinas muy redondeadas con sombra grande en todo. Héroe con formas flotantes (las partículas de código viven en la franja libre, nunca detrás del texto ni como adorno del héroe). Estrellas, círculos pastel, ilustraciones o mascotas. Emojis como iconografía. Numeración decorativa 01/02/03. Avatares de relleno y gráficos inventados. Modo oscuro neón (el acento sobre grafito y el brillo suave con contraste calculado no lo son). Centrar todo. Dejar el tema por defecto de una librería de componentes. Reproducir pantallas, textos, nombres de archivo, temas o paletas de la referencia estudiada.

## Proceso de diseño (desde el primer módulo con interfaz)
Antes de escribir la primera pantalla:
1. **Brief completo:** audiencia, tres adjetivos, mundo del público, las reglas visuales mínimas de arriba, la identidad desde el logo, tokens, movimiento y accesibilidad.
2. **Exploración de tres direcciones** maquetadas en HTML y CSS estático, con datos de ejemplo marcados como demostración, distintas entre sí (una conservadora, una editorial y una propia), en las pantallas clave y en 360, 1280 y 1920 px, con hoja comparativa, costo S/M/L, tokens y dependencias nuevas, y una recomendación razonada. La ambición se decide aquí, no después.
3. **La elección de la dirección es del humano** y es una parada legítima. Se elige mirando las capturas.
4. **El brief se actualiza** con la dirección elegida y cada pantalla se implementa con la skill `revision-visual`. Antes de pedir cada merge se responde: «¿se ve plano o genérico?». Si sí, se rehace.
5. **Auditoría de solo lectura** al cerrar un módulo o un hito (capturas en cuatro anchos con estados vacío y de error, detección manual de patrones genéricos, crítica aislada de un subagente, lista P0/P1/P2 con evidencia). Mide defectos, no ambición.
6. **Un rediseño** solo si lo pide el humano o la auditoría lo justifica; vuelve al paso 2.

### Referencias sin copiar
Las páginas admiradas se guardan solo como material de estudio en un directorio local (`design/refs/`) y de ellas se extraen **decisiones** (familia y escala tipográfica, relación de contraste, ritmo de espaciado, forma, densidad, tratamiento de estados), no píxeles. Se anota aquí la decisión y su razón, no la fuente. No se copian marcas, logotipos, ilustraciones, textos ni composiciones protegidas.

## Revisión anti-genérico (antes de dar una pantalla por buena)
1. Prueba de intercambio: con solo cambiar el logo, ¿serviría para otro sistema? Si sí, falta carácter.
2. Prueba de escala de grises: sin color, ¿se entiende la jerarquía?
3. Capturas a 360, 768 y 1280 px.
4. Accesibilidad automática sin violaciones, contraste AA, teclado completo, movimiento reducido respetado.
5. Revisión humana contra este brief.

## Datos reales del dominio
| Pantalla | Fuente | Campos |
|---|---|---|
| Portada | datos públicos del autor | nombre: Angel Sebastian Saenz Velarde; rol: Backend Developer (desarrollador backend); ciudad: Lima, Perú; stack: Java 21, Spring Boot, Python, Odoo, AWS Lambda, GCP, Azure DevOps |
| Perfiles | confirmados y publicables por el humano | LinkedIn `https://www.linkedin.com/in/saenzdev/` y GitHub `https://github.com/Reedsy2407`, como etiquetas junto a los botones, con `rel="noopener noreferrer"` y un nombre accesible que avisa de la pestaña nueva (ya están en `design/direccion-d3/`) |
| Experiencia, contacto, CV y empleadores | pendiente de confirmar | correo, CV y nombres de empleadores o clientes: todo «[por confirmar]» hasta que el humano lo dé |
| Caso de estudio | esg-trazabilidad | problema, arquitectura, decisiones, resultados y capturas: **pendientes de confirmar**; las maquetas usan texto y cifras de demostración marcados como tales (lotes, proveedores, materiales, kg CO₂e, estado de auditoría) |

Las cifras y la tabla de lotes de las maquetas son de demostración y se sustituyen por las reales antes de publicar.

### Decisiones sacadas de la referencia de estudio
Se estudió un portafolio con estética de editor de código (solo decisiones de maquetación y de recursos del género, sin copiar nada). **Se tomó:** el marco de ventana con botones, la barra de actividad, las pestañas con punto de color, los números de línea a toda la altura con textura, el contenido pegado a 48 px de los números a 1280 px y en bloque centrado a 1920 px, las etiquetas tipo comentario, las ventanas pequeñas con botones, la barra de estado con datos de IDE, el selector de idioma compacto con el activo marcado (también por forma) y el interruptor de tema. **Se rechazó:** su texto secundario de bajo contraste y menor de 15 px, los objetivos táctiles de 20–24 px, el scroll interno, los datos de estado fijos y con emoji, el movimiento que no respeta `prefers-reduced-motion`, las estrellas y círculos pastel, la ilustración, la fuente de píxeles y la paleta rosa, el nombre de su tema, sus textos y sus nombres de archivo.

### Accesibilidad y movimiento (concreción para este sitio)
- Contraste AA calculado con script y anotado junto a cada token de la dirección elegida; filete decorativo fuera de esa exigencia, bordes de controles ≥ 4.5:1 (más estricto que el 3:1 de WCAG, a propósito).
- Foco visible de 3 px, área táctil mínima de 44 px en enlaces de navegación y botones, tabla de datos en región con foco de teclado y nombre, ancho de 360 px sin desborde horizontal de página.
- Cifras que cuentan: el valor real vive en texto accesible y el contador visual es `aria-hidden`; con movimiento reducido se muestra el valor final.
- Todo lo decorativo del marco (botones de ventana, números de línea, minimapa, línea actual, partículas) es `aria-hidden`, no interactivo y los números de línea no se pueden seleccionar ni copiar. Los números de línea son legibles (AA) aunque sean decorativos.
- Semántica real: landmarks (`header`, `nav`, `main`, `footer`), un solo `h1`, el explorador como `nav` con `details` nativos, las pestañas como enlaces (no `role="tab"`), la paleta de comandos como `dialog` nativo (`Ctrl+K` y el icono de búsqueda) y ningún rol ARIA inventado. Las funciones que necesitan JavaScript (actividad, paleta, tema, scrollspy, datos de la barra de estado) son mejora: sin él todo el contenido se lee.
- La barra de estado muestra solo datos reales: rama, errores contados de verdad (`error` en captura, rechazos de promesa y fallos de fuentes), lenguaje del archivo visible, codificación leída del documento, línea y columna según el scroll y el puntero, y carga y LCP medidos con la API de rendimiento.
- Entrada escalonada ≤ 1,2 s en total, solo opacidad y `transform`; `prefers-reduced-motion` la reduce a instantánea.
