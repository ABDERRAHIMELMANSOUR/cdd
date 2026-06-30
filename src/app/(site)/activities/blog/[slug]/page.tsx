import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import PostDetail from "@/components/PostDetail";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  return safe(
    () =>
      prisma.post.findUnique({
        where: { slug },
        include: { category: { select: { name: true } }, tags: { select: { name: true } } },
      }),
    null
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await load(params.slug);
  if (!p) return { title: "Article" };
  return {
    title: p.metaTitle || p.title,
    description: p.metaDesc || p.excerpt?.slice(0, 160) || undefined,
  };
}

export default async function BlogDetail({ params }: { params: { slug: string } }) {
  const p = await load(params.slug);
  if (!p || !p.published || p.type !== "BLOG") notFound();
  return <PostDetail post={p} crumbLabel="Blog" crumbHref="/activities/blog" />;
}
