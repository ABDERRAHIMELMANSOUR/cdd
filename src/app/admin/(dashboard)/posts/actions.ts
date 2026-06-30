"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { str, optStr, bool, makeSlug } from "@/lib/form-utils";
import type { PostType } from "@prisma/client";

async function resolveCategory(name: string | null): Promise<string | null> {
  if (!name) return null;
  const slug = makeSlug(name);
  const cat = await prisma.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });
  return cat.id;
}

async function resolveTags(raw: string): Promise<{ id: string }[]> {
  const names = raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const ids: { id: string }[] = [];
  for (const name of names) {
    const slug = makeSlug(name);
    const tag = await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
    ids.push({ id: tag.id });
  }
  return ids;
}

async function buildData(fd: FormData) {
  const title = str(fd, "title");
  const published = bool(fd, "published");
  return {
    title,
    slug: str(fd, "slug") ? makeSlug(str(fd, "slug")) : makeSlug(title),
    excerpt: optStr(fd, "excerpt"),
    content: optStr(fd, "content"),
    featured: optStr(fd, "featured"),
    type: (str(fd, "type") || "BLOG") as PostType,
    published,
    publishedAt: published ? new Date() : null,
    authorName: optStr(fd, "authorName"),
    metaTitle: optStr(fd, "metaTitle"),
    metaDesc: optStr(fd, "metaDesc"),
    ogImage: optStr(fd, "ogImage"),
    categoryId: await resolveCategory(optStr(fd, "category")),
  };
}

export async function createPost(fd: FormData) {
  await requireUser();
  const tags = await resolveTags(str(fd, "tags"));
  const data = await buildData(fd);
  await prisma.post.create({ data: { ...data, tags: { connect: tags } } });
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function updatePost(fd: FormData) {
  await requireUser();
  const id = str(fd, "id");
  const tags = await resolveTags(str(fd, "tags"));
  const data = await buildData(fd);
  await prisma.post.update({
    where: { id },
    data: { ...data, tags: { set: tags } },
  });
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function deletePost(fd: FormData) {
  await requireUser();
  await prisma.post.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/posts");
}
