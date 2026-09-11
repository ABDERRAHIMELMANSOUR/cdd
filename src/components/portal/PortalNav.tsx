"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Sunburst from "@/components/Sunburst";

const LINKS = [
  { href: "/portal", label: "Fil d'actualité" },
  { href: "/portal/directory", label: "Annuaire" },
  { href: "/portal/profile", label: "Mon profil" },
];

export default function PortalNav({ name, isStaff }: { name: string; isStaff: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // "/portal" must not light up on every child route, so the home link matches
  // exactly while the others match their subtree.
  const active = (href: string) =>
    href === "/portal" ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-5">
        <Link href="/portal" className="flex items-center gap-2" aria-label="Portail CDD Pays-Bas">
          <Sunburst className="h-8 w-8" />
          <span className="hidden font-display text-sm font-bold text-brand sm:block">
            Espace donateurs
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Portail">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active(l.href) ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active(l.href) ? "bg-brand-50 text-brand" : "text-gray-600 hover:text-brand"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {isStaff && (
            <Link href="/admin" className="hidden text-sm text-gray-500 hover:text-brand sm:block">
              Administration
            </Link>
          )}
          <span className="hidden text-sm text-gray-600 lg:block">{name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand"
          >
            Déconnexion
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm md:hidden"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-gray-100 px-4 py-2 md:hidden" aria-label="Portail (mobile)">
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
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
