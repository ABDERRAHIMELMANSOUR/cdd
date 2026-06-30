import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { PageHeader, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Projets" };

const statusLabels: Record<string, string> = {
  ongoing: "En cours",
  completed: "Terminé",
  upcoming: "À venir",
};

export default async function ProjectsPage() {
  const projects = await safe(
    () => prisma.project.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    []
  );

  return (
    <>
      <PageHeader eyebrow="Initiatives" title="Projets" subtitle="Les projets portés par le club et ses membres." />
      <section className="section">
        <div className="container-cdd">
          {projects.length === 0 ? (
            <EmptyState message="Aucun projet pour le moment." />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Link key={p.id} href={`/activities/projects/${p.slug}`} className="card overflow-hidden">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.title} className="h-48 w-full object-cover" />
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-brand-light to-brand" />
                  )}
                  <div className="p-6">
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand">
                      {statusLabels[p.status] ?? p.status}
                    </span>
                    <h3 className="mt-2 font-semibold text-gray-900">{p.title}</h3>
                    {p.summary && <p className="mt-2 line-clamp-3 text-sm text-gray-600">{p.summary}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
