import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Activités" };

const items = [
  { href: "/activities/events", title: "Événements", text: "Rencontres, conférences et soirées networking." },
  { href: "/activities/projects", title: "Projets", text: "Les initiatives portées par le club et ses membres." },
  { href: "/activities/blog", title: "Blog", text: "Analyses, conseils et retours d'expérience." },
  { href: "/activities/news", title: "Actualités", text: "Les dernières nouvelles du CDD Pays-Bas." },
];

export default function ActivitiesPage() {
  return (
    <>
      <PageHeader eyebrow="Vie du club" title="Activités" subtitle="Tout ce qui anime le réseau CDD Pays-Bas." />
      <section className="section">
        <div className="container-cdd grid gap-6 sm:grid-cols-2">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="card p-8">
              <h3 className="font-display text-2xl font-bold text-brand">{it.title}</h3>
              <p className="mt-2 text-gray-600">{it.text}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-accent">Découvrir →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
