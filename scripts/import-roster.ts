/**
 * Populate the portal directory from the public site's roster.
 *
 * ── THESE ARE PROFILES, NOT LOGINS ───────────────────────────────────────────
 * Every row this writes gets a password that is a hash of 32 random bytes,
 * generated here and immediately discarded. Nobody knows it, so nobody can
 * sign in as these people — `bcrypt.compare` simply always fails.
 *
 * That is deliberate. Importing a roster is publishing profiles; it is not the
 * same act as issuing credentials to twenty-nine people who have not asked for
 * them and have not agreed to a password being set on their behalf. When the
 * secretariat is ready to give someone access, /admin/members sets a real
 * password on the row that is already there, and everything else about the
 * profile is preserved.
 *
 * ── THE EMAIL PROBLEM ────────────────────────────────────────────────────────
 * `User.email` is the unique key, and the public site's roster holds no email
 * addresses — it never needed them. Rather than invent plausible-looking ones,
 * placeholders use the .invalid TLD, which RFC 2606 reserves precisely so that
 * it can never resolve or route mail. They are visibly not real addresses, and
 * the profile page hides the "write to them" link for any address ending that
 * way rather than offering a mailto: that would silently go nowhere.
 *
 * Replace them from /admin/members as real addresses are collected; the import
 * is keyed on name, so it will not overwrite one you have corrected.
 *
 *   npm run roster           list what would change
 *   npm run roster -- --apply  write it
 */
import { PrismaClient, Role, MemberStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

type Person = {
  name: string;
  role: string | null;
  bio: string | null;
  image: string | null;
  linkedin: string | null;
  group: string | null;
};

/** Commission slugs the portal knows. Anything else is left unset rather than
 *  guessed — "secretariat" and "honorary" are not commissions. */
const COMMISSIONS = new Set([
  "energy-water-transition",
  "digital-ai-infrastructure",
  "industry-trade-logistics",
  "talent-knowledge-society",
]);

function slug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** A hash of bytes nobody keeps. The account exists; it cannot be signed into. */
async function unusablePassword(): Promise<string> {
  return bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
}

async function main() {
  const file = path.join(process.cwd(), "prisma", "roster.json");
  const people: Person[] = JSON.parse(fs.readFileSync(file, "utf-8"));

  console.log(`\n${people.length} people in prisma/roster.json`);
  if (!APPLY) console.log("DRY RUN — pass --apply to write.\n");

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const person of people) {
    const placeholder = `${slug(person.name)}@roster.invalid`;

    // Keyed on the placeholder address, so a row whose email has since been
    // corrected by hand is matched by name instead and never duplicated.
    const existing =
      (await prisma.user.findUnique({ where: { email: placeholder } })) ??
      (await prisma.user.findFirst({ where: { name: person.name } }));

    const profile = {
      name: person.name,
      position: person.role,
      bio: person.bio,
      image: person.image,
      linkedinUrl: person.linkedin,
      commission: person.group && COMMISSIONS.has(person.group) ? person.group : null,
    };

    if (!existing) {
      if (APPLY) {
        await prisma.user.create({
          data: {
            ...profile,
            email: placeholder,
            password: await unusablePassword(),
            role: Role.MEMBER,
            status: MemberStatus.ACTIVE,
            active: true,
          },
        });
      }
      created++;
      console.log(`  + ${person.name}${person.image ? "" : "   (no portrait — initials)"}`);
      continue;
    }

    // Never touches email, password, role, status or active on a row that
    // already exists: those are the secretariat's to set, and an import that
    // reset someone's role every time it ran would be a trap.
    if (APPLY) {
      await prisma.user.update({ where: { id: existing.id }, data: profile });
    }
    if (
      existing.position === profile.position &&
      existing.bio === profile.bio &&
      existing.image === profile.image &&
      existing.linkedinUrl === profile.linkedinUrl
    ) {
      skipped++;
    } else {
      updated++;
      console.log(`  ~ ${person.name}`);
    }
  }

  console.log(
    `\n${created} to create, ${updated} to update, ${skipped} already current.` +
      (APPLY ? " Written.\n" : " Nothing written.\n")
  );
}

main()
  .catch((error) => {
    console.error("\n✗", (error as Error).message, "\n");
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
