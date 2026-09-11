import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/session";
import { MEMBER_PUBLIC_SELECT } from "@/lib/portal";
import Avatar from "@/components/portal/Avatar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Espace donateurs", robots: { index: false } };

export default async function PortalHome() {
  const user = await requireMember();

  const [memberCount, recent] = await Promise.all([
    prisma.user.count({ where: { role: "MEMBER", status: "ACTIVE", active: true } }),
    prisma.user.findMany({
      where: { role: "MEMBER", status: "ACTIVE", active: true },
      select: MEMBER_PUBLIC_SELECT,
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">
          Bonjour {user.name?.split(" ")[0] ?? ""}
        </h1>
        <p className="mt-1 text-gray-600">
          Le réseau privé des donateurs de CDD Pays-Bas.
        </p>
      </header>

      {/*
        The feed, messaging and moderation are the next passes. This says so
        rather than showing an empty box that looks broken — a placeholder that
        explains itself is honest; one that pretends to be a feature is not.
      */}
      <section className="card border-dashed p-6 text-center">
        <h2 className="font-display text-lg font-semibold text-gray-900">
          Le fil d&apos;actualité arrive
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-gray-600">
          Publications, réactions et messagerie directe sont en cours de développement.
          L&apos;annuaire et les profils sont déjà disponibles.
        </p>
        <Link href="/portal/directory" className="btn-primary mt-5 inline-block">
          Parcourir l&apos;annuaire
        </Link>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold text-gray-900">
            Derniers donateurs ({memberCount})
          </h2>
          <Link href="/portal/directory" className="text-sm text-brand hover:underline">
            Tout voir
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="card p-6 text-sm text-gray-600">
            Aucun donateur actif pour le moment.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/portal/members/${m.id}`}
                  className="card flex h-full items-center gap-4 p-4 transition-shadow hover:shadow-md"
                >
                  <Avatar name={m.name} src={m.image} size={44} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">{m.name}</p>
                    {m.company && <p className="truncate text-sm text-gray-500">{m.company}</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
