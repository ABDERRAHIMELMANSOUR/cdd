"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { str } from "@/lib/form-utils";

/**
 * Moderation queue actions.
 *
 * EDITOR is included alongside the two admin roles: moderating the feed is
 * editorial work, and a foundation whose only moderators are its two admins
 * has no moderation on the evenings they are not reading. What EDITOR cannot
 * do is anything in /admin/members — the role split stays meaningful.
 *
 * As everywhere in this app, the role is checked inside each action rather
 * than left to middleware. A server action is a POST endpoint with a stable
 * id; it can be called without ever loading the page middleware guards.
 */
const MODERATORS = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;

/** Put a post back in the feed. The reverse of the hide in the portal. */
export async function restorePost(fd: FormData) {
  await requireRole([...MODERATORS]);
  const id = str(fd, "id");
  if (!id) return;
  await prisma.communityPost.update({ where: { id }, data: { hidden: false } });
  revalidatePath("/admin/moderation");
  revalidatePath("/portal/feed");
}

/**
 * Destroy a post and, by cascade, its comments and likes.
 *
 * Hiding is the reversible action and is what the portal offers; this is the
 * end of the line, for content that should not sit in the database at all —
 * an AVG erasure request, or something nobody should have to read twice while
 * reviewing the queue.
 */
export async function purgePost(fd: FormData) {
  await requireRole([...MODERATORS]);
  const id = str(fd, "id");
  if (!id) return;
  await prisma.communityPost.delete({ where: { id } });
  revalidatePath("/admin/moderation");
  revalidatePath("/portal/feed");
}

export async function restoreComment(fd: FormData) {
  await requireRole([...MODERATORS]);
  const id = str(fd, "id");
  if (!id) return;

  // Restoring a comment onto a hidden post would put it nowhere: the post it
  // belongs to is not rendered, so the comment silently stays invisible and
  // the moderator is left thinking the action failed. Say so instead.
  const comment = await prisma.communityComment.findUnique({
    where: { id },
    select: { post: { select: { hidden: true } } },
  });
  if (!comment) return;
  if (comment.post.hidden) {
    throw new Error("Restaurez d'abord la publication à laquelle ce commentaire répond.");
  }

  await prisma.communityComment.update({ where: { id }, data: { hidden: false } });
  revalidatePath("/admin/moderation");
  revalidatePath("/portal/feed");
}

export async function purgeComment(fd: FormData) {
  await requireRole([...MODERATORS]);
  const id = str(fd, "id");
  if (!id) return;
  await prisma.communityComment.delete({ where: { id } });
  revalidatePath("/admin/moderation");
  revalidatePath("/portal/feed");
}
