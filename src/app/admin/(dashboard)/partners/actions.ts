"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { str, optStr, bool, int } from "@/lib/form-utils";

function data(fd: FormData) {
  return {
    name: str(fd, "name"),
    logo: optStr(fd, "logo"),
    description: optStr(fd, "description"),
    url: optStr(fd, "url"),
    order: int(fd, "order"),
    active: bool(fd, "active"),
  };
}

export async function createPartner(fd: FormData) {
  await requireUser();
  await prisma.partner.create({ data: data(fd) });
  revalidatePath("/admin/partners");
  revalidatePath("/network/partnerships");
  redirect("/admin/partners");
}

export async function updatePartner(fd: FormData) {
  await requireUser();
  await prisma.partner.update({ where: { id: str(fd, "id") }, data: data(fd) });
  revalidatePath("/admin/partners");
  revalidatePath("/network/partnerships");
  redirect("/admin/partners");
}

export async function deletePartner(fd: FormData) {
  await requireUser();
  await prisma.partner.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/partners");
  revalidatePath("/network/partnerships");
}
