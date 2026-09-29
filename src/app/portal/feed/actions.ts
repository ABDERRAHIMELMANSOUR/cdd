"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireMember, isStaff } from "@/lib/session";
import { getT } from "@/i18n/locale";
import type { Dictionary } from "@/i18n/portal";

/**
 * Community feed mutations.
 *
 * Every action starts with `requireMember()` — not as ceremony, but because a
 * server action is a POST endpoint with a stable id. Middleware decides who
 * may *navigate* to /portal; it has no say over who may *call* this. And
 * `requireMember` re-reads the database rather than trusting the JWT, so a
 * supporter suspended five minutes ago cannot still be posting.
 *
 * The author id always comes from that session and never from the form. A
 * hidden authorId field would be the entire authorisation model sitting in
 * markup the submitter controls.
 */

/** Only http(s): a `javascript:` link in a post is stored XSS aimed at the
 *  next supporter who clicks it, and `z.string().url()` accepts it happily. */
const linkUrl = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .max(500)
      .url("badLink")
      .refine((u) => /^https?:\/\//i.test(u), "linkScheme"),
  ])
  .optional();

const PostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "emptyPost")
    .max(5000, "postTooLong"),
  mediaUrl: linkUrl,
});

const CommentSchema = z.object({
  postId: z.string().min(1),
  content: z
    .string()
    .trim()
    .min(1, "emptyComment")
    .max(2000, "commentTooLong"),
});

export type FeedState = { ok?: boolean; error?: string };

/**
 * Zod schemas are built once at module load, long before a request exists, so
 * their messages cannot be translated in place. They carry a key instead, and
 * this resolves it against the reader's dictionary at request time.
 */
function message(t: Dictionary, code: string | undefined): string {
  const map: Record<string, string> = {
    emptyPost: t.errors.emptyPost,
    postTooLong: t.errors.postTooLong,
    emptyComment: t.errors.emptyComment,
    commentTooLong: t.errors.commentTooLong,
    badLink: t.errors.badLink,
    linkScheme: t.errors.linkScheme,
  };
  return (code && map[code]) || t.errors.invalid;
}

export async function createPost(_prev: FeedState, formData: FormData): Promise<FeedState> {
  const user = await requireMember();

  const { t } = getT();
  const parsed = PostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: message(t, parsed.error.issues[0]?.message) };

  await prisma.communityPost.create({
    data: {
      authorId: user.id,
      content: parsed.data.content,
      mediaUrl: parsed.data.mediaUrl || null,
    },
  });

  revalidatePath("/portal/feed");
  return { ok: true };
}

const RepostSchema = z.object({
  postId: z.string().min(1),
  content: z
    .string()
    .trim()
    .max(2000, "commentTooLong")
    .optional(),
});

/**
 * Share someone else's post, with or without a remark of your own.
 *
 * A repost is an ordinary post pointing at another, so it gets its own likes
 * and its own comments and appears in the feed in its own right.
 *
 * Reposting a repost points at the ORIGINAL rather than at the chain. Without
 * that, a post shared five times nests five deep and the card has to render a
 * russian doll; everyone is really sharing the same thing, so the pointer says
 * so. It also means the "already shared" check below cannot be defeated by
 * sharing someone else's share.
 */
export async function repost(_prev: FeedState, formData: FormData): Promise<FeedState> {
  const user = await requireMember();

  const { t } = getT();
  const parsed = RepostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: message(t, parsed.error.issues[0]?.message) };

  const source = await prisma.communityPost.findUnique({
    where: { id: parsed.data.postId },
    select: { id: true, hidden: true, authorId: true, repostOfId: true },
  });
  if (!source || source.hidden) return { error: t.errors.postGone };

  const originalId = source.repostOfId ?? source.id;

  if (originalId === parsed.data.postId && source.authorId === user.id) {
    return { error: t.errors.ownPost };
  }

  const already = await prisma.communityPost.findFirst({
    where: { authorId: user.id, repostOfId: originalId },
    select: { id: true },
  });
  if (already) return { error: t.errors.alreadyShared };

  await prisma.communityPost.create({
    data: {
      authorId: user.id,
      content: parsed.data.content ?? "",
      repostOfId: originalId,
    },
  });

  revalidatePath("/portal/feed");
  return { ok: true };
}

export async function addComment(_prev: FeedState, formData: FormData): Promise<FeedState> {
  const user = await requireMember();

  const { t } = getT();
  const parsed = CommentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: message(t, parsed.error.issues[0]?.message) };

  // A hidden post is moderated-away, not merely invisible: it must not keep
  // collecting replies that nobody will ever see.
  const post = await prisma.communityPost.findUnique({
    where: { id: parsed.data.postId },
    select: { id: true, hidden: true },
  });
  if (!post || post.hidden) return { error: t.errors.postGone };

  await prisma.communityComment.create({
    data: { postId: post.id, authorId: user.id, content: parsed.data.content },
  });

  revalidatePath("/portal/feed");
  return { ok: true };
}

/**
 * Like or unlike, decided from what is already in the table rather than from a
 * flag in the request.
 *
 * Letting the client say "this is a like" makes double-clicking, a retried
 * request or a stale page produce a second row — and the unique constraint on
 * (postId, authorId) then turns an ordinary race into a 500. Reading first and
 * catching the constraint violation means the button is idempotent: whatever
 * arrives, the end state is one like or none.
 */
export async function toggleLike(formData: FormData): Promise<void> {
  const user = await requireMember();
  const postId = String(formData.get("postId") ?? "");
  if (!postId) return;

  const existing = await prisma.communityLike.findUnique({
    where: { postId_authorId: { postId, authorId: user.id } },
    select: { id: true },
  });

  try {
    if (existing) {
      await prisma.communityLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.communityLike.create({ data: { postId, authorId: user.id } });
    }
  } catch {
    // Someone else's concurrent click already produced the state we wanted.
  }

  revalidatePath("/portal/feed");
}

/**
 * Removing a post.
 *
 * A supporter may delete their own. Staff may delete anyone's, because
 * moderation is the job — but staff *hide* rather than destroy, so the action
 * stays auditable rather than silently erasing the evidence of it. An author
 * deleting their own words has no such audit need.
 */
export async function removePost(formData: FormData): Promise<void> {
  const user = await requireMember();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const post = await prisma.communityPost.findUnique({
    where: { id },
    select: { authorId: true },
  });
  if (!post) return;

  if (post.authorId === user.id) {
    await prisma.communityPost.delete({ where: { id } });
  } else if (isStaff(user.role)) {
    await prisma.communityPost.update({ where: { id }, data: { hidden: true } });
  }

  revalidatePath("/portal/feed");
}

export async function removeComment(formData: FormData): Promise<void> {
  const user = await requireMember();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const comment = await prisma.communityComment.findUnique({
    where: { id },
    select: { authorId: true },
  });
  if (!comment) return;

  if (comment.authorId === user.id) {
    await prisma.communityComment.delete({ where: { id } });
  } else if (isStaff(user.role)) {
    await prisma.communityComment.update({ where: { id }, data: { hidden: true } });
  }

  revalidatePath("/portal/feed");
}
