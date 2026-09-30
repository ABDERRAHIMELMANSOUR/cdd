import type { Locale } from "@/i18n/portal";
import roster from "@/data/roster.json";
import rosterI18n from "@/data/roster-i18n.json";
import events from "@/data/events.json";

/**
 * Translations for content that arrived in French from the public site: the
 * imported roster profiles and the seeded events.
 *
 * The database holds one language — whatever was imported or typed. For the
 * imported rows the public site already publishes official EN and NL versions,
 * so the portal shows those to EN and NL readers.
 *
 * ── ONLY WHILE THE ROW IS UNTOUCHED ──────────────────────────────────────────
 * A translation replaces a field only when the stored value is still exactly
 * the French that was imported. Once a supporter rewrites their bio, or the
 * secretariat edits an event, that text is theirs and is shown as written:
 * swapping it for a stale translation of the old text would be worse than
 * showing it in one language.
 */

type Fields = { role?: string | null; bio?: string | null; badge?: string | null };
const ROSTER_FR = new Map<string, Fields>(
  (roster as { name: string; role: string | null; bio: string | null; badge: string | null }[]).map(
    (p) => [p.name, { role: p.role, bio: p.bio, badge: p.badge }]
  )
);
const ROSTER_T = rosterI18n as Record<string, Partial<Record<Locale, Fields>>>;

export function localizePerson<
  T extends { name: string; position?: string | null; bio?: string | null; badge?: string | null },
>(person: T, locale: Locale): T {
  if (locale === "fr") return person;
  const fr = ROSTER_FR.get(person.name);
  const tr = ROSTER_T[person.name]?.[locale];
  if (!fr || !tr) return person;
  const out = { ...person };
  if ("position" in person && person.position && person.position === fr.role && tr.role) out.position = tr.role;
  if ("bio" in person && person.bio && person.bio === fr.bio && tr.bio) out.bio = tr.bio;
  if ("badge" in person && person.badge && person.badge === fr.badge && tr.badge) out.badge = tr.badge;
  return out;
}

type EventSeed = {
  slug: string;
  title: string;
  description: string;
  translations?: Partial<Record<Locale, { title: string; description: string }>>;
};
const EVENTS = new Map((events as EventSeed[]).map((e) => [e.slug, e]));

export function localizeEvent<T extends { slug: string; title: string; description: string | null }>(
  event: T,
  locale: Locale
): T {
  if (locale === "fr") return event;
  const seed = EVENTS.get(event.slug);
  const tr = seed?.translations?.[locale];
  if (!seed || !tr) return event;
  return {
    ...event,
    title: event.title === seed.title ? tr.title : event.title,
    description: event.description === seed.description ? tr.description : event.description,
  };
}
