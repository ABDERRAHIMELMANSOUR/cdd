import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { requireMember } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Événements", robots: { index: false } };

const dateFull = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const monthShort = new Intl.DateTimeFormat("fr-FR", { month: "short" });

/**
 * The date block that sits on every card, in the public site's idiom: the day
 * large, the month beneath it, in the brand tint. It carries no text of its
 * own for a screen reader — the full date is written out in the card body,
 * where it reads as a sentence rather than as two stacked fragments.
 */
function DateBadge({ date, past }: { date: Date; past: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl ${
        past ? "bg-gray-100 text-gray-500" : "bg-brand-50 text-brand"
      }`}
    >
      <span className="font-display text-2xl font-bold leading-none">{date.getDate()}</span>
      <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide">
        {monthShort.format(date).replace(".", "")}
      </span>
    </div>
  );
}

export default async function PortalEvents() {
  await requireMember();

  const events = await safe(
    () =>
      prisma.event.findMany({
        where: { published: true },
        orderBy: { date: "desc" },
        take: 50,
      }),
    []
  );

  const now = new Date();
  const upcoming = events.filter((e) => e.date >= now).reverse();
  const past = events.filter((e) => e.date < now);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">Événements</h1>
        <p className="mt-1 text-sm text-gray-600">
          Les rencontres du réseau CDD Pays-Bas.
        </p>
      </header>

      {events.length === 0 ? (
        <p className="card p-8 text-center text-sm text-gray-600">
          Aucun événement publié pour le moment.
        </p>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-lg font-semibold text-gray-900">À venir</h2>
              <ul className="space-y-5">
                {upcoming.map((e) => (
                  <EventCard key={e.id} event={e} past={false} />
                ))}
              </ul>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-lg font-semibold text-gray-900">
                Rencontres passées
              </h2>
              <ul className="space-y-5">
                {past.map((e) => (
                  <EventCard key={e.id} event={e} past />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({
  event,
  past,
}: {
  event: {
    id: string;
    title: string;
    date: Date;
    location: string | null;
    banner: string | null;
    description: string | null;
    registration: string | null;
    gallery: string[];
  };
  past: boolean;
}) {
  return (
    <li className="card overflow-hidden">
      {event.banner && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.banner}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-44 w-full object-cover sm:h-56"
        />
      )}

      <div className="p-5 sm:p-6">
        <div className="flex gap-4">
          <DateBadge date={event.date} past={past} />
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-bold text-gray-900">{event.title}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {dateFull.format(event.date)}
              {event.location && ` · ${event.location}`}
            </p>
          </div>
        </div>

        {event.description && (
          // whitespace-pre-line so the paragraph breaks written in the source
          // survive, without interpreting anything in them as markup.
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700">
            {event.description}
          </p>
        )}

        {/* The gallery is what a past event leaves behind, so it renders under
            the recap rather than competing with the banner above it. The first
            photo is already the banner, so it is skipped here. */}
        {event.gallery.length > 1 && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {event.gallery
              .filter((src) => src !== event.banner)
              .map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-32 w-full rounded-lg object-cover sm:h-40"
                />
              ))}
          </div>
        )}

        {!past && event.registration && (
          <a
            href={event.registration}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-5 inline-block"
          >
            S&apos;inscrire
          </a>
        )}
      </div>
    </li>
  );
}
