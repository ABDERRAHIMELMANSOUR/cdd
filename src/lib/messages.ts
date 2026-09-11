import { prisma } from "@/lib/prisma";
import { AUTHOR_SELECT } from "@/lib/portal";

export type Conversation = {
  other: {
    id: string;
    name: string;
    image: string | null;
    position: string | null;
    company: string | null;
  };
  lastMessage: string;
  lastAt: Date;
  outgoing: boolean;
  unread: number;
};

/**
 * The inbox, derived rather than stored.
 *
 * ── WHY THERE IS NO Conversation TABLE ───────────────────────────────────────
 * A 1-to-1 thread is fully determined by the pair of people in it, so a
 * conversation row would carry no information the messages do not already
 * hold — while adding a second place for the two to disagree (a thread whose
 * `lastMessageAt` drifts from its newest message is a bug that only shows up
 * as a mis-sorted inbox weeks later). What a table would buy is efficiency at
 * a scale this foundation is nowhere near.
 *
 * ── WHY THIS GROUPS IN JS ────────────────────────────────────────────────────
 * "The newest message per counterparty" is a window function, which Prisma
 * cannot express without dropping to raw SQL. So this reads a bounded slice of
 * recent messages and folds it in memory. The bound is the honest part: with
 * SCAN_LIMIT messages read, a conversation that has had no activity within the
 * most recent SCAN_LIMIT messages *across the whole account* would fall off
 * the list. At hundreds of supporters that is not reachable; if it ever is,
 * this is the function to replace with a raw DISTINCT ON query, and nothing
 * that calls it needs to change.
 */
const SCAN_LIMIT = 500;

export async function listConversations(meId: string): Promise<Conversation[]> {
  const [messages, unreadGroups] = await Promise.all([
    prisma.message.findMany({
      where: { OR: [{ senderId: meId }, { receiverId: meId }] },
      orderBy: { createdAt: "desc" },
      take: SCAN_LIMIT,
      select: {
        content: true,
        createdAt: true,
        senderId: true,
        receiverId: true,
      },
    }),
    // Counted in the database rather than from the slice above: an unread
    // count derived from a truncated scan would quietly under-report.
    prisma.message.groupBy({
      by: ["senderId"],
      where: { receiverId: meId, read: false },
      _count: { _all: true },
    }),
  ]);

  const unreadBySender = new Map(unreadGroups.map((g) => [g.senderId, g._count._all]));

  // Messages arrive newest-first, so the first time a counterparty is seen is
  // their latest message; later ones are skipped.
  const latest = new Map<string, { content: string; createdAt: Date; outgoing: boolean }>();
  for (const m of messages) {
    const otherId = m.senderId === meId ? m.receiverId : m.senderId;
    if (latest.has(otherId)) continue;
    latest.set(otherId, {
      content: m.content,
      createdAt: m.createdAt,
      outgoing: m.senderId === meId,
    });
  }

  if (latest.size === 0) return [];

  const others = await prisma.user.findMany({
    where: { id: { in: [...latest.keys()] } },
    select: AUTHOR_SELECT,
  });
  const byId = new Map(others.map((o) => [o.id, o]));

  return [...latest.entries()]
    // A deleted account leaves its messages behind via cascade only if the row
    // survives; skip anything we cannot name rather than rendering "undefined".
    .flatMap(([id, last]) => {
      const other = byId.get(id);
      if (!other) return [];
      return [
        {
          other,
          lastMessage: last.content,
          lastAt: last.createdAt,
          outgoing: last.outgoing,
          unread: unreadBySender.get(id) ?? 0,
        },
      ];
    })
    .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
}

/** Total unread, for the badge in the portal navigation. */
export async function unreadCount(meId: string): Promise<number> {
  return prisma.message.count({ where: { receiverId: meId, read: false } });
}
