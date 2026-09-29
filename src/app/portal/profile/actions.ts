"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
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

export type PasswordState = {
  ok?: boolean;
  /** A key of `t.password`, never a sentence: the form renders it in the reader's language. */
  error?: "required" | "wrongCurrent" | "tooShort" | "mismatch" | "sameAsOld" | "noPassword";
  /** Bumped on success so the form can clear its fields. */
  at?: number;
};

const MIN_PASSWORD = 10; // same floor the admin surface applies

/**
 * Lets a signed-in supporter replace their own password.
 *
 * The id comes from the session, and the current password must be proven
 * before anything changes: a session left open on a shared computer should
 * not be enough to take the account over permanently. Passwords are never
 * logged or echoed back.
 */
export async function changePassword(
  _prev: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const user = await requireMember();

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!current || !next || !confirm) return { error: "required" };
  if (next.length < MIN_PASSWORD) return { error: "tooShort" };
  // bcrypt only uses the first 72 bytes; refuse longer rather than silently truncate.
  if (Buffer.byteLength(next, "utf8") > 72) return { error: "tooShort" };
  if (next !== confirm) return { error: "mismatch" };

  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: { password: true },
  });
  // Imported roster profiles carry an unusable sentinel, not a hash.
  if (!row?.password || !row.password.startsWith("$2")) return { error: "noPassword" };

  let ok = false;
  try {
    ok = await bcrypt.compare(current, row.password);
  } catch {
    ok = false;
  }
  if (!ok) return { error: "wrongCurrent" };
  if (current === next) return { error: "sameAsOld" };

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(next, 10) },
  });

  return { ok: true, at: Date.now() };
}
