import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireMember } from "@/lib/session";
import { AUTHOR_SELECT } from "@/lib/portal";
import { MEETING_TIME_ZONE } from "@/lib/connections";
import { localizePerson } from "@/lib/localize";
import { getT } from "@/i18n/locale";
import { fmt, type Dictionary, type Locale } from "@/i18n/portal";
import Avatar from "@/components/portal/Avatar";
import EmptyState from "@/components/portal/EmptyState";
import RespondMeetingForm from "@/components/portal/RespondMeetingForm";
import ConfirmSubmit from "../feed/ConfirmSubmit";
import { respondConnection, removeConnection, cancelMeeting } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = getT();
  return { title: t.network.title, robots: { index: false } };
}

type Person = { id: string; name: string; image: string | null; position: string | null; company: string | null; badge: string | null };

/** Meetings are shown in Amsterdam time, and say so: the network is Dutch,
 *  and a supporter travelling should not have to guess whose clock it is. */
function when(d: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: MEETING_TIME_ZONE,
  }).format(d);
}

function PersonLine({ p, locale, children }: { p: Person; locale: Locale; children?: React.ReactNode }) {
  const shown = localizePerson(p, locale);
  const sub = [shown.position, shown.company].filter(Boolean).join(" · ");
  return (
    <div className="flex items-start gap-3">
      <Link href={`/portal/members/${p.id}`}>
        <Avatar name={p.name} src={p.image} size={44} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/portal/members/${p.id}`} className="font-medium text-gray-900 hover:text-brand">
          {p.name}
        </Link>
        {sub && <p className="truncate text-sm text-gray-500">{sub}</p>}
        {children}
      </div>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-semibold text-gray-900">
        {title} <span className="text-sm font-normal text-gray-400">({count})</span>
      </h2>
      <ul className="space-y-3">{children}</ul>
    </section>
  );
}

function MeetingInfo({ m, locale, t }: { m: { startsAt: Date; durationMin: number; note: string | null }; locale: Locale; t: Dictionary }) {
  return (
    <>
      <p className="mt-1 text-sm font-medium text-gray-800">
        {when(m.startsAt, locale)} · {m.durationMin} min{" "}
        <span className="font-normal text-gray-500">({t.network.amsterdamTime})</span>
      </p>
      {m.note && <p className="mt-1 whitespace-pre-line text-sm text-gray-600">“{m.note}”</p>}
    </>
  );
}

export default async function NetworkPage() {
  const me = await requireMember();
  const { locale, t } = getT();
  const now = new Date();
  // A meeting stays under "upcoming" until it has had time to end.
  const recent = new Date(now.getTime() - 60 * 60e3);

  const [incomingConn, outgoingConn, accepted, incomingMeet, outgoingMeet, upcoming] = await Promise.all([
    prisma.connection.findMany({
      where: { addresseeId: me.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, requester: { select: AUTHOR_SELECT } },
    }),
    prisma.connection.findMany({
      where: { requesterId: me.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      select: { id: true, addressee: { select: AUTHOR_SELECT } },
    }),
    prisma.connection.findMany({
      where: { status: "ACCEPTED", OR: [{ requesterId: me.id }, { addresseeId: me.id }] },
      orderBy: { respondedAt: "desc" },
      select: { id: true, requesterId: true, requester: { select: AUTHOR_SELECT }, addressee: { select: AUTHOR_SELECT } },
    }),
    prisma.meetingRequest.findMany({
      where: { recipientId: me.id, status: "PENDING", startsAt: { gt: now } },
      orderBy: { startsAt: "asc" },
      select: { id: true, startsAt: true, durationMin: true, note: true, requester: { select: AUTHOR_SELECT } },
    }),
    prisma.meetingRequest.findMany({
      where: { requesterId: me.id, status: "PENDING", startsAt: { gt: now } },
      orderBy: { startsAt: "asc" },
      select: { id: true, startsAt: true, durationMin: true, note: true, recipient: { select: AUTHOR_SELECT } },
    }),
    prisma.meetingRequest.findMany({
      where: {
        status: "ACCEPTED",
        startsAt: { gt: recent },
        OR: [{ requesterId: me.id }, { recipientId: me.id }],
      },
      orderBy: { startsAt: "asc" },
      select: {
        id: true,
        startsAt: true,
        durationMin: true,
        note: true,
        meetUrl: true,
        requesterId: true,
        requester: { select: AUTHOR_SELECT },
        recipient: { select: AUTHOR_SELECT },
      },
    }),
  ]);

  const total =
    incomingConn.length + outgoingConn.length + accepted.length + incomingMeet.length + outgoingMeet.length + upcoming.length;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">{t.network.title}</h1>
        <p className="mt-1 text-sm text-gray-600">{t.network.subtitle}</p>
      </header>

      {total === 0 && (
        <EmptyState
          icon="directory"
          title={t.network.emptyTitle}
          body={t.network.empty}
          action={{ href: "/portal/directory", label: t.messages.browse }}
        />
      )}

      <Section title={t.network.meetingRequests} count={incomingMeet.length}>
        {incomingMeet.map((m) => (
          <li key={m.id} className="card p-4">
            <PersonLine p={m.requester} locale={locale}>
              <MeetingInfo m={m} locale={locale} t={t} />
              <RespondMeetingForm id={m.id} t={t} />
            </PersonLine>
          </li>
        ))}
      </Section>

      <Section title={t.network.upcoming} count={upcoming.length}>
        {upcoming.map((m) => {
          const other = m.requesterId === me.id ? m.recipient : m.requester;
          return (
            <li key={m.id} className="card p-4">
              <PersonLine p={other} locale={locale}>
                <MeetingInfo m={m} locale={locale} t={t} />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {m.meetUrl && (
                    <a href={m.meetUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                      {t.network.join}
                    </a>
                  )}
                  <ConfirmSubmit action={cancelMeeting} confirm={t.network.confirmCancelMeeting}>
                    <input type="hidden" name="id" value={m.id} />
                    <button className="btn-ghost">{t.network.cancelMeeting}</button>
                  </ConfirmSubmit>
                </div>
              </PersonLine>
            </li>
          );
        })}
      </Section>

      <Section title={t.network.requests} count={incomingConn.length}>
        {incomingConn.map((c) => (
          <li key={c.id} className="card p-4">
            <PersonLine p={c.requester} locale={locale}>
              <div className="mt-3 flex gap-2">
                <form action={respondConnection}>
                  <input type="hidden" name="id" value={c.id} />
                  <button name="decision" value="accept" className="btn-primary">{t.network.accept}</button>
                </form>
                <form action={respondConnection}>
                  <input type="hidden" name="id" value={c.id} />
                  <button name="decision" value="decline" className="btn-ghost">{t.network.decline}</button>
                </form>
              </div>
            </PersonLine>
          </li>
        ))}
      </Section>

      <Section title={t.network.connections} count={accepted.length}>
        {accepted.map((c) => {
          const other = c.requesterId === me.id ? c.addressee : c.requester;
          return (
            <li key={c.id} className="card p-4">
              <PersonLine p={other} locale={locale}>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/portal/messages/${other.id}`} className="btn-primary">{t.profile.message}</Link>
                  <Link href={`/portal/members/${other.id}`} className="btn-outline">{t.network.requestMeeting}</Link>
                  <ConfirmSubmit action={removeConnection} confirm={fmt(t.network.confirmRemove, { name: other.name })}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="btn-ghost">{t.network.remove}</button>
                  </ConfirmSubmit>
                </div>
              </PersonLine>
            </li>
          );
        })}
      </Section>

      <Section title={t.network.sent} count={outgoingConn.length + outgoingMeet.length}>
        {outgoingMeet.map((m) => (
          <li key={m.id} className="card p-4">
            <PersonLine p={m.recipient} locale={locale}>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{t.network.meetingProposed}</p>
              <MeetingInfo m={m} locale={locale} t={t} />
              <ConfirmSubmit action={cancelMeeting} confirm={t.network.confirmWithdraw} className="mt-2">
                <input type="hidden" name="id" value={m.id} />
                <button className="btn-ghost">{t.network.withdraw}</button>
              </ConfirmSubmit>
            </PersonLine>
          </li>
        ))}
        {outgoingConn.map((c) => (
          <li key={c.id} className="card p-4">
            <PersonLine p={c.addressee} locale={locale}>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{t.network.requestSent}</p>
              <ConfirmSubmit action={removeConnection} confirm={t.network.confirmWithdraw} className="mt-2">
                <input type="hidden" name="id" value={c.id} />
                <button className="btn-ghost">{t.network.withdraw}</button>
              </ConfirmSubmit>
            </PersonLine>
          </li>
        ))}
      </Section>
    </div>
  );
}
