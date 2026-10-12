"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireMember, isStaff } from "@/lib/session";
import { getT } from "@/i18n/locale";
import { fmt } from "@/i18n/portal";
import { MEET_URL, MEETING_TIME_ZONE, canContact, findConnection } from "@/lib/connections";

/*
 * Connections and meeting requests.
 *
 * As everywhere in the portal, the acting user is the session, never a form
 * field, and every rule is enforced here rather than by what the page shows:
 * a server action is a POST endpoint anyone signed in can call directly.
 */

/** After a decline, the same person may not ask again for this long. */
const REASK_AFTER_DAYS = 30;

function refresh(otherId?: string) {
  revalidatePath("/portal", "layout"); // nav badge
  revalidatePath("/portal/network");
  if (otherId) revalidatePath(`/portal/members/${otherId}`);
}

/** Someone who can be connected to: an active account in good standing. */
async function reachable(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, status: true, active: true },
  });
  if (!user || !user.active) return null;
  if (!isStaff(user.role) && user.status !== "ACTIVE") return null;
  return user;
}

// ─── Connections ─────────────────────────────────────────────────────────────

export async function requestConnection(formData: FormData): Promise<void> {
  const me = await requireMember();
  const to = String(formData.get("to") ?? "");
  if (!to || to === me.id) return;
  const other = await reachable(to);
  if (!other) return;

  const row = await findConnection(me.id, other.id);

  if (!row) {
    await prisma.connection.create({ data: { requesterId: me.id, addresseeId: other.id } });
  } else if (row.status === "PENDING" && row.addresseeId === me.id) {
    // They already asked me: asking back is a yes.
    await prisma.connection.update({
      where: { id: row.id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    });
  } else if (row.status === "DECLINED") {
    // A decline is respected for a while, so a refusal cannot be answered by
    // asking again every minute. After that, either side may ask afresh.
    const since = row.respondedAt ?? row.createdAt;
    const cooled = Date.now() - since.getTime() > REASK_AFTER_DAYS * 86400e3;
    if (row.requesterId === me.id && !cooled) return;
    await prisma.connection.update({
      where: { id: row.id },
      data: { requesterId: me.id, addresseeId: other.id, status: "PENDING", createdAt: new Date(), respondedAt: null },
    });
  }
  // PENDING from me, or ACCEPTED: nothing to do.

  refresh(other.id);
}

export async function respondConnection(formData: FormData): Promise<void> {
  const me = await requireMember();
  const id = String(formData.get("id") ?? "");
  const accept = formData.get("decision") === "accept";

  const row = await prisma.connection.findUnique({ where: { id } });
  // Only the person who was asked can answer, and only once.
  if (!row || row.addresseeId !== me.id || row.status !== "PENDING") return;

  await prisma.connection.update({
    where: { id },
    data: { status: accept ? "ACCEPTED" : "DECLINED", respondedAt: new Date() },
  });
  refresh(row.requesterId);
}

/** Withdraws a request I sent, or ends a connection either of us made. */
export async function removeConnection(formData: FormData): Promise<void> {
  const me = await requireMember();
  const id = String(formData.get("id") ?? "");

  const row = await prisma.connection.findUnique({ where: { id } });
  if (!row) return;
  const mine = row.requesterId === me.id || row.addresseeId === me.id;
  // A pending request can be withdrawn only by the one who sent it; declining
  // is the other side's answer, and it is kept so the cool-off applies.
  const allowed =
    mine && (row.status === "ACCEPTED" || (row.status === "PENDING" && row.requesterId === me.id));
  if (!allowed) return;

  await prisma.connection.delete({ where: { id } });
  refresh(row.requesterId === me.id ? row.addresseeId : row.requesterId);
}

// ─── Meetings ────────────────────────────────────────────────────────────────

export type MeetingState = { ok?: boolean; error?: string };

const MeetingSchema = z.object({
  to: z.string().min(1),
  // Sent by the browser as an ISO instant (converted from the reader's local
  // time there), so the server never has to guess a time zone.
  startsAt: z.string().datetime({ offset: true }),
  duration: z.coerce.number().refine((n) => [30, 45, 60].includes(n)),
  note: z.string().trim().max(500).optional(),
});

export async function requestMeeting(_prev: MeetingState, formData: FormData): Promise<MeetingState> {
  const me = await requireMember();
  const { t } = getT();

  const parsed = MeetingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: t.errors.meetingInvalid };
  const d = parsed.data;

  const startsAt = new Date(d.startsAt);
  const now = Date.now();
  if (startsAt.getTime() < now + 15 * 60e3) return { error: t.errors.meetingPast };
  if (startsAt.getTime() > now + 365 * 86400e3) return { error: t.errors.meetingInvalid };

  const other = await reachable(d.to);
  if (!other || other.id === me.id) return { error: t.errors.cannotReceive };
  if (!(await canContact(me, other))) return { error: t.errors.notConnected };

  // A handful of open proposals to one person is plenty; more is pressure.
  const open = await prisma.meetingRequest.count({
    where: { requesterId: me.id, recipientId: other.id, status: "PENDING" },
  });
  if (open >= 3) return { error: t.errors.meetingTooMany };

  await prisma.meetingRequest.create({
    data: {
      requesterId: me.id,
      recipientId: other.id,
      startsAt,
      durationMin: d.duration,
      note: d.note ? d.note : null,
    },
  });

  refresh(other.id);
  return { ok: true };
}

