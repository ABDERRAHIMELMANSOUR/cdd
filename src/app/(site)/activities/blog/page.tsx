import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { PageHeader } from "@/components/ui";
import PostList from "@/components/PostList";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Blog" };

export default async function BlogPage() {
  const posts = await safe(
    () =>
      prisma.post.findMany({
        where: { type: "BLOG", published: true },
        orderBy: { publishedAt: "desc" },
        include: { category: { select: { name: true } } },
      }),
    []
  );
  return (
    <>
      <PageHeader eyebrow="Insights" title="Blog" subtitle="Analyses, conseils et retours d'expérience de dirigeants." />
      <section className="section">
        <div className="container-cdd">
          <PostList posts={posts} base="/activities/blog" />
        </div>
      </section>
    </>
  );
}
