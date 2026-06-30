import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "https://cddpaysbas.nl";
  const staticRoutes = [
    "",
    "/about",
    "/about/leadership",
    "/about/advisors",
    "/activities",
    "/activities/events",
    "/activities/projects",
    "/activities/blog",
    "/activities/news",
    "/network",
    "/network/partnerships",
    "/network/packages",
    "/network/membership",
    "/network/contact",
    "/impactnow",
  ].map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));

  const [events, projects, posts] = await Promise.all([
    safe(() => prisma.event.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }), []),
    safe(() => prisma.project.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }), []),
    safe(() => prisma.post.findMany({ where: { published: true }, select: { slug: true, type: true, updatedAt: true } }), []),
  ]);

  const dynamicRoutes = [
    ...events.map((e) => ({ url: `${base}/activities/events/${e.slug}`, lastModified: e.updatedAt })),
    ...projects.map((p) => ({ url: `${base}/activities/projects/${p.slug}`, lastModified: p.updatedAt })),
    ...posts.map((p) => ({
      url: `${base}/activities/${p.type === "NEWS" ? "news" : "blog"}/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
