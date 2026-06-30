"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { str, optStr, bool, int, makeSlug } from "@/lib/form-utils";

function data(fd: FormData) {
  const title = str(fd, "title");
  return {
    title,
    slug: str(fd, "slug") ? makeSlug(str(fd, "slug")) : makeSlug(title),
    image: optStr(fd, "image"),
    summary: optStr(fd, "summary"),
    content: optStr(fd, "content"),
    status: str(fd, "status") || "ongoing",
    order: int(fd, "order"),
    published: bool(fd, "published"),
  };
}

export async function createProject(fd: FormData) {
  await requireUser();
  await prisma.project.create({ data: data(fd) });
  revalidatePath("/admin/projects");
  revalidatePath("/activities/projects");
  redirect("/admin/projects");
}

export async function updateProject(fd: FormData) {
  await requireUser();
  await prisma.project.update({ where: { id: str(fd, "id") }, data: data(fd) });
  revalidatePath("/admin/projects");
  revalidatePath("/activities/projects");
  redirect("/admin/projects");
}

export async function deleteProject(fd: FormData) {
  await requireUser();
  await prisma.project.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/projects");
  revalidatePath("/activities/projects");
}
