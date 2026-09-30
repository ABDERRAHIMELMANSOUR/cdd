"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Logo from "@/components/Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { count, type Dictionary, type Locale } from "@/i18n/portal";


function links(t: Dictionary) {
  return [
    { href: "/portal", label: t.nav.home },
    { href: "/portal/feed", label: t.nav.feed },
    { href: "/portal/messages", label: t.nav.messages },
    { href: "/portal/events", label: t.nav.events },
    { href: "/portal/directory", label: t.nav.directory },
    { href: "/portal/profile", label: t.nav.profile },
  ];
}

/** Unread count, shown beside Messages only. A badge on a link that cannot
 *  have unread items is noise, so this returns null for every other link. */
function Unread({ href, count, label }: { href: string; count: number; label: string }) {
  if (href !== "/portal/messages" || count < 1) return null;
  return (
    <span
      className="ml-1.5 inline-grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white"
      aria-label={label}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

export default function PortalNav({
  name,
  isStaff,
  unread = 0,
  locale,
  t,
}: {
  name: string;
  isStaff: boolean;
  unread?: number;
  locale: Locale;
  t: Dictionary;
}) {
  const LINKS = links(t);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // "/portal" must not light up on every child route, so the home link matches
  // exactly while the others match their subtree.
  const active = (href: string) =>
    href === "/portal" ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-5">
        {/* The wordmark carries the name, so the separate "Espace supporters"
            label beside it was saying it twice and costing the width that the
            navigation needs on a phone. */}
        <Link href="/portal" className="flex shrink-0 items-center" aria-label={t.nav.portalLabel}>
          <Logo href={null} className="h-8 max-w-[170px] sm:h-9 sm:max-w-[200px]" priority />
        </Link>

        <nav className="hidden flex-1 items-center gap-0.5 lg:flex" aria-label={t.nav.portalLabel}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active(l.href) ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                active(l.href) ? "bg-brand-50 text-brand" : "text-gray-600 hover:text-brand"
              }`}
            >
              {l.label}
              <Unread href={l.href} count={unread} label={count(t, t.nav.unreadLabelOne, t.nav.unreadLabel, unread)} />
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher locale={locale} label={t.common.changeLanguage} className="hidden sm:inline-flex" />
          {isStaff && (
            <Link href="/admin" className="hidden text-sm text-gray-500 hover:text-brand sm:block">
              {t.nav.admin}
            </Link>
          )}
          <span className="hidden text-sm text-gray-600 lg:block">{name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand"
          >
            {t.nav.signOut}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm lg:hidden"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-gray-100 px-4 py-3 lg:hidden" aria-label={t.nav.portalLabel}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={active(l.href) ? "page" : undefined}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                active(l.href) ? "bg-brand-50 text-brand" : "text-gray-700"
              }`}
            >
              {l.label}
              <Unread href={l.href} count={unread} label={count(t, t.nav.unreadLabelOne, t.nav.unreadLabel, unread)} />
            </Link>
          ))}
          {/* Also inside the menu: below sm the control is hidden in the bar,
              and the phone is where a reader is most likely to want it. */}
          <div className="mt-2 border-t border-gray-100 pt-3 sm:hidden">
            <LanguageSwitcher locale={locale} label={t.common.changeLanguage} />
          </div>
        </nav>
      )}
    </header>
  );
}
