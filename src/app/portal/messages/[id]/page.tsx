import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireMember, isStaff } from "@/lib/session";
import { AUTHOR_SELECT, timeAgo } from "@/lib/portal";
import type { Locale } from "@/i18n/portal";
import Avatar from "@/components/portal/Avatar";
import MessageComposer from "../MessageComposer";
import { getT } from "@/i18n/locale";
import { localizePerson } from "@/lib/localize";
import { markConversationRead } from "../actions";

export const dynamic = "force-dynamic";

/** The tail of the thread. Older messages stay in the database; this window is
 *  what a conversation page needs to be useful without loading years of it. */
const WINDOW = 100;

export default async function Conversation({ params }: { params: { id: string } }) {
  const me = await requireMember();
  const { locale, t } = getT();

  if (params.id === me.id) notFound();

  const other = await prisma.user.findUnique({
    where: { id: params.id },
    select: { ...AUTHOR_SELECT, role: true, status: true, active: true },
  });

  // Same rule as the send action: a suspended or pending account is not a
  // correspondent. Rendering the thread but refusing the send would be a
  // window that looks usable and is not.
  const reachable =
    other && other.active && (isStaff(other.role) || other.status === "ACTIVE");
  if (!other || !reachable) notFound();

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: me.id, receiverId: other.id },
        { senderId: other.id, receiverId: me.id },
      ],
    },
    // id breaks ties. Two messages can share a createdAt — the seed proved it,
    // and so can two sends in the same millisecond — and without a second key
    // Postgres is free to return them in either order, so a reply can render
    // above the message it answers.
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: WINDOW,
    select: { id: true, content: true, createdAt: true, senderId: true },
  });

  // Opening the thread IS reading it. Awaited rather than fired and forgotten,
  // so the badge in the navigation is already correct when this page paints —
  // a count that clears one navigation late reads as a bug.
  await markConversationRead(other.id);

  // Fetched newest-first so the window is the tail; displayed oldest-first
  // because that is how a conversation reads.
  const thread = [...messages].reverse();

  /*
   * Date separators. A long thread is otherwise an unbroken column of bubbles
   * where "il y a 3 h" and "il y a 3 j" look alike at a glance, and there is
   * no way to see that a conversation paused for a week. The separator is
   * drawn when the day changes, so a single-day thread gets exactly one.
   */
  const dayLabel = new Intl.DateTimeFormat(locale as Locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const shownOther = localizePerson(other, locale as Locale);
  const sub = [shownOther.position, shownOther.company].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card flex h-[calc(100vh-11rem)] min-h-[26rem] flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-gray-100 p-3 sm:p-4">
          <Link
            href="/portal/messages"
            className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:text-brand"
            aria-label={t.messages.back}
          >
            ←
          </Link>
          <Link href={`/portal/members/${other.id}`} className="flex min-w-0 items-center gap-3">
            <Avatar name={other.name} src={other.image} size={40} />
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900">{other.name}</p>
              {sub && <p className="truncate text-xs text-gray-500">{sub}</p>}
            </div>
          </Link>
        </header>

        {/* flex-col-reverse pins the newest message to the bottom and starts
            the scroll there, which is where a chat should open — no scripted
            scroll-to-bottom, and no jump after hydration. The list is reversed
            to compensate. */}
        <div className="flex flex-1 flex-col-reverse overflow-y-auto p-3 sm:p-4">
          <ul className="space-y-2">
            {thread.length === 0 ? (
              <li className="py-8 text-center text-sm text-gray-500">
                {t.messages.noMessages}
              </li>
            ) : (
              thread.map((m, i) => {
                const mine = m.senderId === me.id;
                const newDay = i === 0 || dayKey(thread[i - 1].createdAt) !== dayKey(m.createdAt);
                return (
                  <li key={m.id}>
                    {newDay && (
                      <p className="my-4 text-center text-xs font-medium text-gray-400">
                        {dayLabel.format(m.createdAt)}
                      </p>
                    )}
                    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
                        mine
                          ? "rounded-br-sm bg-brand text-white"
                          : "rounded-bl-sm bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm">{m.content}</p>
                      <p className={`mt-1 text-[11px] ${mine ? "text-white/70" : "text-gray-400"}`}>
                        {timeAgo(m.createdAt, t)}
                      </p>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <MessageComposer to={other.id} name={other.name} t={t} />
      </div>
    </div>
  );
}
