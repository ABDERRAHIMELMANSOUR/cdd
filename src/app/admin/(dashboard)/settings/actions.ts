"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { str, optStr } from "@/lib/form-utils";

export async function updateSettings(fd: FormData) {
  await requireUser();
  const data = {
    siteName: str(fd, "siteName") || "CDD Pays-Bas",
    logo: optStr(fd, "logo"),
    tagline: optStr(fd, "tagline"),
    email: optStr(fd, "email"),
    phone: optStr(fd, "phone"),
    address: optStr(fd, "address"),
    linkedin: optStr(fd, "linkedin"),
    facebook: optStr(fd, "facebook"),
    instagram: optStr(fd, "instagram"),
    twitter: optStr(fd, "twitter"),
    brandColor: optStr(fd, "brandColor"),
    accentColor: optStr(fd, "accentColor"),
  };
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
}
