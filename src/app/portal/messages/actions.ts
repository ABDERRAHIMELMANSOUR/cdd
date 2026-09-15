"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireMember, isStaff } from "@/lib/session";

const SendSchema = z.object({
  to: z.string().min(1),
  content: z
    .string()
    .trim()
    .min(1, "Votre message est vide.")
    .max(5000, "Un message est limité à 5000 caractères."),
});

export type MessageState = { ok?: boolean; error?: string };

/**
 * Who may be written to.
 *
 * Deliberately not "anyone with an id". A suspended account, a supporter still
 * waiting on approval, or a deactivated login must not receive private mail —
 * they cannot read it, and a message that silently goes nowhere is worse than
 * a refusal. Staff are always reachable: someone has to be.
 */
async function recipientOrNull(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, role: true, status: true, active: true },
  });
  if (!user || !user.active) return null;
  if (!isStaff(user.role) && user.status !== "ACTIVE") return null;
  return user;
}

export async function sendMessage(_prev: MessageState, formData: FormData): Promise<MessageState> {
  const me = await requireMember();

  const parsed = SendSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Données invalides." };

  // The sender is the session, never the form — otherwise anyone could post a
  // message that arrives signed as someone else.
  if (parsed.data.to === me.id) return { error: "Vous ne pouvez pas vous écrire à vous-même." };

  const recipient = await recipientOrNull(parsed.data.to);
  if (!recipient) return { error: "Ce supporter ne peut pas recevoir de messages." };

  await prisma.message.create({
    data: { senderId: me.id, receiverId: recipient.id, content: parsed.data.content },
  });

  revalidatePath("/portal/messages");
  revalidatePath(`/portal/messages/${recipient.id}`);
  return { ok: true };
}

/**
 * Mark everything this person sent me as read.
 *
 * Scoped to `receiverId: me` so the query cannot touch anyone else's mail even
 * if an unexpected id arrives — the worst case is that it updates nothing.
 */
export async function markConversationRead(otherId: string): Promise<void> {
  const me = await requireMember();
  await prisma.message.updateMany({
    where: { senderId: otherId, receiverId: me.id, read: false },
    data: { read: true },
  });
}
