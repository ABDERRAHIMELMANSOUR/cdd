"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/i18n/portal";

const SHORT: Record<Locale, string> = { en: "EN", nl: "NL", fr: "FR" };

/**
 * EN / NL / FR, styled to match the control on cddpaysbas.nl — the same pill,
 * the same globe, the same blue-to-cyan gradient on the active language.
 *
 * ── WHY BUTTONS AND A REFRESH RATHER THAN LINKS ──────────────────────────────
 * The locale is a cookie, not a path, so there is no URL to link to. Each
 * button writes the cookie through a server action and then calls
 * router.refresh(), which re-renders the current route on the server with the
 * new locale and swaps it in. The reader stays exactly where they were —
 * changing language mid-conversation should not navigate them away from it.
 *
 * useTransition keeps the old text on screen while that round trip happens
 * instead of blanking the page, and marks the control busy so a second click
 * during the swap does not queue a second render.
 */
export default function LanguageSwitcher({
  locale,
  label,
  className = "",
}: {
  locale: Locale;
  /** Translated group label — the control names itself in the current language. */
  label: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale) return;
    const data = new FormData();
    data.set("locale", next);
    startTransition(async () => {
      await setLocale(data);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={label}
      aria-busy={pending}
      className={`inline-flex items-center gap-1 rounded-xl border border-gray-200 p-1 ${className}`}
    >
      {/* Inline SVG rather than an icon package: one glyph does not justify a
          dependency, and this keeps the control identical to the public site's
          without importing lucide into the portal. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
        className="ml-1.5 h-4 w-4 shrink-0 text-gray-600"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
      </svg>

      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            aria-pressed={active}
            aria-label={LOCALE_NAMES[option]}
            title={LOCALE_NAMES[option]}
            className={`rounded-lg px-2 py-1 text-xs font-bold transition-colors ${
              active
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {SHORT[option]}
          </button>
        );
      })}
    </div>
  );
}
