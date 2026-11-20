# Showcase

Plantilla **reskinnable** de demos de webs para comercios, hecha con Next.js
(App Router). Sirve para dos cosas:

1. **Enseñar** a clientes potenciales lo que se puede construir, en una sola URL.
2. **Reutilizar** como punto de partida real de proyectos (clónala y re-vístela
   por cliente).

Estética suiza/funcional, datos mock, desplegable en Vercel **sin variables de
entorno**. Rápida, accesible y optimizada para SEO.

🔗 Demo: `https://magaldi.is-a.dev` · Por [Javi García Magaldi](https://javimagaldi.com)

---

## Verticales

| Ruta | Qué es |
|------|--------|
| `/` | Hub: pitch, galería de estilos, demos y proyectos reales |
| `/servicios` | Landing de negocio local: servicios, precios, presupuestador por pasos, reseñas estilo ficha de Google, rendimiento medido en vivo (web-vitals), contacto + mapa |
| `/tienda` `/tienda/[slug]` `/tienda/carrito` | Ecommerce de electrónica: catálogo, ficha, carrito persistido, checkout simulado |
| `/reservas` | Clínica con varios profesionales: servicio, profesional, día y hora; recordatorio simulado, .ics y cancelación |
| `/restaurante` `/restaurante/carta` `/restaurante/reservar` | Restaurante: carta con los 14 alérgenos y filtros, QR por mesa (`?mesa=N`), reserva de mesa por turnos |
| `/marca` | "Tu negocio aquí": nombre, color, tipografía y logo aplicados a todo el showcase; enlace compartible `?brand=` |
| `/comparar` | Dos estilos de diseño lado a lado (`?a=&b=`) |
| `/login` `/register` | Auth con panel deslizante |
| `/admin` | Panel (gateado): resumen con gráficas, citas y agenda, pedidos, productos, restaurante (reservas, menú del día, QR), modo oscuro y tipografía |

Linkage entre verticales: reservar una cita o desactivar un producto en `/admin`
se refleja en `/reservas` y `/tienda` en la misma sesión.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **SCSS** (módulos + tokens en CSS custom properties) — sin Tailwind ni CSS-in-JS
- **next-intl** (es por defecto, `/en`)
- **Zustand** (preferencias, carrito, auth, citas, productos)
- **next/font** (self-host), **Vercel Analytics**, **Vitest** + Testing Library

## Quickstart

```bash
npm install
npm run dev        # http://localhost:3000
```

Scripts: `dev` · `build` · `start` · `lint` · `test` / `test:run`.

Usuarios demo: `admin@demo` / `demo` (admin) · `user@demo` / `demo` (user).

## Estructura

```
src/
  app/[locale]/        rutas (hub, servicios, tienda, reservas, login, register, admin)
  app/sitemap.ts robots.ts   SEO
  components/ui/        primitivas (Button, Field, Input, Modal, Section, Table…)
  components/layout/    SiteHeader, SiteFooter, Brand, DemoBar, WhatsAppButton…
  components/auth/      AuthFlow + Login/RegisterFields
  themes/              themes.ts (acento), fonts, ThemeProvider, PrefsApplier
  store/               Zustand (prefs, cart, auth, citas, products)
  i18n/                next-intl (routing, request, navigation)
  data/                contenido mock (servicios, productos, citas, reservas)
  messages/            es.json, en.json
  config/site.ts       URL canónica + contacto + WhatsApp
  styles/              _tokens, _dark, _mixins, globals
```

---

## Crear una web nueva con esta plantilla

1. En GitHub marca el repo como **Template** (Settings → Template repository) y
   pulsa **Use this template** para cada cliente (repo nuevo limpio).
   *(O simplemente copia la carpeta.)*
2. Edita estos puntos —todo está centralizado:

   | Cambias | Dónde |
   |---|---|
   | URL, contacto, WhatsApp, portfolio | `src/config/site.ts` |
   | Color de acento por vertical | `src/themes/themes.ts` |
   | Tipografías | `src/themes/fontOptions.ts` + `fonts.ts` |
   | Logo + nombre de marca | `src/components/layout/Brand/Brand.tsx` |
   | Contenido (servicios, precios, productos, citas) | `src/data/*` |
   | Textos / idiomas | `src/messages/es.json`, `en.json` |
   | Quitar un vertical que no use el cliente | borra su carpeta en `src/app/[locale]/…` + su item en el hub (`src/app/[locale]/page.tsx`) |

3. `npm run dev` para revisar → deploy en Vercel.

### Reglas del proyecto
- **Tipografía:** usa SIEMPRE los tokens `--text-xs … --text-3xl`. Nunca
  `font-size` con literales.
- Sin fondos degradados, sin card-dentro-de-card, `--radius` ≤ 2px, sin sombras
  (salvo `--shadow-overlay` para modales/menús).
- Mobile-first; breakpoints en `src/styles/_mixins.scss` (sm/md/lg/xl).

---

## Deploy (Vercel + dominio gratis)

1. Importa el repo en Vercel → deploy (`xxx.vercel.app`). Sin env vars.
2. **Dominio gratuito** `magaldi.is-a.dev` (ejemplo):
   - Vercel → Settings → Domains → añade `magaldi.is-a.dev` (CNAME →
     `cname.vercel-dns.com`).
   - PR a `github.com/is-a-dev/register` con `domains/magaldi.json`:
     ```json
     { "owner": { "username": "magaldiAMS", "email": "magaldi6@gmail.com" },
       "records": { "CNAME": "cname.vercel-dns.com" } }
     ```
3. Cambiar de dominio = editar `SITE.url` en `src/config/site.ts` (una línea;
   alimenta metadata, sitemap, robots y JSON-LD).

> `.npmrc` con `legacy-peer-deps=true` es necesario para que Vercel instale
> `@vercel/analytics` (peer fantasma de SvelteKit). No lo borres.

---

## Estilos visuales conmutables
Seis lenguajes visuales sobre el mismo HTML: **Swiss** (por defecto),
**Brutalism**, **Neofuturism**, **Glassmorphism**, **Neumorphism** y **Bento Grid**.

- Selector flotante «Estilo» (abajo a la izquierda) en todas las páginas + galería
  comparativa en el hub. Enlace compartible: `/?style=brutalism`.
- `<html data-style="…">` (aplicado antes del primer pintado por
  `src/themes/PrefsScript.tsx`, persistido en `usePrefsStore`).
- Cada estilo es un bloque de **solo custom properties** en
  `src/styles/_design-styles.scss`. Los componentes nunca preguntan por el estilo:
  leen tokens vía los mixins `surface`, `tile` y `control` de `_mixins.scss`.
- Cualquier elemento con `data-style` renderiza ese estilo localmente (así funcionan
  las previews del hub).
- **Para un cliente con estilo fijo:** deja solo su bloque, quita `StyleSwitcher`
  del layout y la `StyleGallery` del hub.
- Las reglas de abajo (radio ≤ 2px, sin sombras ni degradados) son las del estilo
  Swiss; los demás estilos las rompen a propósito dentro de sus tokens.

## Sistema de diseño
- Tokens base en `src/styles/_tokens.scss` (espaciado 4/8, escala tipográfica,
  acento por defecto); neutros/superficies por estilo en `_design-styles.scss`.
- Acentos por vertical en `src/themes/themes.ts`; `ThemeProvider theme="…"` los aplica.

## Tipografía
- Catálogo plano en `src/themes/fontOptions.ts`; instancias `next/font` en
  `fonts.ts`. La fuente activa la controla `usePrefsStore` (`--font-sans`).
  Cambiar la fuente de toda la web = una variable. Selector en `/admin`.

## Modo oscuro
- `src/styles/_dark.scss` (`[data-color-scheme="dark"]`) + `usePrefsStore`,
  toggle en `/admin`.
- **Para quitarlo** en un proyecto fijo: borra `_dark.scss`, su `@use` en
  `globals.scss`, la rama `colorScheme` del store y el toggle.

## i18n
- `next-intl`, `es` por defecto y `/en`. Mensajes en `src/messages/`. Selector en
  el footer.

## SEO y captación
- Metadata + keywords por página, `sitemap.ts`, `robots.ts`, hreflang es/en.
- JSON-LD: `WebSite` + `ProfessionalService` (hub), `LocalBusiness` (servicios),
  `Product` (fichas).
- Imágenes OG dinámicas (site + por producto) vía `opengraph-image`.
- Captación: CTA → portfolio, botón WhatsApp flotante, formularios que abren tu
  email (`mailto`), testimonios. Configurable en `src/config/site.ts`.

## Checkout simulado (`/tienda/carrito`)
Cuatro pasos en la misma URL: **carrito → envío → pago → confirmación**.
- Envío: nombre, email, dirección, código postal español (01000 a 52999), teléfono y
  método (estándar 4,95 €, gratis desde 100 €; urgente 9,95 €; recogida en tienda).
- Pago **simulado, no se cobra nada**: tarjeta con formato, Luhn, caducidad y CVC
  (tarjeta de prueba `4242 4242 4242 4242`) o Bizum (móvil español). Los datos de
  tarjeta viven solo en el estado del formulario: nunca se persisten ni se envían;
  el pedido guarda únicamente los 4 últimos dígitos.
- Totales con desglose de IVA (21 %, los precios ya lo incluyen): base + IVA = total,
  calculado en céntimos (`src/lib/checkout.ts`).
- Confirmación: número de pedido, entrega estimada (días laborables), resumen y
  vista previa del email de confirmación (no se envía nada).
- Pedidos en `src/store/useOrdersStore.ts` (sessionStorage, como las citas: cada
  visitante empieza con el stock de la semilla). Al pedir baja el stock del
  catálogo; sin stock suficiente no se puede continuar. Los pedidos se fechan en el
  "hoy" fijo de la demo (`AGENDA_HOY`) y aparecen en `/admin` (tabla «Pedidos» y
  gráfica de ventas).

## Resumen del panel (`/admin`)
- KPIs (citas esta semana, ventas del mes, ticket medio, productos activos) y tres
  gráficas sin librerías (CSS + SVG inline, solo tokens): reservas por día (14 días),
  ventas por semana (8 semanas) y productos más vistos. Cada gráfica lleva una tabla
  oculta con los datos para lectores de pantalla.
- Datos: citas y pedidos de la sesión + historial de ejemplo determinista
  (`src/data/clinica.ts`, `src/data/ventas.ts`), anclado a `AGENDA_HOY` para que
  servidor y navegador pinten lo mismo. Etiquetado como «Datos de ejemplo».
- Exportar a CSV (citas, productos, pedidos): Blob en cliente con BOM UTF-8 para que
  Excel lea bien los acentos; en español `;` y coma decimal, en inglés `,` y punto.
  Las celdas que empiezan por `=`, `+`, `-` o `@` se neutralizan (inyección de
  fórmulas).

## PWA (instalable y offline)
- `src/app/manifest.ts` → `/manifest.webmanifest` (colores de `src/lib/ogTokens.ts`,
  iconos 192/512 normales y *maskable* en `public/icons/`).
- Iconos: `node scripts/generate-pwa-icons.mjs` los regenera desde la marca de
  `app/icon.svg` con `sharp` (ya viene con Next, sin dependencias nuevas).
- `public/sw.js` (escrito a mano): precachea `/`, `/tienda`, `/reservas`,
  `/servicios` y `/offline` (+ `/en/offline`); páginas *network-first* con
  copia en caché y página offline localizada como respaldo; estáticos e imágenes
  *cache-first*. Sube `VERSION` en el fichero para invalidar cachés.
- Se registra solo en producción (`src/components/pwa/ServiceWorkerRegister.tsx`)
  para no cachear los chunks de HMR. En dev: `?sw=1` lo fuerza y `?sw=0` lo
  desregistra.
- Botón «Instalar app» en el pie (aparece cuando el navegador lanza
  `beforeinstallprompt`, Chrome/Edge/Android) y aviso para iOS: «Compartir, Añadir a
  pantalla de inicio».
- Probar: `npm run build && npm start`, abrir `http://localhost:3000`, DevTools →
  Application (Manifest, Service workers, Cache storage) → marcar *Offline* y
  navegar: las páginas visitadas cargan desde caché y el resto muestra `/offline`.
  Lighthouse → "Installable".

## Auth (mock)
- API en `src/lib/auth/useAuth.ts`; gating con `src/lib/auth/RequireAuth.tsx`.
- ⚠️ **AUTH MOCK — NO USAR EN PRODUCCIÓN.** Contraseñas en texto plano en
  localStorage, validación solo en cliente. Para producción: sustituir
  `lib/auth` + `useAuthStore` por NextAuth (Credentials + Google, hashing en
  servidor, sesión httpOnly) + gating en middleware. Las páginas solo consumen
  `useAuth`, así el cambio queda localizado.

## Estado de las demos
> Son **esquemas funcionales**, no el diseño final. Cada proyecto se adapta a la
> identidad, contenido y necesidades de cada cliente. Las imágenes son
> placeholders (pendiente de assets reales).
