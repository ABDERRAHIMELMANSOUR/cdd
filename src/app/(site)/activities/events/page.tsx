import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { PageHeader, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Événements" };

export default async function EventsPage() {
  const events = await safe(
    () => prisma.event.findMany({ where: { published: true }, orderBy: { date: "desc" } }),
    []
  );
  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past = events.filter((e) => new Date(e.date) < now);

  return (
    <>
      <PageHeader eyebrow="Agenda" title="Événements" subtitle="Rencontres, conférences et soirées du club." />
      <section className="section">
        <div className="container-cdd space-y-12">
          {events.length === 0 && <EmptyState message="Aucun événement pour le moment." />}

          {upcoming.length > 0 && (
            <div>
              <h2 className="mb-6 font-display text-2xl font-bold text-brand">À venir</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {upcoming.map((e) => (
                  <EventCard key={e.id} e={e} />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="mb-6 font-display text-2xl font-bold text-brand">Passés</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {past.map((e) => (
                  <EventCard key={e.id} e={e} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function EventCard({ e }: { e: any }) {
  return (
    <Link href={`/activities/events/${e.slug}`} className="card overflow-hidden">
      {e.banner ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={e.banner} alt={e.title} className="h-44 w-full object-cover" />
      ) : (
        <div className="h-44 w-full bg-gradient-to-br from-brand to-brand-light" />
      )}
      <div className="p-5">
        <p className="text-xs font-semibold uppercase text-accent">{formatDate(e.date)}</p>
        <h3 className="mt-1 font-semibold text-gray-900">{e.title}</h3>
        {e.location && <p className="mt-1 text-sm text-gray-500">{e.location}</p>}
      </div>
    </Link>
  );
}
