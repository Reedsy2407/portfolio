# FRONTEND — guía del front de portfolio

Cómo se construye y se comprueba el front de este proyecto con la biblioteca del kit. La fuente de verdad del diseño sigue siendo `design/DESIGN-BRIEF.md`; esta guía explica las herramientas que lo hacen cumplir. Skills relacionadas: `explorar-direcciones`, `estudiar-referencia`, `elegir-tipografia-paleta`, `pulir-front` y `revision-visual`.

## 1. Qué hay
| Pieza | Dónde | Para qué |
|---|---|---|
| Tokens | `design/styles.css` | Color, tipografía, espaciado, forma y movimiento. El CSS de los componentes usa solo estos tokens. |
| Presets de expresión | `design/presets/sobrio.css`, `expresivo.css` | Dos conjuntos de tokens intercambiables (escala, radios, ritmo, brillos, texturas, duraciones). Se cargan **después** de `styles.css`. |
| Patrones | `design/patrones/` | Chip copiable, botón con textura de líneas, línea de tiempo, tarjeta de proyecto, etiquetas, entrada escalonada y partículas decorativas: se copian y adaptan. |
| Pruebas de front | `tests/front/` | Contraste, maquetación, movimiento, peso, contenido, datos sensibles, CSP, carpeta de publicación y CPU. Se configuran en `tests/front/front.config.json`. |
| Herramientas | `tests/front/herramientas/` | Capturas (360, 768, 1280 y 1920 px, oscuro y claro), hoja comparativa y video corto, siempre hacia `design/refs/`. |

Las pruebas necesitan `playwright-core` como `devDependency` del proyecto (versión fijada con `package-lock.json`, `npm ci`) y el Chrome ya instalado: define `CHROMIUM_PATH` con su ruta. **El kit no instala nada ni descarga navegadores.** Sin `playwright-core` el comando lo dice y sale con error.

```
node tests/front/run.mjs                       # todo
node tests/front/run.mjs --solo contraste,layout
node tests/front/run.mjs --url https://…       # contra un sitio ya publicado, no una carpeta
```

## 2. Sobrio o expresivo
El perfil es obligatorio en el brief y es decisión del humano. Punto de partida: el tipo A (portafolio) parte de **expresivo**; el tipo B (sistema con servicios) parte de **sobrio**.
- **Sobrio:** se usa cuando la persona viene a hacer una tarea o a leer datos (paneles, formularios, listas, documentación). Movimiento mínimo, sin brillos ni texturas, densidad de información. La personalidad sale de la tipografía, la jerarquía y el contenido.
- **Expresivo:** se usa cuando el sitio *es* la presentación (portafolio, sitio de un producto o de un oficio) y la primera impresión importa. Brillos suaves, líneas finas, una entrada orquestada y, a lo sumo, un elemento decorativo vivo, **todo dentro del presupuesto de efectos**.
- Cambiar de perfil es cambiar la hoja del preset que se carga (`<link>` o `@import` tras `styles.css`); los componentes no se tocan porque ambos definen los mismos tokens.

## 3. Límites de efectos
Valen para el perfil expresivo y no se negocian por pantalla:
- Brillos, partículas y líneas son decorativos: `aria-hidden`, sin eventos, solo `opacity` y `transform`, textura con alfa ≤ 8 %, nada que parpadee (ciclos infinitos ≥ 340 ms; WCAG 2.3.1).
- Apagados con `prefers-reduced-motion`, ocultos en pantallas estrechas si estorban y pausados con la pestaña oculta.
- Contraste AA calculado contra el **peor caso** (resplandor y capas de textura sobre el texto).
- **No se exige un interruptor visible de efectos**: el humano lo descartó; no se propone por defecto.
- Rendimiento: CPU en reposo como mediana de varias muestras (objetivo ≈ 2 %), portada ≤ 150 KB y JS ≤ 15 KB. Lo no medido (GPU real, equipo de gama baja) se declara.

## 4. Usar una referencia sin copiarla
Con la skill `estudiar-referencia`: se estudia en Chrome (oscuro y claro, escritorio y móvil), se **mide**, y se escriben dos listas. Se toma: género, estructura, ritmo, escala, efectos. No se toma: textos, ilustraciones, mascota, tema y marca, fuente, logo, paleta exacta, nombres de archivo. Nada de esto se versiona: vive en `design/refs/`.

