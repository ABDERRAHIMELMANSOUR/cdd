"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { str, optStr, bool, int } from "@/lib/form-utils";

function data(fd: FormData) {
  return {
    name: str(fd, "name"),
    position: str(fd, "position") || "Senior Advisor",
    category: str(fd, "category") || "Senior Advisor",
    photo: optStr(fd, "photo"),
    shortBio: optStr(fd, "shortBio"),
    longBio: optStr(fd, "longBio"),
    linkedin: optStr(fd, "linkedin"),
    email: optStr(fd, "email"),
    order: int(fd, "order"),
    active: bool(fd, "active"),
  };
}

export async function createAdvisor(fd: FormData) {
  await requireUser();
  await prisma.advisor.create({ data: data(fd) });
  revalidatePath("/admin/advisors");
  revalidatePath("/about/advisors");
  redirect("/admin/advisors");
}

export async function updateAdvisor(fd: FormData) {
  await requireUser();
  const id = str(fd, "id");
  await prisma.advisor.update({ where: { id }, data: data(fd) });
  revalidatePath("/admin/advisors");
  revalidatePath("/about/advisors");
  redirect("/admin/advisors");
}

export async function deleteAdvisor(fd: FormData) {
  await requireUser();
  await prisma.advisor.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/advisors");
  revalidatePath("/about/advisors");
}

export async function reorderAdvisor(fd: FormData) {
  await requireUser();
  const id = str(fd, "id");
  const dir = str(fd, "dir");
  const current = await prisma.advisor.findUnique({ where: { id } });
  if (!current) return;
  const neighbor = await prisma.advisor.findFirst({
    where: dir === "up" ? { order: { lt: current.order } } : { order: { gt: current.order } },
    orderBy: { order: dir === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;
  await prisma.$transaction([
    prisma.advisor.update({ where: { id: current.id }, data: { order: neighbor.order } }),
    prisma.advisor.update({ where: { id: neighbor.id }, data: { order: current.order } }),
  ]);
  revalidatePath("/admin/advisors");
  revalidatePath("/about/advisors");
}
