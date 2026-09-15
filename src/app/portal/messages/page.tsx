import Link from "next/link";
import { requireMember } from "@/lib/session";
import { safe } from "@/lib/content";
import { listConversations } from "@/lib/messages";
import { timeAgo } from "@/lib/portal";
import Avatar from "@/components/portal/Avatar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages", robots: { index: false } };

export default async function Inbox() {
  const me = await requireMember();
  const conversations = await safe(() => listConversations(me.id), []);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Messages</h1>
          <p className="mt-1 text-sm text-gray-600">Vos échanges privés avec les supporters.</p>
        </div>
        <Link href="/portal/directory" className="text-sm text-brand hover:underline">
          Écrire à quelqu&apos;un
        </Link>
      </header>

      {conversations.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-gray-600">Aucune conversation pour le moment.</p>
          <Link href="/portal/directory" className="btn-primary mt-5 inline-block">
            Parcourir l&apos;annuaire
          </Link>
        </div>
      ) : (
        <ul className="card divide-y divide-gray-100 overflow-hidden">
          {conversations.map((c) => (
            <li key={c.other.id}>
              <Link
                href={`/portal/messages/${c.other.id}`}
                className="flex items-center gap-3 p-4 transition-colors hover:bg-gray-50"
              >
                <Avatar name={c.other.name} src={c.other.image} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p
                      className={`truncate ${
                        c.unread > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-800"
                      }`}
                    >
                      {c.other.name}
                    </p>
                    <span className="ml-auto shrink-0 text-xs text-gray-400">
                      {timeAgo(c.lastAt)}
                    </span>
                  </div>
                  <p
                    className={`truncate text-sm ${
                      c.unread > 0 ? "text-gray-800" : "text-gray-500"
                    }`}
                  >
                    {/* Saying which way the last message went stops the inbox
                        reading as if everyone else spoke last. */}
                    {c.outgoing && <span className="text-gray-400">Vous : </span>}
                    {c.lastMessage}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span
                    className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-brand px-1.5 text-xs font-semibold text-white"
                    aria-label={`${c.unread} message${c.unread > 1 ? "s" : ""} non lu${c.unread > 1 ? "s" : ""}`}
                  >
                    {c.unread}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