## 5. Cambiar de género sin tocar las pruebas
Un marco concreto (por ejemplo, el de un editor de código) es **una** dirección posible, no la plantilla del kit. Las pruebas no conocen nombres de clase: miden estilos calculados y leen `tests/front/front.config.json`. Para otro género:
1. Cambia el HTML y el CSS de la dirección, sobre los mismos tokens y un preset.
2. Actualiza solo la configuración: `paginas` (rutas y tipo), `selectores.objetivos` (qué cuenta como objetivo táctil: botones, enlaces de navegación, controles propios), `selectores.decorativos` (lo que es decoración y debe ser `aria-hidden`), `paginas[].clics` (acciones previas, como abrir un menú móvil) y `contenido.textoEsperado`.
3. Vuelve a correr `node tests/front/run.mjs`. Si una prueba falla, es un defecto del diseño o una configuración desactualizada, nunca una razón para quitar la prueba.

## 6. Un framework, o el tipo B
Las pruebas no dependen del framework: reciben una carpeta servida o una URL.
- Con un framework que compila a archivos estáticos, apunta `origen.carpeta` a su salida (`dist`, `build`…).
- Con una aplicación que se sirve sola (servidor de desarrollo o despliegue de prueba), usa `origen.url` o `--url`. Es la forma de uso del tipo B: reutiliza los tokens (`styles.css` + preset `sobrio`) y las mismas pruebas contra una URL, con `paginas` apuntando a las pantallas clave.
- Las pruebas de `dist` y de CSP solo tienen sentido si el proyecto publica una carpeta o define cabeceras; se pueden dejar fuera con `--solo`.

## 7. Qué comprueba cada prueba
| Id | Comprueba | Configuración |
|---|---|---|
| `contraste` | Cada texto visible ≥ 4,5:1 (3:1 si es grande), contra el peor caso | `umbrales.contrasteTexto`, `contrasteTextoGrande`, `texturaAlfaMax` |
| `layout` | Sin desborde horizontal; objetivos de 44 px; foco de 3 px; texto ≥ 15 px | `umbrales.anchosSinDesborde`, `objetivoPx`, `focoPx`, `textoMinimoPx`, `textoBasePx`; `selectores.*` |
| `movimiento` | Solo `opacity` y `transform`; nada parpadea; texturas ≤ 8 %; decorativos `aria-hidden`; movimiento reducido | `umbrales.cicloMinimoMs`, `texturaAlfaMax`; `selectores.decorativos` |
| `peso` | Portada, JS, otros orígenes, máximo de fuentes y su licencia anotada | `umbrales.pesoPortadaKB`, `jsKB`, `fuentesMax`; `fuentes.licencias` |
| `contenido` | Legible sin JavaScript; `rel` de enlaces; un h1; `lang`; `alt`; enlaces sin roturas; sin emoji | `contenido.*` |
| `datos` | Teléfonos, nombres prohibidos y patrones propios en texto, atributos y código | `datosSensibles.*` |
| `csp` | Hay CSP, sin violaciones, y bloquea un script inyectado | (cabeceras de la carpeta o de la URL) |
| `dist` | Solo la lista permitida en la carpeta de publicación | `dist.*` |
| `cpu` | CPU en reposo, mediana de varias muestras | `umbrales.cpu*`, `pruebas.cpu` |

## 8. Capturas, hoja y video
```
node tests/front/herramientas/capturas.mjs --etiqueta d1     # design/refs/d1/
node tests/front/herramientas/hoja.mjs --carpetas d1,d2,d3   # design/refs/hoja.html
node tests/front/herramientas/video.mjs --etiqueta d1        # design/refs/d1/… .webm
```
Esperan por condición (fuentes listas y animaciones terminadas), no por tiempo. Se niegan a escribir fuera de `design/refs/` o si esa carpeta no está en `.gitignore`.

## 9. Límites conocidos de las pruebas
Las pruebas son una red, no una garantía: declara en el informe lo que no cubren.
- `movimiento` mide animaciones CSS (`@keyframes`), también las finitas que terminan al cargar, pero no transiciones (`transition`): revisa a mano que el hover no anime propiedades de layout.
- `contraste` mezcla el fondo de color, el primer resplandor de `text-shadow` y el peor caso de una imagen de fondo; no calcula degradados, varios resplandores superpuestos ni fotografías detrás del texto.
- `contenido` detecta secciones colapsadas o ocultas sin JavaScript, pero no contenido que nace con `opacity: 0` y solo un script revela.
- `datos` trata las fechas ISO como inocuas; otras cifras largas pueden dar falsos positivos y se declaran en `datosSensibles.ignorar`.
- `peso` usa el `Content-Length` de cada respuesta: contra un servidor con compresión mide bytes transferidos, no descomprimidos.
- El servidor de pruebas sirve la carpeta tal cual (no resuelve `/ruta` hacia `/ruta/index.html` y expone `_headers`): la prueba final de despliegue es el humo contra la URL publicada.
- No miden GPU real ni equipos de gama baja.
