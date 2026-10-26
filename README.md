# Un Viaje Astral — sitio web

Sitio estático de **Un Viaje Astral**, asociación civil sin fines de lucro de Entre Ríos dedicada al cultivo, acceso y acompañamiento en el uso medicinal del cannabis.

El proyecto fue reconstruido desde cero a partir del contenido del sitio original, con una estética “botánica cósmica”, navegación clara y foco en rendimiento y accesibilidad. No requiere compilación ni dependencias externas.

---

## 1. Stack y principios

- **HTML5 semántico**, sin frameworks ni librerías de UI.
- **CSS moderno** con custom properties, Grid, Flexbox, `clamp()`, `prefers-reduced-motion` y glassmorphism.
- **JavaScript vanilla** para el menú móvil, las animaciones al hacer scroll, los filtros del catálogo y el diálogo nativo de producto.
- **Sin build step**: los archivos se publican tal como están.
- **Sin cookies, analytics ni fuentes externas**: las tipografías están autoalojadas.
- **Mobile first** y layouts verificados en desktop, tablet y mobile.

---

## 2. Estructura

```text
/
├─ index.html                 Home: hero, club, pilares, productos, membresía, Villaguay, marco legal y contacto
├─ productos.html             Catálogo de 25 productos con filtros, búsqueda y detalle en <dialog>
├─ 404.html                   Página de error
├─ favicon.svg                Favicon vectorial
├─ robots.txt                 Reglas para crawlers y referencia al sitemap
├─ sitemap.xml                URLs indexables
├─ README.md
└─ assets/
   ├─ css/
   │  └─ styles.css           Sistema de diseño completo y responsive
   ├─ js/
   │  ├─ main.js              Header, progreso de scroll, menú móvil, reveals, nav activa y “volver arriba”
   │  └─ productos.js         Datos de productos, filtros, búsqueda, URL state y diálogo
   ├─ fonts/
   │  ├─ righteous-latin.woff2
   │  ├─ space-grotesk-latin.woff2
   │  ├─ righteous-OFL.txt
   │  └─ space-grotesk-OFL.txt
   └─ img/                    Imágenes WebP optimizadas y variantes responsive
```

### Imágenes principales

| Archivo | Uso |
| --- | --- |
| `hero.webp` / `hero-560.webp` | Ilustración principal del home |
| `cultivo-820.webp` / `cultivo-1400.webp` | Sección “El Club” |
| `productos-banner.webp` / `productos-banner-440.webp` | Banner de productos |
| `pilar-01.webp` … `pilar-04.webp` | Pilares |
| `logo-header.webp`, `logo-footer.webp`, `pattern.webp`, `shape.webp` | Marca y decoración |
| `<slug>.webp` | Una imagen por producto (mismos slugs que el catálogo) |
| `og-cover.jpg`, `apple-touch-icon.png` | Redes sociales y pantalla de inicio |

Las variantes responsive se declaran con `srcset` y `sizes`. Las imágenes bajo el pliegue usan `loading="lazy"` y `decoding="async"`.

---

## 3. Cómo verlo en local

Desde la raíz del proyecto:

```bash
# Opción 1: Python
python -m http.server 4173

# Opción 2: Node
npx serve .
```

Abrí <http://localhost:4173/>.

> No abras los HTML con `file://`: el diálogo, los filtros y las rutas relativas funcionan mejor servidos por HTTP.

---

## 4. Deploy

Cualquier hosting estático sirve: Netlify, Vercel, Cloudflare Pages, GitHub Pages o un servidor Apache/Nginx.

Este repositorio publica automáticamente el sitio estático con GitHub Pages mediante `.github/workflows/deploy-pages.yml` cada vez que se suben cambios a `main`. La web queda en `https://cebomelgar-jpg.github.io/PAGINA-PRINCIPAL-UVA/`.

Para otros hostings:

