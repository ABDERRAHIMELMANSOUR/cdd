"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { str, optStr, bool, int } from "@/lib/form-utils";

function data(fd: FormData) {
  return {
    name: str(fd, "name"),
    position: str(fd, "position"),
    isPresident: bool(fd, "isPresident"),
    photo: optStr(fd, "photo"),
    bio: optStr(fd, "bio"),
    linkedin: optStr(fd, "linkedin"),
    email: optStr(fd, "email"),
    order: int(fd, "order"),
    active: bool(fd, "active"),
  };
}

export async function createLeader(fd: FormData) {
  await requireUser();
  await prisma.leader.create({ data: data(fd) });
  revalidatePath("/admin/leaders");
  revalidatePath("/about/leadership");
  redirect("/admin/leaders");
}

export async function updateLeader(fd: FormData) {
  await requireUser();
  await prisma.leader.update({ where: { id: str(fd, "id") }, data: data(fd) });
  revalidatePath("/admin/leaders");
  revalidatePath("/about/leadership");
  redirect("/admin/leaders");
}

export async function deleteLeader(fd: FormData) {
  await requireUser();
  await prisma.leader.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/leaders");
  revalidatePath("/about/leadership");
}
