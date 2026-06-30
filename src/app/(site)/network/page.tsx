import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Réseau" };

const items = [
  { href: "/network/partnerships", title: "Partenariats", text: "Nos partenaires institutionnels et entreprises." },
  { href: "/network/packages", title: "Packages networking", text: "Nos offres de services networking." },
  { href: "/network/membership", title: "Devenir membre", text: "Rejoignez le réseau des dirigeants." },
  { href: "/network/contact", title: "Contact", text: "Échangez avec l'équipe du CDD Pays-Bas." },
];

export default function NetworkPage() {
  return (
    <>
      <PageHeader eyebrow="Communauté" title="Réseau" subtitle="Rejoignez et développez votre réseau de dirigeants." />
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
