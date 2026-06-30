import Link from "next/link";
import type { Metadata } from "next";
import { getPage, safe } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui";
import Sunburst from "@/components/Sunburst";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  return {
    title: page.metaTitle || "CDD Pays-Bas — Club des Dirigeants",
    description: page.metaDesc || undefined,
  };
}

export default async function HomePage() {
  const page = await getPage("home");
  const c = page.content as any;
  const hero = c.hero ?? {};
  const stats: { value: string; label: string }[] = c.stats ?? [];
  const sections: { title: string; text: string }[] = c.sections ?? [];

  const [advisors, events, partners] = await Promise.all([
    safe(() => prisma.advisor.findMany({ where: { active: true }, orderBy: { order: "asc" }, take: 4 }), []),
    safe(
      () =>
        prisma.event.findMany({
          where: { published: true },
          orderBy: { date: "desc" },
          take: 3,
        }),
      []
    ),
    safe(() => prisma.partner.findMany({ where: { active: true }, orderBy: { order: "asc" }, take: 8 }), []),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand text-white">
        <div className="absolute -right-20 -top-20 opacity-10">
          <Sunburst className="h-[520px] w-[520px]" />
        </div>
        <div className="container-cdd relative grid gap-10 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              Club des Dirigeants — Pays-Bas
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              {hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">{hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              {hero.primaryButton && (
                <Link href={hero.primaryButton.href} className="btn-accent">
                  {hero.primaryButton.label}
                </Link>
              )}
              {hero.secondaryButton && (
                <Link
                  href={hero.secondaryButton.href}
                  className="btn border border-white/40 text-white hover:bg-white/10"
                >
                  {hero.secondaryButton.label}
                </Link>
              )}
            </div>
          </div>
          {hero.image && (
            <div className="flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.image} alt="" className="max-h-96 rounded-2xl object-cover shadow-2xl" />
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      {stats.length > 0 && (
        <section className="border-b border-gray-100 bg-white">
          <div className="container-cdd grid grid-cols-2 gap-6 py-12 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-4xl font-bold text-brand">{s.value}</div>
                <div className="mt-1 text-sm font-medium uppercase tracking-wide text-gray-500">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sections / mission */}
      {sections.length > 0 && (
        <section className="section">
          <div className="container-cdd">
            <div className="grid gap-8 md:grid-cols-3">
              {sections.map((s, i) => (
                <div key={i} className="card p-7">
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-brand-50">
                    <Sunburst className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-brand">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Advisors preview */}
      {advisors.length > 0 && (
        <section className="section bg-brand-50">
          <div className="container-cdd">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="eyebrow">Expertise</p>
                <h2 className="heading">Nos conseillers seniors</h2>
              </div>
              <Link href="/about/advisors" className="btn-ghost hidden sm:inline-flex">
                Tous les conseillers →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {advisors.map((a) => (
                <div key={a.id} className="card overflow-hidden">
                  <Avatar src={a.photo} name={a.name} className="h-48 w-full" />
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900">{a.name}</h3>
                    <p className="text-sm text-accent">{a.category}</p>
                    {a.shortBio && <p className="mt-2 line-clamp-3 text-sm text-gray-600">{a.shortBio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming events */}
      {events.length > 0 && (
        <section className="section">
          <div className="container-cdd">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="eyebrow">Agenda</p>
                <h2 className="heading">Événements</h2>
              </div>
              <Link href="/activities/events" className="btn-ghost hidden sm:inline-flex">
                Tous les événements →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {events.map((e) => (
                <Link key={e.id} href={`/activities/events/${e.slug}`} className="card overflow-hidden">
                  {e.banner ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.banner} alt={e.title} className="h-44 w-full object-cover" />
                  ) : (
                    <div className="h-44 w-full bg-gradient-to-br from-brand to-brand-light" />
                  )}
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase text-accent">
                      {new Date(e.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <h3 className="mt-1 font-semibold text-gray-900">{e.title}</h3>
                    {e.location && <p className="mt-1 text-sm text-gray-500">{e.location}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Partners */}
      {partners.length > 0 && (
        <section className="border-t border-gray-100 bg-white py-14">
          <div className="container-cdd">
            <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-gray-400">
              Ils nous font confiance
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {partners.map((p) =>
                p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={p.logo} alt={p.name} className="h-10 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
                ) : (
                  <span key={p.id} className="font-display text-lg font-semibold text-gray-400">
                    {p.name}
                  </span>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* ImpactNow CTA */}
      <section className="section bg-brand-dark text-white">
        <div className="container-cdd flex flex-col items-center gap-6 text-center">
          <p className="eyebrow">Bientôt</p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            ImpactNow — Smart Business Platform
          </h2>
          <p className="max-w-2xl text-white/80">
            Notre plateforme de networking et de connaissances propulsée par l'IA arrive bientôt.
          </p>
          <Link href="/impactnow" className="btn-accent">
            En savoir plus
          </Link>
        </div>
      </section>
    </>
  );
}
