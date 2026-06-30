import Link from "next/link";
import Logo from "./Logo";
import { NAV } from "@/lib/nav";

type Settings = {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  logo?: string | null;
};

export default function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-brand-dark text-white">
      <div className="container-cdd grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="rounded-lg bg-white p-3 inline-block">
            <Logo logo={settings.logo} compact />
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/70">
            Le réseau d'affaires francophone des dirigeants aux Pays-Bas.
          </p>
        </div>

        {NAV.filter((n) => n.children).map((group) => (
          <div key={group.href}>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-accent">
              {group.label}
            </h4>
            <ul className="space-y-2">
              {group.children!.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="text-sm text-white/75 hover:text-white">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-accent">Contact</h4>
          <ul className="space-y-2 text-sm text-white/75">
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.phone && <li>{settings.phone}</li>}
            {settings.address && <li>{settings.address}</li>}
          </ul>
          <div className="mt-4 flex gap-3">
            {settings.linkedin && (
              <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white" aria-label="LinkedIn">
                in
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-cdd flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/60 sm:flex-row">
          <p>© {year} CDD Pays-Bas — Club des Dirigeants. Tous droits réservés.</p>
          <p>
            <Link href="/admin" className="hover:text-white">
              Administration
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
