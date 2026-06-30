import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { PageHeader, EmptyState } from "@/components/ui";
import AdvisorsBrowser from "@/components/AdvisorsBrowser";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Conseillers seniors",
  description: "Découvrez les conseillers seniors du Club des Dirigeants Pays-Bas et leurs expertises.",
};

export default async function AdvisorsPage() {
  const advisors = await safe(
    () =>
      prisma.advisor.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          position: true,
          category: true,
          photo: true,
          shortBio: true,
          longBio: true,
          linkedin: true,
          email: true,
        },
      }),
    []
  );

  return (
    <>
      <PageHeader
        eyebrow="Expertise"
        title="Conseillers seniors"
        subtitle="Un collège de conseillers expérimentés au service des dirigeants et de leurs projets."
      />
      <section className="section">
        <div className="container-cdd">
          {advisors.length === 0 ? (
            <EmptyState message="Les conseillers seront bientôt présentés ici." />
          ) : (
            <AdvisorsBrowser advisors={advisors} />
          )}
        </div>
      </section>
    </>
  );
}
