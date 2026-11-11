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
| `/servicios` | Landing de negocio local (hero, servicios, por qué, precios, testimonios, contacto + mapa) |
| `/tienda` `/tienda/[slug]` `/tienda/carrito` | Ecommerce: catálogo, ficha, carrito persistido, checkout mock |
| `/reservas` | Reserva de citas (servicio + día + hora) |
| `/login` `/register` | Auth con panel deslizante |
| `/admin` | Panel (gateado): citas, productos, modo oscuro y tipografía |

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
