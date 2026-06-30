import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { PageHeader, Avatar, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Direction" };

export default async function LeadershipPage() {
  const leaders = await safe(
    () => prisma.leader.findMany({ where: { active: true }, orderBy: [{ isPresident: "desc" }, { order: "asc" }] }),
    []
  );
  const president = leaders.find((l) => l.isPresident);
  const board = leaders.filter((l) => !l.isPresident);

  return (
    <>
      <PageHeader eyebrow="Gouvernance" title="Direction" subtitle="Le bureau du Club des Dirigeants Pays-Bas." />
      <section className="section">
        <div className="container-cdd">
          {leaders.length === 0 && <EmptyState message="La direction sera bientôt présentée ici." />}

          {president && (
            <div className="mb-16 grid items-center gap-8 md:grid-cols-[280px_1fr]">
              <Avatar src={president.photo} name={president.name} className="aspect-square w-full rounded-2xl" />
              <div>
                <p className="eyebrow">{president.position}</p>
                <h2 className="font-display text-3xl font-bold text-brand">{president.name}</h2>
                {president.bio && <p className="mt-4 max-w-2xl text-gray-600">{president.bio}</p>}
                <div className="mt-4 flex gap-4 text-sm">
                  {president.linkedin && (
                    <a href={president.linkedin} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                      LinkedIn
                    </a>
                  )}
                  {president.email && (
                    <a href={`mailto:${president.email}`} className="text-brand hover:underline">
                      Email
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {board.length > 0 && (
            <>
              <h3 className="mb-8 font-display text-2xl font-bold text-brand">Le bureau</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {board.map((m) => (
                  <div key={m.id} className="card overflow-hidden text-center">
                    <Avatar src={m.photo} name={m.name} className="h-52 w-full" />
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-900">{m.name}</h4>
                      <p className="text-sm text-accent">{m.position}</p>
                      {m.linkedin && (
                        <a href={m.linkedin} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-brand hover:underline">
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
