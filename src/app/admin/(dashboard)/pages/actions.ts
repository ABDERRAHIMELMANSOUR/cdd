"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { str, optStr } from "@/lib/form-utils";

/** Parse "a | b" lines into objects with the given keys. */
function pairs(raw: string, keys: [string, string]) {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [a, ...rest] = l.split("|");
      return { [keys[0]]: (a ?? "").trim(), [keys[1]]: rest.join("|").trim() };
    });
}

function buildContent(key: string, fd: FormData): any {
  switch (key) {
    case "home":
      return {
        hero: {
          title: str(fd, "heroTitle"),
          subtitle: str(fd, "heroSubtitle"),
          image: optStr(fd, "heroImage") ?? "",
          primaryButton: { label: str(fd, "primaryLabel"), href: str(fd, "primaryHref") },
          secondaryButton: { label: str(fd, "secondaryLabel"), href: str(fd, "secondaryHref") },
        },
        stats: pairs(str(fd, "stats"), ["value", "label"]),
        sections: pairs(str(fd, "sections"), ["title", "text"]),
      };
    case "about":
      return {
        intro: str(fd, "intro"),
        body: str(fd, "body"),
        values: pairs(str(fd, "values"), ["title", "text"]),
      };
    case "impactnow":
      return {
        title: str(fd, "title2"),
        subtitle: str(fd, "subtitle"),
        body: str(fd, "body"),
        status: str(fd, "status") || "Coming Soon",
      };
    case "membership":
      return {
        intro: str(fd, "intro"),
        benefits: str(fd, "benefits").split("\n").map((l) => l.trim()).filter(Boolean),
      };
    case "contact":
      return { intro: str(fd, "intro") };
    default:
      return {};
  }
}

export async function updatePageContent(fd: FormData) {
  await requireUser();
  const key = str(fd, "key");
  const content = buildContent(key, fd);
  await prisma.page.upsert({
    where: { key },
    update: {
      title: str(fd, "pageTitle") || key,
      content,
      metaTitle: optStr(fd, "metaTitle"),
      metaDesc: optStr(fd, "metaDesc"),
      ogImage: optStr(fd, "ogImage"),
    },
    create: {
      key,
      title: str(fd, "pageTitle") || key,
      content,
      metaTitle: optStr(fd, "metaTitle"),
      metaDesc: optStr(fd, "metaDesc"),
      ogImage: optStr(fd, "ogImage"),
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}
