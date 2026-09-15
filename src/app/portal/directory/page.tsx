import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/session";
import { COMMISSIONS, MEMBER_PUBLIC_SELECT, commissionLabel } from "@/lib/portal";
import Avatar from "@/components/portal/Avatar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Annuaire", robots: { index: false } };

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: { q?: string; commission?: string };
}) {
  await requireMember();

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
    orderBy: { name: "asc" },
    take: 200,
  });

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">Annuaire</h1>
        <p className="mt-1 text-gray-600">
          {members.length} supporter{members.length === 1 ? "" : "s"} du réseau CDD Pays-Bas.
        </p>
      </header>

      {/* GET, not a client component: the filter state lives in the URL, so a
          filtered view can be bookmarked, shared and reloaded, and it works
          before any JavaScript has run. */}
      <form method="GET" className="card mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label" htmlFor="q">Rechercher</label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Nom, entreprise, fonction…"
            className="input"
          />
        </div>
        <div className="sm:w-72">
          <label className="label" htmlFor="commission">Commission</label>
          <select id="commission" name="commission" defaultValue={commission} className="input">
            <option value="">Toutes les commissions</option>
            {COMMISSIONS.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary sm:w-auto">Filtrer</button>
      </form>

      {members.length === 0 ? (
        <p className="card p-8 text-center text-gray-600">
          Aucun supporter ne correspond à cette recherche.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <li key={m.id}>
              <Link
                href={`/portal/members/${m.id}`}
                className="card flex h-full gap-4 p-5 transition-shadow hover:shadow-md"
              >
                <Avatar name={m.name} src={m.image} size={56} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">{m.name}</p>
                  {m.position && <p className="truncate text-sm text-gray-600">{m.position}</p>}
                  {m.company && <p className="truncate text-sm text-gray-500">{m.company}</p>}
                  {m.commission && (
                    <p className="mt-2 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand">
                      {commissionLabel(m.commission)}
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
