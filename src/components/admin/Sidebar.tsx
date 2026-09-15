"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Sunburst from "@/components/Sunburst";

const groups: { title: string; links: { href: string; label: string; icon: string }[] }[] = [
  {
    title: "Général",
    links: [
      { href: "/admin", label: "Tableau de bord", icon: "▦" },
      { href: "/admin/pages", label: "Pages & contenu", icon: "▤" },
      { href: "/admin/media", label: "Médiathèque", icon: "▣" },
    ],
  },
  {
    title: "Personnes",
    links: [
      { href: "/admin/leaders", label: "Direction", icon: "★" },
      { href: "/admin/advisors", label: "Conseillers", icon: "✦" },
    ],
  },
  {
    title: "Contenus",
    links: [
      { href: "/admin/events", label: "Événements", icon: "◷" },
      { href: "/admin/projects", label: "Projets", icon: "◧" },
      { href: "/admin/posts", label: "Blog & Actualités", icon: "✎" },
    ],
  },
  {
    title: "Réseau",
    links: [
      { href: "/admin/partners", label: "Partenaires", icon: "⬡" },
      { href: "/admin/packages", label: "Packages", icon: "◆" },
      { href: "/admin/submissions", label: "Messages", icon: "✉" },
    ],
  },
  {
    title: "Communauté",
    links: [
      { href: "/admin/members", label: "Supporters", icon: "◍" },
      { href: "/admin/moderation", label: "Modération", icon: "⚐" },
    ],
  },
  {
    title: "Système",
    links: [
      { href: "/admin/users", label: "Utilisateurs", icon: "⚇" },
      { href: "/admin/settings", label: "Paramètres", icon: "⚙" },
    ],
  },
];

export default function Sidebar({ name, role }: { name: string; role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 rounded-md bg-brand p-2 text-white lg:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
      >
        ☰
      </button>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform overflow-y-auto bg-brand-dark text-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-white/10 p-5">
          <Sunburst className="h-8 w-8" />
          <div className="leading-tight">
            <p className="text-sm font-bold">CDD Pays-Bas</p>
            <p className="text-[11px] text-white/50">Administration</p>
          </div>
        </div>

        <nav className="p-3">
          {groups.map((g) => (
            <div key={g.title} className="mb-4">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                {g.title}
              </p>
              {g.links.map((l) => {
                const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                      active ? "bg-brand text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="w-4 text-center text-accent">{l.icon}</span>
                    {l.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="text-sm font-medium">{name}</p>
          <p className="mb-3 text-[11px] text-white/50">{role}</p>
          <div className="flex gap-2">
            <Link href="/" target="_blank" className="flex-1 rounded-md bg-white/10 px-3 py-1.5 text-center text-xs hover:bg-white/20">
              Voir le site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex-1 rounded-md bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
