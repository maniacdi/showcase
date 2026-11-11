import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { SITE } from "@/config/site";

/** Absolute URL for a path in a locale ("as-needed": default locale has no prefix). */
export function localeUrl(path: string, locale: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${SITE.url}${prefix}${path}` || SITE.url;
}

/** canonical + hreflang alternates (incl. x-default) for a route. */
export function alternatesFor(path: string, locale: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = localeUrl(path, l);
  languages["x-default"] = localeUrl(path, routing.defaultLocale);
  return { canonical: localeUrl(path, locale), languages };
}

/** Private / transactional pages: keep out of the index but let crawlers follow links. */
export const NOINDEX: Metadata["robots"] = { index: false, follow: true };
