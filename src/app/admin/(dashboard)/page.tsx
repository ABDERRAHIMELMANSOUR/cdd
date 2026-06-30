import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safe } from "@/lib/content";
import { StatCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const [advisors, leaders, events, projects, posts, partners, packages, submissions] = await Promise.all([
    safe(() => prisma.advisor.count(), 0),
    safe(() => prisma.leader.count(), 0),
    safe(() => prisma.event.count(), 0),
    safe(() => prisma.project.count(), 0),
    safe(() => prisma.post.count(), 0),
    safe(() => prisma.partner.count(), 0),
    safe(() => prisma.package.count(), 0),
    safe(() => prisma.submission.count({ where: { handled: false } }), 0),
  ]);

  const recent = await safe(
    () => prisma.submission.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    []
  );

  return (
    <>
      <h1 className="mb-1 font-display text-2xl font-bold text-gray-900">Tableau de bord</h1>
      <p className="mb-6 text-sm text-gray-500">Bienvenue dans l'administration du CDD Pays-Bas.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Conseillers" value={advisors} href="/admin/advisors" />
        <StatCard label="Direction" value={leaders} href="/admin/leaders" />
        <StatCard label="Événements" value={events} href="/admin/events" />
        <StatCard label="Projets" value={projects} href="/admin/projects" />
        <StatCard label="Articles" value={posts} href="/admin/posts" />
        <StatCard label="Partenaires" value={partners} href="/admin/partners" />
        <StatCard label="Packages" value={packages} href="/admin/packages" />
        <StatCard label="Messages non lus" value={submissions} href="/admin/submissions" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Derniers messages</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400">Aucun message pour le moment.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{s.name}</p>
                    <p className="text-gray-400">{s.email}</p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand">{s.type}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/submissions" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
            Voir tous les messages →
          </Link>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">Raccourcis</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link href="/admin/advisors/new" className="rounded-lg bg-brand-50 px-3 py-2 text-brand hover:bg-brand/10">+ Conseiller</Link>
            <Link href="/admin/events/new" className="rounded-lg bg-brand-50 px-3 py-2 text-brand hover:bg-brand/10">+ Événement</Link>
            <Link href="/admin/posts/new" className="rounded-lg bg-brand-50 px-3 py-2 text-brand hover:bg-brand/10">+ Article</Link>
            <Link href="/admin/projects/new" className="rounded-lg bg-brand-50 px-3 py-2 text-brand hover:bg-brand/10">+ Projet</Link>
            <Link href="/admin/pages" className="rounded-lg bg-brand-50 px-3 py-2 text-brand hover:bg-brand/10">Éditer les pages</Link>
            <Link href="/admin/settings" className="rounded-lg bg-brand-50 px-3 py-2 text-brand hover:bg-brand/10">Paramètres</Link>
          </div>
        </div>
      </div>
    </>
  );
}