export async function respondMeeting(_prev: MeetingState, formData: FormData): Promise<MeetingState> {
  const me = await requireMember();
  const { t, locale } = getT();

  const id = String(formData.get("id") ?? "");
  const accept = formData.get("decision") === "accept";

  const row = await prisma.meetingRequest.findUnique({ where: { id } });
  if (!row || row.recipientId !== me.id || row.status !== "PENDING") return { error: t.errors.invalid };

  if (!accept) {
    await prisma.meetingRequest.update({
      where: { id },
      data: { status: "DECLINED", respondedAt: new Date() },
    });
    refresh(row.requesterId);
    return { ok: true };
  }

  if (row.startsAt.getTime() < Date.now()) return { error: t.errors.meetingPast };

  const meetUrl = String(formData.get("meetUrl") ?? "").trim();
  if (!MEET_URL.test(meetUrl)) return { error: t.errors.meetUrl };

  await prisma.meetingRequest.update({
    where: { id },
    data: { status: "ACCEPTED", meetUrl, respondedAt: new Date() },
  });

  // The confirmation also lands in their conversation, so the link is where
  // the other person already looks for news from this contact.
  const when = new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: MEETING_TIME_ZONE,
  }).format(row.startsAt);
  await prisma.message.create({
    data: {
      senderId: me.id,
      receiverId: row.requesterId,
      content: fmt(t.network.acceptedMessage, { when, url: meetUrl }),
    },
  });

  refresh(row.requesterId);
  revalidatePath(`/portal/messages/${row.requesterId}`);
  return { ok: true };
}

/** Either side may call off a meeting; the requester may also withdraw a proposal. */
export async function cancelMeeting(formData: FormData): Promise<void> {
  const me = await requireMember();
  const id = String(formData.get("id") ?? "");

  const row = await prisma.meetingRequest.findUnique({ where: { id } });
  if (!row) return;
  const allowed =
    (row.status === "PENDING" && row.requesterId === me.id) ||
    (row.status === "ACCEPTED" && (row.requesterId === me.id || row.recipientId === me.id));
  if (!allowed) return;

  await prisma.meetingRequest.update({ where: { id }, data: { status: "CANCELLED", respondedAt: new Date() } });
  refresh(row.requesterId === me.id ? row.recipientId : row.requesterId);
}
