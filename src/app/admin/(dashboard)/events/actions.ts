"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { str, optStr, bool, lines, makeSlug } from "@/lib/form-utils";

function data(fd: FormData) {
  const title = str(fd, "title");
  return {
    title,
    slug: str(fd, "slug") ? makeSlug(str(fd, "slug")) : makeSlug(title),
    banner: optStr(fd, "banner"),
    date: new Date(str(fd, "date") || Date.now()),
    time: optStr(fd, "time"),
    location: optStr(fd, "location"),
    description: optStr(fd, "description"),
    registration: optStr(fd, "registration"),
    gallery: lines(fd, "gallery"),
    published: bool(fd, "published"),
  };
}

export async function createEvent(fd: FormData) {
  await requireUser();
  await prisma.event.create({ data: data(fd) });
  revalidatePath("/admin/events");
  revalidatePath("/activities/events");
  redirect("/admin/events");
}

export async function updateEvent(fd: FormData) {
  await requireUser();
  await prisma.event.update({ where: { id: str(fd, "id") }, data: data(fd) });
  revalidatePath("/admin/events");
  revalidatePath("/activities/events");
  redirect("/admin/events");
}

export async function deleteEvent(fd: FormData) {
  await requireUser();
  await prisma.event.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/events");
  revalidatePath("/activities/events");
}
