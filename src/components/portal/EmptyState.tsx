import Link from "next/link";

/**
 * The panel a supporter sees before there is anything to see.
 *
 * ── WHY THESE MATTER MORE THAN THEY LOOK ────────────────────────────────────
 * Every one of the twenty-nine imported people meets this portal for the first
 * time on a day when the feed has nothing in it, nobody has messaged them, and
 * the only events are ones that already happened. The empty state IS the
 * product on that day. A grey line reading "nothing yet" tells them the place
 * is dead; the same space can instead say what it is for and offer the one
 * thing worth doing next.
 *
 * So the shape is fixed and deliberate: a mark, a title that names the space
 * rather than its emptiness, a sentence of what it is for, and at most one
 * action. One — a panel offering three routes out is a menu, and a menu is
 * what you build when you have not decided what someone should do.
 *
 * The icon is drawn from a token rather than passed in, so a new empty state
 * cannot invent its own visual language, and it is aria-hidden: it decorates
 * the title, it does not add to it.
 */

type IconName = "feed" | "messages" | "directory" | "events" | "search";

const PATHS: Record<IconName, string> = {
  // Simple line glyphs, stroked, sharing a 24-box so they sit at one weight.
  feed: "M4 6h16M4 12h10M4 18h7",
  messages: "M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.6-.7L3 21l1.9-5A8.4 8.4 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z",
  directory: "M17 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 20v-1a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  events: "M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
};

export default function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body: string;
  /** At most one. `href` navigates; omit `action` entirely when the next step
   *  is already on screen — the feed's composer sits directly above it. */
  action?: { href: string; label: string };
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d={PATHS[icon]} />
        </svg>
      </span>

      <h2 className="mt-4 font-display text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-600">{body}</p>

      {action && (
        <Link href={action.href} className="btn-primary mt-6 inline-block">
          {action.label}
        </Link>
      )}
    </div>
  );
}
