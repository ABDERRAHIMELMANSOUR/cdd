import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { Breadcrumb } from "@/components/ui";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const e = await safe(() => prisma.event.findUnique({ where: { slug: params.slug } }), null);
  if (!e) return { title: "Événement" };
  return { title: e.title, description: e.description?.slice(0, 160) || undefined };
}

export default async function EventDetail({ params }: { params: { slug: string } }) {
  const e = await safe(() => prisma.event.findUnique({ where: { slug: params.slug } }), null);
  if (!e || !e.published) notFound();

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Activités", href: "/activities" },
          { label: "Événements", href: "/activities/events" },
          { label: e.title },
        ]}
      />
      <article className="container-cdd max-w-3xl pb-20">
        {e.banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.banner} alt={e.title} className="mb-8 w-full rounded-2xl object-cover" />
        )}
        <h1 className="font-display text-3xl font-bold text-brand sm:text-4xl">{e.title}</h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <span>📅 {formatDate(e.date)}</span>
          {e.time && <span>🕒 {e.time}</span>}
          {e.location && <span>📍 {e.location}</span>}
        </div>
        {e.description && (
          <div className="prose mt-8 max-w-none whitespace-pre-line text-gray-700">{e.description}</div>
        )}
        {e.registration && (
          <a href={e.registration} target="_blank" rel="noreferrer" className="btn-primary mt-8">
            S'inscrire
          </a>
        )}

        {e.gallery && e.gallery.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 font-display text-xl font-bold text-brand">Galerie</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {e.gallery.map((src: string, i: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" className="aspect-square w-full rounded-lg object-cover" />
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
