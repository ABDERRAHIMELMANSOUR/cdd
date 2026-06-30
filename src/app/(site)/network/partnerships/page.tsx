import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { PageHeader, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Partenariats" };

export default async function PartnershipsPage() {
  const partners = await safe(
    () => prisma.partner.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    []
  );

  return (
    <>
      <PageHeader
        eyebrow="Ensemble"
        title="Partenariats"
        subtitle="Le CDD Pays-Bas s'appuie sur un réseau de partenaires de confiance."
      />
      <section className="section">
        <div className="container-cdd">
          {partners.length === 0 ? (
            <EmptyState message="Nos partenaires seront bientôt présentés ici." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((p) => (
                <div key={p.id} className="card flex flex-col p-7">
                  {p.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logo} alt={p.name} className="mb-4 h-14 w-auto object-contain" />
                  ) : (
                    <div className="mb-4 grid h-14 w-14 place-items-center rounded-lg bg-brand-50 font-display text-xl font-bold text-brand">
                      {p.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  {p.description && <p className="mt-2 text-sm text-gray-600">{p.description}</p>}
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer" className="mt-3 text-sm font-semibold text-brand hover:underline">
                      Visiter →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 rounded-2xl bg-brand-50 p-10 text-center">
            <h2 className="font-display text-2xl font-bold text-brand">Devenir partenaire</h2>
            <p className="mx-auto mt-2 max-w-xl text-gray-600">
              Vous souhaitez soutenir le réseau des dirigeants francophones aux Pays-Bas ? Découvrez nos
              packages ou contactez-nous.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <a href="/network/packages" className="btn-primary">
                Voir les packages
              </a>
              <a href="/network/contact" className="btn-outline">
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