1. Publicá el contenido de esta carpeta como raíz del sitio.
2. Configurá `404.html` como página de error personalizada.
3. Si el dominio final no es `https://unviajeastral.com/`, actualizá:
   - `rel="canonical"` y metadatos Open Graph/Twitter en los HTML;
   - la URL del `sitemap.xml`;
   - la línea `Sitemap:` de `robots.txt`.
4. Si el sitio se publica en un subdirectorio, las rutas relativas de `assets/` siguen funcionando; solo hay que ajustar canonical, sitemap y Open Graph a la URL absoluta correcta.

No se necesita redirección especial para `/productos`: el catálogo vive en `productos.html`. Si querés URLs limpias (`/productos`), configurá la regla correspondiente en el hosting.

---

## 5. Edición de contenido

### 5.1 Home

Los textos, secciones y enlaces están directamente en `index.html`. Cada sección tiene un `id` usado por la navegación:

- `#inicio`, `#elclub`, `#productos`, `#asociate`, `#villaguay`, `#marco`, `#contacto`.

### 5.2 Productos

Cada producto existe en **dos lugares** y ambos deben mantenerse sincronizados:

1. **Tarjeta estática** en `productos.html` (necesaria para SEO y para que el catálogo funcione sin JS):
   ```html
   <article class="product-card" id="producto-runtz" data-product="runtz" data-category="flores" data-search="...">
   ```
   - `id="producto-<slug>"`: destino de los deep links.
   - `data-product="<slug>"`: clave que conecta con `PRODUCTS`.
   - `data-category`: `flores`, `fitoderivados`, `cosmetica`, `comestibles` o `merchandising`.
   - `data-search`: palabras clave para la búsqueda (sin acentos; el filtro normaliza el texto).

2. **Registro en `PRODUCTS`** dentro de `assets/js/productos.js`:
   ```js
   "runtz": {
     name: "Runtz",
     category: "Flores y extractos",
     note: "Afrutado dulce · Efecto relajante",
     description: "Aromas y sabores: ...",
     specs: [["THC", "23–26%"], ...]
   }
   ```

La imagen se resuelve por convención: `assets/img/<slug>.webp`. Si agregás un producto, agregá también su imagen con ese nombre y actualizá los conteos visibles de los filtros (el JS los recalcula, pero conviene dejar los valores estáticos correctos para el caso sin JS).

Los deep links con `productos.html#producto-<slug>` abren automáticamente el detalle. Los filtros y la búsqueda se reflejan en la URL (`?categoria=...&q=...`).

### 5.3 Contacto y redes

El número de WhatsApp, Instagram y email aparecen en el header móvil, el home, el catálogo, el footer y la página 404. Si cambian, conviene buscar y reemplazar en los tres HTML:

- WhatsApp: `5493434151054`
- Instagram: `unviajeastral.ok`
- Email: `unviajeastralclub@gmail.com`

### 5.4 Año del footer

El año se actualiza automáticamente con `data-year`. El valor `2026` es solo el fallback sin JS.

---

## 6. Sistema de diseño

Los tokens están al inicio de `assets/css/styles.css`:

| Token | Valor | Uso |
| --- | --- | --- |
| `--ink` | `#191b30` | Texto y fondos oscuros |
| `--ink-deep` | `#0f1122` | Fondo profundo |
| `--purple` | `#5d3fcc` | Acento principal |
| `--green` | `#009468` | Acento botánico decorativo |
| `--green-text` | `#007a55` | Texto pequeño sobre fondos claros (contraste AA) |
| `--mint` | `#80ffa6` | CTA y brillos |
| `--paper` | `#fdf0ff` | Fondo claro |
| `--muted` | `#65677b` | Texto secundario |

Tipografías:

- **Righteous** para títulos y wordmark.
- **Space Grotesk** para texto, navegación y UI.

Para cambiar la paleta, editá las custom properties; para cambiar las fuentes, reemplazá los WOFF2 y las declaraciones `@font-face`.

