"use client";

import { useEffect } from "react";

/**
 * Sets <html lang> to the portal language.
 *
 * The root layout is shared with the public pages and /admin, which are
 * static and French; reading the locale cookie there would make every page
 * dynamic. So the portal corrects the attribute itself. It matters: with
 * lang="fr" on a Dutch page, Chrome offers to "translate from French" and
 * screen readers pronounce Dutch with French rules.
 */
export default function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
