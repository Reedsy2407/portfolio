# Portafolio — Angel Saenz

Portafolio estático de un desarrollador backend (Java, Spring Boot, Python, Odoo y nube). Es una sola página con perfil, habilidades, experiencia en línea de tiempo y proyectos: el destacado, **esg-trazabilidad** (con enlaces al sistema real, al código y a la documentación), y dos proyectos propios. Está en español y en inglés.

El diseño imita un editor de código (explorador, pestañas, números de línea, minimapa y barra de estado). El contenido se lee entero sin JavaScript; el JavaScript solo añade mejoras (tema, navegación, copiar el correo y datos de la barra de estado). No usa dependencias en producción.

## Verlo en local

No hace falta instalar nada: son archivos estáticos. Sirve la carpeta con cualquier servidor de archivos estáticos y abre `index.html`, por ejemplo:

```
python -m http.server 8080
```

y entra en `http://localhost:8080/`. También puedes abrir `index.html` directamente en el navegador.

Estructura:

| Ruta | Contenido |
|---|---|
| `index.html` | portafolio (español) |
| `en/index.html` | el portafolio en inglés |
| `404.html` | página de error (bilingüe) |
| `assets/` | CSS, JS, fuentes y favicon |
| `scripts/build.mjs` | genera las cinco páginas HTML desde el contenido |
| `tests/` | pruebas automáticas |
| `design/` | brief de diseño y maqueta de referencia (`design/DESIGN-BRIEF.md`) |

El CV se enlaza solo si existe `assets/cv/CV_Angel_Saenz.pdf` al generar el sitio (con su tamaño en el texto); si no existe, las páginas muestran «[CV por confirmar]» sin enlace. Tras añadir el PDF, ejecuta `node scripts/build.mjs`.

Las páginas HTML se generan: edita el contenido en `scripts/build.mjs` y ejecuta `node scripts/build.mjs`. Los estilos y el script están en `assets/css/site.css` y `assets/js/site.js`.

## Pruebas

Las pruebas usan un navegador automatizado ([`playwright-core`](https://playwright.dev), solo para desarrollo) contra el sitio servido en un puerto local libre. Una vez:

```
npm install
```

Un comando corre todas:

```
node tests/run.mjs
```

(o `npm test`). Para correr un grupo, pasa parte de su nombre: `node tests/run.mjs contraste`. Si ya tienes `playwright-core` instalado en otra carpeta, indica su ruta con la variable `PLAYWRIGHT_CORE`; si el navegador no está en la caché de Playwright, con `CHROMIUM_PATH`.

Qué comprueban:

- **peso**: portada ≤ 150 KB, JS ≤ 15 KB, sin peticiones a otros orígenes, máximo cuatro fuentes;
- **contraste**: AA en todo el texto, de ambos temas, contra el peor caso (resplandor entero y líneas de escaneo a su alfa máxima);
- **maquetación**: sin desborde horizontal a 360 px, objetivos de 44 px, foco visible de 3 px, texto de 15 px o más y números de línea a toda la altura;
- **movimiento**: `prefers-reduced-motion` (apaga partículas, glitch, tecleo, entrada y cursor parpadeante), partículas, glitch único, líneas ≤ 8 %, solo `opacity` y `transform`, botón de tema;
- **contenido**: legible sin JavaScript, enlaces externos con `rel="noopener noreferrer"`, aviso previo al sistema real, anclas válidas, reglas de estilo del brief;
- **pulido**: copiar el correo (con y sin JavaScript), iconos `aria-hidden`, secciones quitadas, disponibilidad única, enlaces de proyecto y legibilidad de la línea de tiempo (interlineado, ancho de línea, aire entre puestos);
- **datos confirmados**: el CV nunca queda como enlace roto, ningún número parece un teléfono, el único correo es el confirmado y no se nombra a los clientes finales;
- **CPU en reposo**: se mide y se informa (objetivo ≈ 2 % de un núcleo). Se mide en un navegador sin interfaz con rasterizado por software, así que no sustituye a una medición con GPU real.

Para generar capturas locales (360, 1280 y 1920 px, tema oscuro y claro) en `design/refs/sitio/`: `node tests/capturas.mjs`.

## Efectos

No hay interruptor: las partículas, el glitch del nombre, el tecleo, la entrada escalonada y el cursor parpadeante se apagan solos con `prefers-reduced-motion`.

## Licencias

Las fuentes se sirven desde `assets/fonts/`, con su licencia al lado (SIL Open Font License 1.1):

- Pixelify Sans 700 — © 2021 The Pixelify Sans Project Authors
- Geist Mono 400 y 700 — © 2024 The Geist Project Authors
- Instrument Sans 400 — © 2022 The Instrument Sans Project Authors

Los iconos de LinkedIn, GitHub, correo y CV son glifos simplificados dibujados para este sitio (sin licencia de terceros).

Paletas (solo se toman valores de color): tema oscuro con acentos de «One Dark» (Atom / One Dark Pro, licencia MIT) y tema claro con «GitHub Light» (Primer primitives, licencia MIT).

El proyecto esg-trazabilidad es académico, sin validez legal; sus patrones se tomaron del concepto de un sistema profesional, sin datos ni código de ninguna empresa.
