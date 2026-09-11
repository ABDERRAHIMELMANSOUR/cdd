"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/session";
import { COMMISSIONS } from "@/lib/portal";

const SLUGS = COMMISSIONS.map((c) => c.slug) as [string, ...string[]];

/**
 * Only http(s). A `javascript:` URL in a profile link is a stored XSS waiting
 * for another supporter to click it, and `z.string().url()` accepts it.
 */
const webUrl = z
  .union([
    // An untouched field arrives as "", which is a clear instruction rather
    // than a malformed URL, so it is accepted before validation is attempted.
    z.literal(""),
    z
      .string()
      .trim()
      .max(300)
      .url("Adresse invalide.")
      .refine(
        (u) => /^https?:\/\//i.test(u),
        "L'adresse doit commencer par http:// ou https://"
      ),
  ])
  .optional();

const optionalText = (max: number) =>
  z.union([z.literal(""), z.string().trim().max(max)]).optional();

const ProfileSchema = z.object({
  name: z.string().trim().min(2, "Le nom est requis.").max(120),
  position: optionalText(120),
  company: optionalText(120),
  bio: optionalText(2000),
  phone: optionalText(40),
  linkedinUrl: webUrl,
  website: webUrl,
  image: webUrl,
  commission: z.union([z.literal(""), z.enum(SLUGS)]).optional(),
});

export type ProfileState = { ok?: boolean; error?: string };

/**
 * Updates the signed-in supporter's own profile.
 *
 * The id comes from the session, never from the form. A hidden userId field
 * would be the whole authorisation model sitting in markup the submitter
 * controls — anyone could edit anyone by changing one value in devtools.
 *
 * `role`, `status`, `email` and `password` are not accepted here at any price:
 * they are how someone would promote themselves to ADMIN or approve their own
 * pending account. Those belong to the admin surface.
 */
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const user = await requireMember();

  const parsed = ProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }
  const d = parsed.data;

  // Empty string means "cleared", which is null in the database rather than ""
  // — otherwise `bio && <p>` renders an empty paragraph forever.
  const blank = (v?: string) => (v && v.length > 0 ? v : null);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: d.name,
      position: blank(d.position),
      company: blank(d.company),
      bio: blank(d.bio),
      phone: blank(d.phone),
      linkedinUrl: blank(d.linkedinUrl),
      website: blank(d.website),
      image: blank(d.image),
      commission: blank(d.commission),
    },
  });

  revalidatePath("/portal/profile");
  revalidatePath("/portal/directory");
  revalidatePath(`/portal/members/${user.id}`);
  return { ok: true };
}
