"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import Logo from "./Logo";

export default function Navbar({ logo }: { logo?: string | null }) {
  const [open, setOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <nav className="container-cdd flex h-20 items-center justify-between">
        <Logo logo={logo} compact />

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    active ? "text-brand" : "text-gray-700 hover:text-brand"
                  }`}
                >
                  {item.label}
                  {item.children && (
                    <svg className="h-3.5 w-3.5 opacity-60" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  )}
                </Link>
                {item.children && (
                  <div className="invisible absolute left-0 top-full w-60 translate-y-1 rounded-xl border border-gray-100 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:block">
          <Link href="/network/membership" className="btn-primary">
            Devenir membre
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {open ? <path d="M6 18 18 6M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gray-100 bg-white lg:hidden">
          <ul className="container-cdd flex flex-col py-3">
            {NAV.map((item) => (
              <li key={item.href} className="border-b border-gray-50 last:border-0">
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex-1 py-3 text-sm font-semibold text-gray-800"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      className="p-3 text-gray-500"
                      onClick={() =>
                        setMobileGroup((g) => (g === item.href ? null : item.href))
                      }
                      aria-label="Sous-menu"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      </svg>
                    </button>
                  )}
                </div>
                {item.children && mobileGroup === item.href && (
                  <div className="pb-2 pl-3">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:text-brand"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
            <li className="pt-3">
              <Link href="/network/membership" onClick={() => setOpen(false)} className="btn-primary w-full">
                Devenir membre
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
