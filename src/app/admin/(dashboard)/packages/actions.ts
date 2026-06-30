"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { str, optStr, bool, int, lines, makeSlug } from "@/lib/form-utils";

function data(fd: FormData) {
  const title = str(fd, "title");
  return {
    title,
    slug: str(fd, "slug") ? makeSlug(str(fd, "slug")) : makeSlug(title),
    description: optStr(fd, "description"),
    price: optStr(fd, "price"),
    features: lines(fd, "features"),
    ctaLabel: str(fd, "ctaLabel") || "Nous contacter",
    ctaUrl: str(fd, "ctaUrl") || "/network/contact",
    featured: bool(fd, "featured"),
    order: int(fd, "order"),
    active: bool(fd, "active"),
  };
}

export async function createPackage(fd: FormData) {
  await requireUser();
  await prisma.package.create({ data: data(fd) });
  revalidatePath("/admin/packages");
  revalidatePath("/network/packages");
  redirect("/admin/packages");
}

export async function updatePackage(fd: FormData) {
  await requireUser();
  await prisma.package.update({ where: { id: str(fd, "id") }, data: data(fd) });
  revalidatePath("/admin/packages");
  revalidatePath("/network/packages");
  redirect("/admin/packages");
}

export async function deletePackage(fd: FormData) {
  await requireUser();
  await prisma.package.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/packages");
  revalidatePath("/network/packages");
}
