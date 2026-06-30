import Link from "next/link";
import { AdminHeader, Panel } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const PAGES = [
  { key: "home", label: "Accueil", desc: "Hero, statistiques, sections" },
  { key: "about", label: "À propos", desc: "Introduction, contenu, valeurs" },
  { key: "impactnow", label: "ImpactNow", desc: "Page Coming Soon" },
  { key: "membership", label: "Devenir membre", desc: "Introduction et avantages" },
  { key: "contact", label: "Contact", desc: "Texte d'introduction" },
];

export default function PagesAdmin() {
  return (
    <>
      <AdminHeader title="Pages & contenu" subtitle="Éditez le contenu et le SEO des pages principales." />
      <Panel className="divide-y divide-gray-50">
        {PAGES.map((p) => (
          <Link key={p.key} href={`/admin/pages/${p.key}`} className="flex items-center justify-between p-5 hover:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">{p.label}</p>
              <p className="text-sm text-gray-400">{p.desc}</p>
            </div>
            <span className="text-sm font-semibold text-brand">Éditer →</span>
          </Link>
        ))}
      </Panel>
    </>
  );
}