---

## 7. Accesibilidad

- Skip link al contenido principal.
- HTML semántico, un solo `h1` por página y jerarquía de encabezados consistente.
- Foco visible en todos los controles.
- Menú móvil con `aria-expanded`, `inert` en el resto de la página y trampa de foco.
- Diálogo de producto con `<dialog>` nativo, cierre con `Escape`, clic en el backdrop y botón de cierre; el foco vuelve al disparador.
- Filtros con `aria-pressed`, resultados anunciados y estado vacío con acción de reset.
- Imágenes decorativas con `alt=""`; imágenes de contenido con alt descriptivo.
- Soporte de `prefers-reduced-motion` para desactivar transiciones y reveals.
- Contraste revisado sobre fondos claros y oscuros; los textos pequeños verdes usan `--green-text` para cumplir AA.

### Verificación

- **axe-core**: 0 violaciones en home, catálogo y 404, en desktop y mobile, con el menú móvil y el diálogo de producto abiertos.
- **Lighthouse**: accesibilidad 1.0, buenas prácticas 1.0 y SEO 1.0 en home y catálogo.
- **Responsive**: sin desborde horizontal en 1440, 1280, 1024, 834, 800, 390 y 320 px.
- **Movimiento reducido**: scroll instantáneo, todos los reveals visibles y sin transiciones.

---

## 8. Rendimiento

- Imágenes en WebP; hero de ~52 KB (desde ~864 KB del original).
- Variantes responsive para hero, cultivo y banner.
- `preload` de fuentes y hero; `fetchpriority="high"` en la imagen principal.
- Lazy loading bajo el pliegue.
- CSS y JS propios, sin dependencias de terceros.
- `scrollbar-gutter: stable` para evitar saltos de layout.
- `content-visibility` no se usa para no romper el scroll a anclas; el costo visual es bajo.

---

## 9. Navegadores

Probado en Chromium moderno. El sitio usa `<dialog>`, `inert`, `replaceChildren`, optional chaining y `matchMedia().addEventListener`.

- Chrome/Edge, Firefox y Safari recientes: soporte completo.
- Navegadores muy antiguos: el catálogo sigue siendo visible y navegable; el detalle puede abrirse como bloque sin backdrop. No se garantiza la trampa de foco del menú.

---

## 10. Notas de contenido y legales

- El contenido de productos, descripciones, genéticas y especificaciones proviene del sitio original de Un Viaje Astral.
- **Cuatro productos comparten la misma fotografía en el origen**: `gorra-con-visera`, `jabon-liquido`, `sales-de-bano` y `yerba-buena`. Se recomienda reemplazarlas por fotos reales de cada producto.
- Las afirmaciones terapéuticas y medicinales deben ser revisadas y validadas por profesionales de la salud y por el marco regulatorio vigente antes de publicar cambios.
- El sitio está pensado para personas mayores de 18 años y promueve el uso responsable.
- Las URLs legales enlazadas (Ley 27.350, Decreto 883/2020 y Resolución 782/2022) remiten a fuentes oficiales.

---

## 11. Créditos

- Contenido, marca e imágenes: Un Viaje Astral / Pango.
- Tipografías: Righteous (Brian J. Bonislawsky, Astigmatic) y Space Grotesk (Florian Karsten), bajo SIL Open Font License 1.1. Las licencias están en `assets/fonts/`.
- Iconografía: SVG inline propios.
- Optimización de imágenes: `sharp` (proceso externo, no incluido en el sitio publicado).

---

## 12. Checklist antes de publicar

- [ ] Reemplazar el dominio en canonical, Open Graph, sitemap y robots.
- [ ] Revisar textos legales y claims de salud.
- [ ] Reemplazar las cuatro fotos duplicadas.
- [ ] Verificar el número de WhatsApp y el email.
- [ ] Configurar `404.html` en el hosting.
- [ ] Probar el sitio en un dispositivo real y con teclado.
