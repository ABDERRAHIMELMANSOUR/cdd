import { prisma } from "@/lib/prisma";
import { Role, MemberStatus } from "@prisma/client";
import roster from "@/data/roster.json";
import events from "@/data/events.json";

/**
 * Import the public site's roster into the portal directory.
 *
 * Shared by the command-line script and the admin screen so the two cannot
 * drift: the same partitioning, the same rules about what is never overwritten.
 *
 * ── THESE ARE PROFILES, NOT LOGINS ───────────────────────────────────────────
 * Imported rows get UNUSABLE_PASSWORD, which is not a bcrypt hash at all.
 * bcrypt.compare returns false for it against any input — verified, it does not
 * throw — so no password can ever open these accounts. The alternative, hashing
 * random bytes, produces something indistinguishable from a real credential
 * when you are looking at the table in Supabase; this is legible at a glance
 * and costs nothing to compute.
 *
 * Publishing someone's profile is not the same act as issuing them a login.
 * /admin/members sets a real password when the secretariat is ready, on the row
 * that is already there.
 *
 * ── WHY THIS BATCHES ─────────────────────────────────────────────────────────
 * It runs inside a Vercel function with a wall-clock limit, over a connection
 * pooler. Twenty-nine sequential round-trips plus twenty-nine bcrypt hashes at
 * cost 10 measured around three seconds of CPU alone and would sit close to
 * that limit. One read, one createMany and an update only for rows that
 * actually differ keeps it to a handful of queries.
 */

/** Not a bcrypt hash. `bcrypt.compare` returns false for it against anything. */
export const UNUSABLE_PASSWORD = "!no-login-imported-profile";

const COMMISSIONS = new Set([
  "energy-water-transition",
  "digital-ai-infrastructure",
  "industry-trade-logistics",
  "talent-knowledge-society",
]);

export type RosterResult = {
  applied: boolean;
  created: string[];
  updated: string[];
  unchanged: number;
  total: number;
  /** Events seeded alongside the people; same import, same button. */
  eventsCreated: string[];
  eventsTotal: number;
};

/** The organisation's mail domain, and the shape of every member login. */
export const MAIL_DOMAIN = "cddpaysbas.nl";

/**
 * firstname.lastname@cddpaysbas.nl
 *
 * The first token is the given name; every remaining token is the surname,
 * joined WITHOUT a separator — "Abderrahim El Mansour" becomes
 * abderrahim.elmansour, not abderrahim.el-mansour. Diacritics are folded and
 * apostrophes dropped, so "M'barek Oubahssou" becomes mbarek.oubahssou rather
 * than something a keyboard cannot reproduce.
 *
 * Checked across the current roster of 31: no two people collide. A future
 * namesake would, and createMany's skipDuplicates would then silently drop the
 * second — so two people sharing both names need a deliberate address rather
 * than a generated one.
 */
export function memberEmail(name: string): string {
  const parts = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const clean = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");
  const first = clean(parts[0] ?? "");
  const last = clean(parts.slice(1).join(""));

  return `${last ? `${first}.${last}` : first}@${MAIL_DOMAIN}`;
}

/** Addresses written by earlier imports, before the real domain was adopted. */
function isLegacyPlaceholder(email: string): boolean {
  return email.endsWith(".invalid");
}

export async function importRoster({ apply }: { apply: boolean }): Promise<RosterResult> {
  const people = roster as {
    name: string;
    role: string | null;
    bio: string | null;
    image: string | null;
    linkedin: string | null;
    group: string | null;
    badge?: string | null;
  }[];

  // One read rather than one per person.
  const existing = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      position: true,
      bio: true,
      image: true,
      linkedinUrl: true,
      commission: true,
      badge: true,
    },
  });
  const byEmail = new Map(existing.map((u) => [u.email, u]));
  const byName = new Map(existing.map((u) => [u.name, u]));

  const created: string[] = [];
  const updated: { id: string; name: string; data: Record<string, string | null> }[] = [];
  let unchanged = 0;

  for (const person of people) {
    const email = memberEmail(person.name);
    // Matched by name as a fallback, so a row whose placeholder address has
    // since been replaced with a real one is found rather than duplicated.
    const found = byEmail.get(email) ?? byName.get(person.name);

    // Email is normally never touched on an existing row — see below. The one
    // exception is a .invalid placeholder: nobody chose that address, an
    // earlier import generated it, and leaving it would strand the person on a
    // login that is not the one the secretariat will hand out.
    const migrateEmail = found && isLegacyPlaceholder(found.email) && found.email !== email;

    const profile = {
      name: person.name,
      position: person.role,
      bio: person.bio,
      image: person.image,
      linkedinUrl: person.linkedin,
      commission: person.group && COMMISSIONS.has(person.group) ? person.group : null,
      badge: person.badge ?? null,
    };

    if (!found) {
      created.push(person.name);
      continue;
    }

    const same =
      found.position === profile.position &&
      found.bio === profile.bio &&
      found.image === profile.image &&
      found.linkedinUrl === profile.linkedinUrl &&
      found.commission === profile.commission &&
      found.badge === profile.badge &&
      !migrateEmail;

    if (same) unchanged++;
    else
      updated.push({
        id: found.id,
        name: person.name,
        // The migration rides along with the profile update rather than in a
        // pass of its own, so a legacy row is corrected in the same write.
        data: migrateEmail ? { ...profile, email } : profile,
      });
  }

  if (apply) {
    if (created.length) {
      await prisma.user.createMany({
        data: people
          .filter((p) => created.includes(p.name))
          .map((p) => ({
            name: p.name,
            email: memberEmail(p.name),
            password: UNUSABLE_PASSWORD,
            role: Role.MEMBER,
            status: MemberStatus.ACTIVE,
            active: true,
            position: p.role,
            bio: p.bio,
            image: p.image,
            linkedinUrl: p.linkedin,
            commission: p.group && COMMISSIONS.has(p.group) ? p.group : null,
            badge: p.badge ?? null,
          })),
        skipDuplicates: true,
      });
    }
    // Password, role, status and active are never in `data`: an import that
    // reset someone's role every time it ran would be a trap. Email joins them
    // unless it is still a .invalid placeholder, which nobody chose.
    for (const u of updated) {
      await prisma.user.update({ where: { id: u.id }, data: u.data });
    }
  }

  const eventsCreated = await importEvents(apply);

  return {
    applied: apply,
    created,
    updated: updated.map((u) => u.name),
    unchanged,
    total: people.length,
    eventsCreated,
    eventsTotal: events.length,
  };
}

/**
 * Seed the public site's events into the CMS Event table.
 *
 * Creates only — never updates. Events are editable in /admin/events, and an
 * import that overwrote them on every run would quietly undo whatever the
 * board had corrected. `slug` is unique, so a second run is a no-op.
 */
async function importEvents(apply: boolean): Promise<string[]> {
  const slugs = events.map((e) => e.slug);
  const existing = await prisma.event.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true },
  });
  const have = new Set(existing.map((e) => e.slug));
  const missing = events.filter((e) => !have.has(e.slug));

  if (apply && missing.length) {
    await prisma.event.createMany({
      data: missing.map((e) => ({
        slug: e.slug,
        title: e.title,
        date: new Date(e.date),
        location: e.location,
        banner: e.banner,
        description: e.description,
        gallery: e.gallery,
        published: true,
      })),
      skipDuplicates: true,
    });
  }

  return missing.map((e) => e.title);
}
