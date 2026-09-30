import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/session";
import { COMMISSIONS, MEMBER_PUBLIC_SELECT, commissionLabel } from "@/lib/portal";
import Avatar from "@/components/portal/Avatar";
import { getT } from "@/i18n/locale";
import { count } from "@/i18n/portal";
import EmptyState from "@/components/portal/EmptyState";
import { localizePerson } from "@/lib/localize";

export const dynamic = "force-dynamic";
// The tab title follows the reader's language like everything else.
export async function generateMetadata() {
  const { t } = getT();
  return { title: t.directory.title, robots: { index: false } };
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: { q?: string; commission?: string };
}) {
  await requireMember();
  const { locale, t } = getT();

  const q = (searchParams.q ?? "").trim();
  const commission = searchParams.commission ?? "";

  /*
   * Only ACTIVE supporters appear. Pending registrations are not yet part of
   * the network and suspended ones are no longer part of it; listing either
   * would leak a membership decision the board has not published.
   *
   * Staff accounts are excluded too — the directory is a network of
   * supporters, not a staff list, and an EDITOR who administers the CMS has
   * not consented to appear in it.
   */
  const where = {
    role: "MEMBER" as const,
    status: "ACTIVE" as const,
    active: true,
    ...(commission ? { commission } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { company: { contains: q, mode: "insensitive" as const } },
            { position: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const members = await prisma.user.findMany({
    where,
    select: MEMBER_PUBLIC_SELECT,
    // Badged people first, then alphabetical. A directory that files the
    // founders between two advisors is sorted correctly and reads wrongly.
    orderBy: [{ badge: { sort: "asc", nulls: "last" } }, { name: "asc" }],
    take: 200,
  });

  const shown = members.map((m) => localizePerson(m, locale));

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">{t.directory.title}</h1>
        <p className="mt-1 text-gray-600">
          {count(t, t.directory.countOne, t.directory.count, members.length)}
        </p>
      </header>

      {/* GET, not a client component: the filter state lives in the URL, so a
          filtered view can be bookmarked, shared and reloaded, and it works
          before any JavaScript has run. */}
      <form method="GET" className="card mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label" htmlFor="q">{t.directory.searchLabel}</label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder={t.directory.searchPlaceholder}
            className="input"
          />
        </div>
        <div className="sm:w-72">
          <label className="label" htmlFor="commission">{t.directory.commission}</label>
          <select id="commission" name="commission" defaultValue={commission} className="input">
            <option value="">{t.directory.allCommissions}</option>
            {COMMISSIONS.map((c) => (
              <option key={c.slug} value={c.slug}>{commissionLabel(c.slug, t)}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary sm:w-auto">{t.common.filter}</button>
      </form>

      {members.length === 0 ? (
        // A search that finds nothing was a dead end: the filters that caused
        // it are still set, and the only way back was to clear them by hand.
        // The action does it in one click.
        <EmptyState
          icon="search"
          title={t.directory.noMatchTitle}
          body={t.directory.noMatch}
          action={{ href: "/portal/directory", label: t.directory.clearFilters }}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((m) => (
            <li key={m.id}>
              <Link
                href={`/portal/members/${m.id}`}
                className="card flex h-full gap-4 p-5 transition-shadow hover:shadow-md"
              >
                <Avatar name={m.name} src={m.image} size={56} />
                <div className="min-w-0">
                  {m.badge && (
                    <p className="mb-1 inline-block rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                      {m.badge}
                    </p>
                  )}
                  <p className="truncate font-semibold text-gray-900">{m.name}</p>
                  {m.position && <p className="truncate text-sm font-medium text-brand">{m.position}</p>}
                  {m.company && <p className="truncate text-sm text-gray-500">{m.company}</p>}
                  {m.commission && (
                    <p className="mt-2 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand">
                      {commissionLabel(m.commission, t)}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
