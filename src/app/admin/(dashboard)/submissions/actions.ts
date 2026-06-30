"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { str } from "@/lib/form-utils";

export async function toggleHandled(fd: FormData) {
  await requireUser();
  const id = str(fd, "id");
  const s = await prisma.submission.findUnique({ where: { id } });
  if (!s) return;
  await prisma.submission.update({ where: { id }, data: { handled: !s.handled } });
  revalidatePath("/admin/submissions");
}

export async function deleteSubmission(fd: FormData) {
  await requireUser();
  await prisma.submission.delete({ where: { id: str(fd, "id") } });
  revalidatePath("/admin/submissions");
}
