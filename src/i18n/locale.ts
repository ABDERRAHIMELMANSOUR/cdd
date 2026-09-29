import { cookies } from "next/headers";
import { DEFAULT_LOCALE, getDictionary, isLocale, type Dictionary, type Locale } from "./portal";

export const LOCALE_COOKIE = "cdd_locale";

/**
 * The reader's locale, from the cookie, on the server.
 *
 * Server-side means pages render already-translated HTML: no flash of French
 * before JavaScript swaps it, and no dictionary shipped to the browser for
 * pages that never needed it.
 *
 * An unrecognised or absent value falls back to French rather than throwing —
 * a tampered cookie is not a reason to refuse to render a page.
 */
export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** The locale and its dictionary together, which is what pages actually want. */
export function getT(): { locale: Locale; t: Dictionary } {
  const locale = getLocale();
  return { locale, t: getDictionary(locale) };
}
