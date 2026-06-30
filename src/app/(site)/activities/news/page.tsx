import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { PageHeader } from "@/components/ui";
import PostList from "@/components/PostList";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Actualités" };

export default async function NewsPage() {
  const posts = await safe(
    () =>
      prisma.post.findMany({
        where: { type: "NEWS", published: true },
        orderBy: { publishedAt: "desc" },
        include: { category: { select: { name: true } } },
      }),
    []
  );
  return (
    <>
      <PageHeader eyebrow="Le club" title="Actualités" subtitle="Les dernières nouvelles du CDD Pays-Bas." />
      <section className="section">
        <div className="container-cdd">
          <PostList posts={posts} base="/activities/news" />
        </div>
      </section>
    </>
  );
}
