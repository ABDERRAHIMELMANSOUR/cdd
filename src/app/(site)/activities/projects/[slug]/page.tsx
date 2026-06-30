import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { Breadcrumb } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await safe(() => prisma.project.findUnique({ where: { slug: params.slug } }), null);
  return { title: p?.title || "Projet", description: p?.summary?.slice(0, 160) || undefined };
}

export default async function ProjectDetail({ params }: { params: { slug: string } }) {
  const p = await safe(() => prisma.project.findUnique({ where: { slug: params.slug } }), null);
  if (!p || !p.published) notFound();

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Activités", href: "/activities" },
          { label: "Projets", href: "/activities/projects" },
          { label: p.title },
        ]}
      />
      <article className="container-cdd max-w-3xl pb-20">
        {p.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.title} className="mb-8 w-full rounded-2xl object-cover" />
        )}
        <h1 className="font-display text-3xl font-bold text-brand sm:text-4xl">{p.title}</h1>
        {p.summary && <p className="mt-4 text-lg text-gray-600">{p.summary}</p>}
        {p.content && (
          <div className="prose mt-8 max-w-none whitespace-pre-line text-gray-700">{p.content}</div>
        )}
      </article>
    </>
  );
}
