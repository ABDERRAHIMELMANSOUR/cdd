import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/session";
import { MEMBER_PUBLIC_SELECT } from "@/lib/portal";
import Avatar from "@/components/portal/Avatar";
import { getT } from "@/i18n/locale";
import { fmt } from "@/i18n/portal";

export const dynamic = "force-dynamic";
// The tab title follows the reader's language like everything else.
export async function generateMetadata() {
  const { t } = getT();
  return { title: t.login.title, robots: { index: false } };
}

export default async function PortalHome() {
  const user = await requireMember();
  const { t } = getT();

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
          {fmt(t.home.greeting, { name: user.name?.split(" ")[0] ?? "" })}
        </h1>
        <p className="mt-1 text-gray-600">
          {t.home.subtitle}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/portal/feed", title: t.home.feedTitle, body: t.home.feedBody },
          { href: "/portal/messages", title: t.home.messagesTitle, body: t.home.messagesBody },
          { href: "/portal/events", title: t.home.eventsTitle, body: t.home.eventsBody },
          { href: "/portal/directory", title: t.home.directoryTitle, body: t.home.directoryBody },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="card p-5 transition-shadow hover:shadow-md">
            <h2 className="font-display text-base font-semibold text-gray-900">{c.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{c.body}</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold text-gray-900">
            {fmt(t.home.latest, { n: memberCount })}
          </h2>
          <Link href="/portal/directory" className="text-sm text-brand hover:underline">
            {t.home.seeAll}
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="card p-6 text-sm text-gray-600">
            {t.home.noneYet}
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
