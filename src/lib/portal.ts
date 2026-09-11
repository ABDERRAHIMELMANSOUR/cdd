import type { Prisma } from "@prisma/client";

/**
 * Shared shapes and lookups for the community portal.
 *
 * The commission list is duplicated from the public website's own data on
 * purpose. That site is a separate repository and a separate deployment; an
 * import across them is not possible, and a foreign key into a table this
 * database does not own would be worse. The slugs are the contract, and they
 * are asserted in a test rather than assumed.
 */
export const COMMISSIONS = [
  { slug: "energy-water-transition", label: "Transition énergétique & hydrique" },
  { slug: "digital-ai-infrastructure", label: "Numérique, IA & infrastructures" },
  { slug: "industry-trade-logistics", label: "Industrie, commerce & logistique" },
  { slug: "talent-knowledge-society", label: "Talents, savoir & société" },
] as const;

export function commissionLabel(slug: string | null): string | null {
  return COMMISSIONS.find((c) => c.slug === slug)?.label ?? null;
}

/**
 * The columns the directory and profile pages may read.
 *
 * Defined once and reused so a new query cannot quietly widen what leaves the
 * database. `password` is the reason this exists: `select` is an allow-list,
 * where omitting a field from an `include` is a thing you have to remember.
 */
export const MEMBER_PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
  position: true,
  company: true,
  bio: true,
  linkedinUrl: true,
  website: true,
  commission: true,
  lastSeenAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type MemberCard = Prisma.UserGetPayload<{ select: typeof MEMBER_PUBLIC_SELECT }>;

/** Initials for the avatar fallback — the same treatment as the public site. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
