"use server";

import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { str } from "@/lib/form-utils";

export async function deleteMedia(fd: FormData) {
  await requireUser();
  const id = str(fd, "id");
  const media = await prisma.media.findUnique({ where: { id } });
  if (media?.url.startsWith("/uploads/")) {
    try {
      await unlink(path.join(process.cwd(), "public", media.url));
    } catch {
      /* file may already be gone */
    }
  }
  await prisma.media.delete({ where: { id } });
  revalidatePath("/admin/media");
}
