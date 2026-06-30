import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { PageHeader, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Packages networking",
  description: "Découvrez les services et packages de networking proposés par le CDD Pays-Bas.",
};

export default async function PackagesPage() {
  const packages = await safe(
    () => prisma.package.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    []
  );

  return (
    <>
      <PageHeader
        eyebrow="Nos offres"
        title="Packages networking"
        subtitle="Des services pensés pour développer votre réseau et votre activité aux Pays-Bas."
      />
      <section className="section">
        <div className="container-cdd">
          {packages.length === 0 ? (
            <EmptyState message="Les packages seront bientôt disponibles." />
          ) : (
            <div className="grid items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((p) => (
                <div
                  key={p.id}
                  className={`card relative flex flex-col p-8 ${
                    p.featured ? "ring-2 ring-brand" : ""
                  }`}
                >
                  {p.featured && (
                    <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-0.5 text-xs font-bold uppercase text-white">
                      Recommandé
                    </span>
                  )}
                  <h3 className="font-display text-2xl font-bold text-brand">{p.title}</h3>
                  {p.price && <p className="mt-1 text-lg font-semibold text-accent">{p.price}</p>}
                  {p.description && <p className="mt-3 text-sm text-gray-600">{p.description}</p>}
                  {p.features.length > 0 && (
                    <ul className="mt-6 space-y-3">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7 7a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4L9 11.6l6.3-6.3a1 1 0 0 1 1.4 0Z" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href={p.ctaUrl || "/network/contact"}
                    className={`mt-8 ${p.featured ? "btn-primary" : "btn-outline"} w-full`}
                  >
                    {p.ctaLabel || "Nous contacter"}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
