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

/**
 * "il y a 3 h" for feed and message timestamps.
 *
 * Rendered on the server so every viewer sees the same string regardless of
 * their clock, and so the markup does not change between the server render and
 * hydration — a relative time computed in the browser is the classic source of
 * a React hydration mismatch. The tradeoff is that it goes stale on a page
 * left open; these pages are dynamic and refetch on navigation, so it does not
 * stay wrong for long.
 */
export function timeAgo(date: Date, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - date.getTime()) / 1000));
  if (seconds < 60) return "à l'instant";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;

  const days = Math.round(hours / 24);
  if (days < 7) return `il y a ${days} j`;

  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
}

/** The columns a feed or message author exposes — a narrow slice of the
 *  profile allow-list, because a post does not need a phone number. */
export const AUTHOR_SELECT = {
  id: true,
  name: true,
  image: true,
  position: true,
  company: true,
} satisfies Prisma.UserSelect;
