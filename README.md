# CARVAN - Landing navegable

Sitio estático (HTML + CSS + JS, sin build). Referencia: `03-referencias/mockup-aprobado/CARVAN_mockup_final_aprobado.png`.

Servidor local: `python -m http.server 8766 --bind 127.0.0.1` (o cualquier servidor estático) y abrir <http://127.0.0.1:8766/>.

## Estructura

- `index.html` (incluye "Visitanos" con mapa y puntaje de Google antes del footer), `contacto.html`, `tienda.html` (próximamente tienda virtual + pedido por WhatsApp; se llega desde las 8 tarjetas de carnes y más sabores con `?c=categoría`, que adapta etiqueta, foto y mensaje de WhatsApp)
- `css/style.css` - hoja única (reemplaza a style + refinements + hero-edge).
- `js/main.js` - menú mobile, header transparente → sólido al scrollear, WhatsApp flotante pasado el hero, revelado de tarjetas.
- `assets/bordes/` - máscaras SVG de los bordes rasgados (hero desktop y mobile, oficio, cierre). Se generan con un script, son blancas sobre transparente y se usan como `mask-image`.
- `assets/marmolado1.svg` - marmolado oficial, sin modificar: rellena las bandas rasgadas.
- `assets/marmolado-espejo.svg` - derivado del oficial (el mismo dibujo más una copia espejada abajo) para que la banda del hero no tenga costura. El oficial no se tocó.

## Tipografía

| Rol | Familia | Uso |
| --- | --- | --- |
| Display | Cormorant 500/600 | H1, títulos de sección, títulos de tarjetas |
| Texto | Newsreader 400 (+ itálica) | Bajadas, párrafos, subtítulos de tarjetas, datos de footer y contacto |
| Interfaz | Hanken Grotesk 500/600 | Menú, botones, links, etiquetas, beneficios, links del footer |

Piso de tamaño: 14 px en menú, botones y links; 13 px en etiquetas; 12 px sólo en mobile para la etiqueta del hero y los valores. Comparativa de candidatas en `03-referencias/laminas/tipografia-ui-comparativa.png`.

## Color y ritmo

Fondo de página `--page` #E4DCC8 (papel tostado, con la textura de papel visible). `--ivory` #EDEBDD queda como marfil de marca para logos, sellos y marmolado. Secuencia de la portada: hero claro → carnes en carbón → más sabores claro → oficio (foto B/N + papel) → cierre bordó → footer carbón con `CARVAN_SELLO04-footer.svg` (copia de `sello_SELLO04.svg` que pasó el usuario). Todos los cambios de sección son bordes rasgados (`assets/bordes/`, `--tear`).

## Cómo está armado el hero

El papel es el fondo de la página y el header es todo papel. Debajo del header van dos capas con máscara: el marmolado (banda entre papel y foto) y la foto, ambas con borde superior rasgado. El borde entre foto y marmolado es un degradado (blur en `hero-photo-body.svg`) y debajo de la foto hay bordó liso (`hero-fondo-body.svg`). La máscara arranca en `--hh`, así el corte se mantiene aunque cambie el alto del hero. Las secciones oficio y cierre usan el mismo recurso (`--tear`).

## Movimiento

Efectos del catálogo TRAMA, adaptados a mano (sin el motor completo) en `js/main.js` y `css/style.css`. Todos respetan `prefers-reduced-motion`: la página aparece armada y quieta.

- `revelado-por-mascara-carvan`: en la portada el logo va inline (paths oficiales sin modificar) y cada letra sube desde abajo del recorte al cargar.
- `reveal-de-texto`: H1 y títulos de sección (`data-split`) suben palabra por palabra al entrar en pantalla, 90 ms entre palabras.
- `parallax-interno`: fotos del hero, oficio y cierre (`data-view`) se corren dentro del marco con `--pv`; la imagen mide 116% del marco y se desplaza 12% como máximo.
- Tarjetas de carnes y más sabores: cascada a 90 ms.

## SEO

Dominio asumido: `https://carvan.ar/`. Si es otro, reemplazarlo en canonical, `og:url`, `og:image`, JSON-LD, `robots.txt` y `sitemap.xml` (buscar `carvan.ar`).

- Títulos y descripciones propios por página (55 y 145 caracteres aprox.).
- `canonical`, `robots` (tienda y 404 en `noindex, follow`), Open Graph y Twitter con `assets/og-carvan.jpg` (1200×630).
- JSON-LD `Store` (nombre, dirección, coordenadas, teléfono, horarios, Instagram) + `WebSite` en la portada; `ContactPage` + `BreadcrumbList` en contacto. No se marcó el puntaje de Google: Google no muestra reseñas propias de un negocio sobre sí mismo.
- `robots.txt`, `sitemap.xml` (portada y contacto), `site.webmanifest`, favicon SVG + PNG y `apple-touch-icon`.
- `404.html` con rutas absolutas desde la raíz: hay que configurarlo como página de error en el hosting.

## Copy

Copy de la home tomado de `E:/E descargas/carvan-copy-landing.md` (basado en carvan.ar: tres generaciones, 100% Angus, precio justo, envíos mayoristas). Bloque "Próximamente" (reserva online, pago al retirar) dentro de Nuestras carnes, sin link hasta que la tienda esté vigente.

La versión anterior quedó en `../_respaldo-2026-10-10-previo/`.
