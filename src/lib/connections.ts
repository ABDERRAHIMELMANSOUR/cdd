import type { Connection, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/session";

/**
 * Connections between supporters, LinkedIn-style.
 *
 * One row per pair; `requesterId` records who asked. Messaging and meeting
 * requests between two supporters require an ACCEPTED row in either
 * direction. Staff (the secretariat) are exempt in both directions: they need
 * to reach any supporter, and a supporter needs to be able to answer them.
 */

/** Where the viewer stands with another person, from the viewer's side. */
export type ConnectionState =
  | { kind: "none" }
  | { kind: "outgoing"; id: string } // viewer asked, waiting
  | { kind: "incoming"; id: string } // they asked the viewer
  | { kind: "connected"; id: string };

/** The row linking two people, whichever of them asked. */
export function findConnection(a: string, b: string): Promise<Connection | null> {
  return prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId: a, addresseeId: b },
        { requesterId: b, addresseeId: a },
      ],
    },
  });
}

export function stateFor(viewerId: string, row: Connection | null): ConnectionState {
  if (!row || row.status === "DECLINED") return { kind: "none" };
  if (row.status === "ACCEPTED") return { kind: "connected", id: row.id };
  return row.requesterId === viewerId ? { kind: "outgoing", id: row.id } : { kind: "incoming", id: row.id };
}

export async function connectionState(viewerId: string, otherId: string): Promise<ConnectionState> {
  return stateFor(viewerId, await findConnection(viewerId, otherId));
}

/** True when these two may message each other or arrange a meeting. */
export async function canContact(
  viewer: { id: string; role: Role },
  other: { id: string; role: Role }
): Promise<boolean> {
  if (viewer.id === other.id) return false;
  if (isStaff(viewer.role) || isStaff(other.role)) return true;
  return (await connectionState(viewer.id, other.id)).kind === "connected";
}

/**
 * What is waiting on this person: connection requests to answer and meeting
 * requests to answer. Drives the badge on "Network" in the nav.
 */
export async function pendingForUser(userId: string): Promise<number> {
  const [connections, meetings] = await Promise.all([
    prisma.connection.count({ where: { addresseeId: userId, status: "PENDING" } }),
    prisma.meetingRequest.count({
      where: { recipientId: userId, status: "PENDING", startsAt: { gt: new Date() } },
    }),
  ]);
  return connections + meetings;
}

/** Meetings are shown in the network's own time zone, and labelled as such. */
export const MEETING_TIME_ZONE = "Europe/Amsterdam";

/**
 * A Google Meet room address: meet.google.com/abc-defg-hij. Anything else is
 * refused, so the link shared on acceptance cannot point somewhere unexpected.
 */
export const MEET_URL = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\?[^\s]*)?$/;
